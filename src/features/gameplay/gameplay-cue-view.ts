import type { CueSection } from "../../domain/chart/session-chart";

export type CueTimingStage = "later" | "next" | "ready" | "now";

export interface CueRunwayView {
  readonly progress: number;
  readonly timingStage: CueTimingStage;
}

export const GAMEPLAY_PHASES = [
  "warmup",
  "follow",
  "rhythm",
  "memory",
] as const satisfies readonly CueSection[];

const REDUCED_PROGRESS: Readonly<Record<CueTimingStage, number>> = {
  later: 0.08,
  next: 0.34,
  ready: 0.62,
  now: 0.8,
};

function timingStageFor(progress: number): CueTimingStage {
  if (progress < 0.25) {
    return "later";
  }
  if (progress < 0.6) {
    return "next";
  }
  if (progress < 0.8) {
    return "ready";
  }
  return "now";
}

export function cueRunwayView(
  cueAtMs: number,
  elapsedMs: number,
  lookaheadMs: number,
  reducedMotion: boolean,
): CueRunwayView {
  const safeLookaheadMs = Math.max(1, lookaheadMs);
  const continuousProgress = Math.max(
    0,
    Math.min(1, 1 - (cueAtMs - elapsedMs) / safeLookaheadMs),
  );
  const timingStage = timingStageFor(continuousProgress);

  return {
    progress: reducedMotion
      ? REDUCED_PROGRESS[timingStage]
      : continuousProgress,
    timingStage,
  };
}
