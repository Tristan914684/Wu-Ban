import type { SessionChart } from "../chart/session-chart";
import type { CueAttempt } from "../scoring/session-score";
import type {
  MovementCue,
  SeatedCue,
  StandingCue,
} from "./landmarks";

export type MovementEvidenceOutcome =
  | MovementCue
  | "neutral"
  | "unscoreable";

export interface MovementConfusionRow {
  readonly expected: MovementCue;
  readonly total: number;
  readonly outcomes: Readonly<
    Partial<Record<MovementEvidenceOutcome, number>>
  >;
}

export interface MovementEvidenceReport {
  readonly schemaVersion: 1;
  readonly mode: SessionChart["mode"];
  readonly chartId: string;
  readonly chartVersion: 1;
  readonly classifierVersion: 1;
  readonly totalMoveCues: number;
  readonly scoreableMoveCues: number;
  readonly matchedMoveCues: number;
  readonly scoreableRate: number;
  readonly overallMatchRate: number;
  readonly scoreableMatchRate: number;
  readonly absoluteTimingErrorP95Ms: number | null;
  readonly confusion: readonly MovementConfusionRow[];
  readonly privacyBoundary: "aggregate-cue-outcomes-only";
}

const STANDING_CUES: readonly StandingCue[] = [
  "step-left",
  "step-right",
  "step-forward",
  "step-back",
];

const SEATED_CUES: readonly SeatedCue[] = [
  "left-palm",
  "right-palm",
  "both-palms",
  "index-hold",
];

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function p95(values: readonly number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
  return sorted[index] ?? null;
}

function outcomeForEvidence(
  attempt: CueAttempt,
): MovementEvidenceOutcome {
  if (!attempt.scoreable) {
    return "unscoreable";
  }
  return attempt.observed ?? "neutral";
}

export function createMovementEvidenceReport(
  chart: SessionChart,
  attempts: readonly CueAttempt[],
): MovementEvidenceReport {
  const expectedCues: readonly MovementCue[] =
    chart.mode === "standing" ? STANDING_CUES : SEATED_CUES;
  const expectedCueSet: ReadonlySet<MovementCue> = new Set(expectedCues);
  const movementAttempts = attempts.filter(
    (attempt): attempt is CueAttempt & { readonly expected: MovementCue } =>
      attempt.expected !== null && expectedCueSet.has(attempt.expected),
  );
  const scoreable = movementAttempts.filter((attempt) => attempt.scoreable);
  const matched = scoreable.filter(
    (attempt) => attempt.observed === attempt.expected,
  );
  const timingErrors = matched.flatMap((attempt) =>
    attempt.timingOffsetMs === null
      ? []
      : [Math.abs(attempt.timingOffsetMs)],
  );

  return {
    schemaVersion: 1,
    mode: chart.mode,
    chartId: chart.id,
    chartVersion: chart.version,
    classifierVersion: 1,
    totalMoveCues: movementAttempts.length,
    scoreableMoveCues: scoreable.length,
    matchedMoveCues: matched.length,
    scoreableRate: ratio(scoreable.length, movementAttempts.length),
    overallMatchRate: ratio(matched.length, movementAttempts.length),
    scoreableMatchRate: ratio(matched.length, scoreable.length),
    absoluteTimingErrorP95Ms: p95(timingErrors),
    confusion: expectedCues.map((expected) => {
      const outcomes: Partial<Record<MovementEvidenceOutcome, number>> = {};
      const expectedAttempts = movementAttempts.filter(
        (attempt) => attempt.expected === expected,
      );
      expectedAttempts.forEach((attempt) => {
        const outcome = outcomeForEvidence(attempt);
        outcomes[outcome] = (outcomes[outcome] ?? 0) + 1;
      });
      return {
        expected,
        total: expectedAttempts.length,
        outcomes,
      };
    }),
    privacyBoundary: "aggregate-cue-outcomes-only",
  };
}
