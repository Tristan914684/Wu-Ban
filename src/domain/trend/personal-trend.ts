import type { SessionMode } from "../chart/session-chart";
import type { SessionMeasures } from "../scoring/session-score";
import type { SessionSummary } from "../session/session-summary";

export const TREND_RULE_VERSION = 1 as const;

export type MetricFamily =
  | "beat"
  | "shape"
  | "flow"
  | "memory";

export type TrendStatus =
  | "insufficient-history"
  | "baseline-ready"
  | "usual-range"
  | "sustained-shift";

export type PerformanceTrend = "stable" | "declined" | "improving";

export interface MetricBaseline {
  readonly median: number;
  readonly medianAbsoluteDeviation: number;
  readonly unfavourableThreshold: number;
  readonly improvementThreshold: number;
}

export interface RecentTrendSession {
  readonly sessionId: string;
  readonly completedAt: string;
  readonly shiftedFamilies: readonly MetricFamily[];
  readonly improvingFamilies: readonly MetricFamily[];
}

export type MetricPatternStatus =
  | "collecting"
  | "within-usual-range"
  | "repeated-decline"
  | "repeated-improvement";

export interface MetricTrendEvidence {
  readonly baselineMedian: number;
  readonly recentMedian: number | null;
  readonly changeFromBaseline: number | null;
  readonly shiftedRecentSessionCount: number;
  readonly improvedRecentSessionCount: number;
  readonly status: MetricPatternStatus;
}

export interface TrendAnalysisWindow {
  readonly startedAt: string;
  readonly endedAt: string;
  readonly dayCount: number;
}

export interface TrendReport {
  readonly ruleVersion: typeof TREND_RULE_VERSION;
  readonly eventId: string;
  readonly mode: SessionMode;
  readonly simulated: boolean;
  readonly status: TrendStatus;
  readonly performanceTrend: PerformanceTrend;
  readonly validSessionCount: number;
  readonly sessionsNeeded: number;
  readonly baselineSessionIds: readonly string[];
  readonly recentSessions: readonly RecentTrendSession[];
  readonly analysisWindow: TrendAnalysisWindow | null;
  readonly baselines: Readonly<Record<MetricFamily, MetricBaseline>> | null;
  readonly metricEvidence: Readonly<Record<MetricFamily, MetricTrendEvidence>> | null;
  readonly sustainedFamilies: readonly MetricFamily[];
  readonly improvingFamilies: readonly MetricFamily[];
}

const METRIC_FAMILIES: readonly MetricFamily[] = [
  "beat",
  "shape",
  "flow",
  "memory",
];

function valueForFamily(
  measures: SessionMeasures,
  family: MetricFamily,
): number {
  switch (family) {
    case "beat":
      return measures.beatAccuracy;
    case "shape":
      return measures.shapeAccuracy;
    case "flow":
      return measures.flowRecovery;
    case "memory":
      return measures.memoryControl;
  }
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted.at(middle - 1)! + sorted.at(middle)!) / 2;
  }
  return sorted.at(middle)!;
}

function baselineFor(values: readonly number[]): MetricBaseline {
  const centre = median(values);
  const mad = median(values.map((value) => Math.abs(value - centre)));
  const personalRange = Math.max(0.12, 2 * mad);
  return {
    median: centre,
    medianAbsoluteDeviation: mad,
    unfavourableThreshold: centre - personalRange,
    improvementThreshold: centre + personalRange,
  };
}

function rounded(value: number): number {
  return Number(value.toFixed(4));
}

function analysisWindowFor(
  sessions: readonly SessionSummary[],
): TrendAnalysisWindow | null {
  const first = sessions.at(0);
  const last = sessions.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }
  const millisecondsPerDay = 24 * 60 * 60 * 1_000;
  const dayCount = Math.max(
    1,
    Math.ceil(
      (Date.parse(last.completedAt) - Date.parse(first.completedAt)) /
        millisecondsPerDay,
    ) + 1,
  );
  return {
    startedAt: first.completedAt,
    endedAt: last.completedAt,
    dayCount,
  };
}

function emptyReport(input: {
  readonly mode: SessionMode;
  readonly simulated: boolean;
  readonly validSessionCount: number;
}): TrendReport {
  return {
    ruleVersion: TREND_RULE_VERSION,
    eventId: `trend-v1:${input.simulated ? "simulated" : "captured"}:${input.mode}:insufficient`,
    mode: input.mode,
    simulated: input.simulated,
    status: "insufficient-history",
    performanceTrend: "stable",
    validSessionCount: input.validSessionCount,
    sessionsNeeded: Math.max(0, 5 - input.validSessionCount),
    baselineSessionIds: [],
    recentSessions: [],
    analysisWindow: null,
    baselines: null,
    metricEvidence: null,
    sustainedFamilies: [],
    improvingFamilies: [],
  };
}

export function evaluatePersonalTrend(
  summaries: readonly SessionSummary[],
  input: {
    readonly mode: SessionMode;
    readonly simulated: boolean;
  },
): TrendReport {
  const comparable = summaries
    .filter(
      (summary) =>
        summary.mode === input.mode &&
        summary.simulated === input.simulated &&
        summary.validity.validForTrend,
    )
    .sort((left, right) => left.completedAt.localeCompare(right.completedAt));

  if (comparable.length < 5) {
    const report = emptyReport({
      ...input,
      validSessionCount: comparable.length,
    });
    return {
      ...report,
      analysisWindow: analysisWindowFor(comparable),
    };
  }

  const baselineSessions = comparable.slice(0, 5);
  const baselines = Object.fromEntries(
    METRIC_FAMILIES.map((family) => [
      family,
      baselineFor(
        baselineSessions.map((summary) =>
          valueForFamily(summary.score.measures, family),
        ),
      ),
    ]),
  ) as Record<MetricFamily, MetricBaseline>;
  const laterSessions = comparable.slice(5);
  const recentSource = laterSessions.slice(-3);
  const recentSessions: RecentTrendSession[] = recentSource.map((summary) => ({
    sessionId: summary.sessionId,
    completedAt: summary.completedAt,
    shiftedFamilies: METRIC_FAMILIES.filter(
      (family) =>
        valueForFamily(summary.score.measures, family) <
        baselines[family].unfavourableThreshold,
    ),
    improvingFamilies: METRIC_FAMILIES.filter(
      (family) =>
        valueForFamily(summary.score.measures, family) >
        baselines[family].improvementThreshold,
    ),
  }));
  const metricEvidence = Object.fromEntries(
    METRIC_FAMILIES.map((family) => {
      const recentValues = recentSource.map((summary) =>
        valueForFamily(summary.score.measures, family),
      );
      const shiftedRecentSessionCount = recentSessions.filter((session) =>
        session.shiftedFamilies.includes(family),
      ).length;
      const improvedRecentSessionCount = recentSessions.filter((session) =>
        session.improvingFamilies.includes(family),
      ).length;
      const repeatedDecline =
        recentSessions.length >= 3 && shiftedRecentSessionCount >= 2;
      const repeatedImprovement =
        recentSessions.length >= 3 && improvedRecentSessionCount >= 2;
      const recentMedian =
        recentValues.length === 0 ? null : median(recentValues);
      const evidence: MetricTrendEvidence = {
        baselineMedian: baselines[family].median,
        recentMedian,
        changeFromBaseline:
          recentMedian === null
            ? null
            : rounded(recentMedian - baselines[family].median),
        shiftedRecentSessionCount,
        improvedRecentSessionCount,
        status:
          recentSessions.length < 3
            ? "collecting"
            : repeatedDecline
              ? "repeated-decline"
              : repeatedImprovement
                ? "repeated-improvement"
                : "within-usual-range",
      };
      return [family, evidence];
    }),
  ) as Record<MetricFamily, MetricTrendEvidence>;
  const sustainedFamilies = METRIC_FAMILIES.filter(
    (family) => metricEvidence[family].status === "repeated-decline",
  );
  const improvingFamilies = METRIC_FAMILIES.filter(
    (family) => metricEvidence[family].status === "repeated-improvement",
  );
  const status: TrendStatus =
    recentSessions.length < 3
      ? "baseline-ready"
      : sustainedFamilies.length >= 2
        ? "sustained-shift"
        : "usual-range";
  const performanceTrend: PerformanceTrend =
    recentSessions.length < 3
      ? "stable"
      : sustainedFamilies.length >= 2 &&
          sustainedFamilies.length > improvingFamilies.length
        ? "declined"
        : improvingFamilies.length >= 2 &&
            improvingFamilies.length > sustainedFamilies.length
          ? "improving"
          : "stable";
  const recentStart =
    recentSessions.at(0)?.completedAt ?? baselineSessions.at(-1)!.completedAt;
  const recentEnd =
    recentSessions.at(-1)?.completedAt ?? baselineSessions.at(-1)!.completedAt;

  return {
    ruleVersion: TREND_RULE_VERSION,
    eventId: `trend-v1:${input.simulated ? "simulated" : "captured"}:${input.mode}:${recentStart}:${recentEnd}`,
    mode: input.mode,
    simulated: input.simulated,
    status,
    performanceTrend,
    validSessionCount: comparable.length,
    sessionsNeeded: 0,
    baselineSessionIds: baselineSessions.map((summary) => summary.sessionId),
    recentSessions,
    analysisWindow: analysisWindowFor(comparable),
    baselines,
    metricEvidence,
    sustainedFamilies,
    improvingFamilies,
  };
}
