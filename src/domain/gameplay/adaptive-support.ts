import type { CueAttempt } from "../scoring/session-score";

export type CueSupportLevel = 0 | 1 | 2;

export const CUE_PREVIEW_MS: Record<CueSupportLevel, number> = {
  0: 1_200,
  1: 1_600,
  2: 2_200,
};

function wasSuccessful(attempt: CueAttempt): boolean {
  if (!attempt.scoreable) {
    return false;
  }
  if (attempt.expected === null) {
    return attempt.observed === null;
  }
  return (
    attempt.observed === attempt.expected &&
    attempt.timingOffsetMs !== null &&
    Math.abs(attempt.timingOffsetMs) <= 500
  );
}

export function adaptCueSupport(
  current: CueSupportLevel,
  attempts: readonly CueAttempt[],
): CueSupportLevel {
  const recent = attempts.filter((attempt) => attempt.scoreable).slice(-10);
  if (
    recent.length >= 10 &&
    recent.filter(wasSuccessful).length >= 8
  ) {
    return Math.max(0, current - 1) as CueSupportLevel;
  }

  const lastFive = recent.slice(-5);
  if (
    lastFive.length >= 5 &&
    lastFive.filter((attempt) => !wasSuccessful(attempt)).length >= 3
  ) {
    return Math.min(2, current + 1) as CueSupportLevel;
  }

  return current;
}

export function makeCueSupportGentler(
  current: CueSupportLevel,
): CueSupportLevel {
  return Math.min(2, current + 1) as CueSupportLevel;
}
