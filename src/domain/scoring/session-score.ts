import type { MovementCue } from "../movement/landmarks";

export type AttemptOutcome = "good" | "nearly" | "next" | "unscoreable";

export interface CueAttempt {
  readonly cueId: string;
  readonly expected: MovementCue | null;
  readonly observed: MovementCue | null;
  readonly timingOffsetMs: number | null;
  readonly scoreable: boolean;
}

export interface SessionMeasures {
  readonly beatAccuracy: number;
  readonly shapeAccuracy: number;
  readonly flowRecovery: number;
  readonly memoryControl: number;
  readonly scoreableRatio: number;
}

export interface SessionScore {
  readonly funScore: number;
  readonly measures: SessionMeasures;
  readonly outcomes: readonly AttemptOutcome[];
}

function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function outcomeForAttempt(attempt: CueAttempt): AttemptOutcome {
  if (!attempt.scoreable) {
    return "unscoreable";
  }
  if (attempt.expected === null) {
    return attempt.observed === null ? "good" : "next";
  }
  if (attempt.observed !== attempt.expected) {
    return "next";
  }
  if (attempt.timingOffsetMs === null) {
    return "nearly";
  }
  return Math.abs(attempt.timingOffsetMs) <= 280 ? "good" : "nearly";
}

export function scoreSession(
  attempts: readonly CueAttempt[],
): SessionScore {
  const outcomes = attempts.map(outcomeForAttempt);
  const scoreable = attempts.filter((attempt) => attempt.scoreable);
  const moveAttempts = scoreable.filter((attempt) => attempt.expected !== null);
  const noGoAttempts = scoreable.filter((attempt) => attempt.expected === null);
  const matchedMoves = moveAttempts.filter(
    (attempt) => attempt.observed === attempt.expected,
  );
  const timedMoves = matchedMoves.filter(
    (attempt) =>
      attempt.timingOffsetMs !== null &&
      Math.abs(attempt.timingOffsetMs) <= 500,
  );
  const onBeatMoves = matchedMoves.filter(
    (attempt) =>
      attempt.timingOffsetMs !== null &&
      Math.abs(attempt.timingOffsetMs) <= 280,
  );
  const heldNoGo = noGoAttempts.filter(
    (attempt) => attempt.observed === null,
  );

  const scoreableRatio =
    attempts.length === 0 ? 0 : scoreable.length / attempts.length;
  const beatAccuracy =
    matchedMoves.length === 0 ? 0 : onBeatMoves.length / matchedMoves.length;
  const shapeAccuracy =
    moveAttempts.length === 0 ? 0 : matchedMoves.length / moveAttempts.length;
  const flowRecovery =
    moveAttempts.length === 0 ? 0 : timedMoves.length / moveAttempts.length;
  const memoryControl =
    noGoAttempts.length === 0 ? 1 : heldNoGo.length / noGoAttempts.length;

  const weighted =
    beatAccuracy * 0.35 +
    shapeAccuracy * 0.3 +
    flowRecovery * 0.2 +
    memoryControl * 0.15;

  return {
    funScore:
      scoreable.length === 0
        ? 0
        : Math.round(clampUnit(weighted) * 1000),
    measures: {
      beatAccuracy,
      shapeAccuracy,
      flowRecovery,
      memoryControl,
      scoreableRatio,
    },
    outcomes,
  };
}
