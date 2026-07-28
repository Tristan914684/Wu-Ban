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

export interface MetricBaseline {
  readonly median: number;
  readonly medianAbsoluteDeviation: number;
  readonly unfavourableThreshold: number;
}

export interface RecentTrendSession {
  readonly sessionId: string;
  readonly completedAt: string;
  readonly shiftedFamilies: readonly MetricFamily[];
}

export interface TrendReport {
  readonly ruleVersion: typeof TREND_RULE_VERSION;
  readonly eventId: string;
  readonly mode: SessionMode;
  readonly simulated: boolean;
  readonly status: TrendStatus;
  readonly validSessionCount: number;
  readonly sessionsNeeded: number;
  readonly baselineSessionIds: readonly string[];
  readonly recentSessions: readonly RecentTrendSession[];
  readonly baselines: Readonly<Record<MetricFamily, MetricBaseline>> | null;
  readonly sustainedFamilies: readonly MetricFamily[];
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
  return {
    median: centre,
    medianAbsoluteDeviation: mad,
    unfavourableThreshold: centre - Math.max(0.12, 2 * mad),
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
    validSessionCount: input.validSessionCount,
    sessionsNeeded: Math.max(0, 5 - input.validSessionCount),
    baselineSessionIds: [],
    recentSessions: [],
    baselines: null,
    sustainedFamilies: [],
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
    return emptyReport({
      ...input,
      validSessionCount: comparable.length,
    });
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
  }));
  const sustainedFamilies = METRIC_FAMILIES.filter(
    (family) =>
      recentSessions.filter((session) =>
        session.shiftedFamilies.includes(family),
      ).length >= 2,
  );
  const status: TrendStatus =
    recentSessions.length < 3
      ? "baseline-ready"
      : sustainedFamilies.length >= 2
        ? "sustained-shift"
        : "usual-range";
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
    validSessionCount: comparable.length,
    sessionsNeeded: 0,
    baselineSessionIds: baselineSessions.map((summary) => summary.sessionId),
    recentSessions,
    baselines,
    sustainedFamilies,
  };
}
