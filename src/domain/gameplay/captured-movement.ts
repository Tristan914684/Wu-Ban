import type {
  MovementCue,
  MovementObservation,
} from "../movement/landmarks";

export interface CapturedMovement {
  readonly cue: MovementCue;
  readonly confidence: number;
  readonly atMs: number;
}

export interface MovementCaptureLatch {
  readonly armedFromCentre: boolean;
  readonly latest: CapturedMovement | null;
}

export const INITIAL_MOVEMENT_CAPTURE_LATCH: MovementCaptureLatch = {
  armedFromCentre: true,
  latest: null,
};

export const MOVEMENT_CAPTURE_WINDOW_MS = {
  beforeCue: 900,
  afterCue: 400,
} as const;

export function updateMovementCaptureLatch(
  latch: MovementCaptureLatch,
  observation: MovementObservation,
  atMs: number,
): MovementCaptureLatch {
  if (observation.kind === "neutral") {
    return { ...latch, armedFromCentre: true };
  }
  if (observation.kind !== "movement" || !latch.armedFromCentre) {
    return latch;
  }
  return {
    armedFromCentre: false,
    latest: {
      cue: observation.cue,
      confidence: observation.confidence,
      atMs,
    },
  };
}

export function observationForCue(
  currentObservation: MovementObservation,
  capturedMovement: CapturedMovement | null,
  cueAtMs: number,
): MovementObservation {
  if (capturedMovement === null) {
    return currentObservation.kind === "movement"
      ? { kind: "neutral" }
      : currentObservation;
  }

  const timingOffsetMs = capturedMovement.atMs - cueAtMs;
  if (
    timingOffsetMs < -MOVEMENT_CAPTURE_WINDOW_MS.beforeCue ||
    timingOffsetMs > MOVEMENT_CAPTURE_WINDOW_MS.afterCue
  ) {
    return currentObservation.kind === "movement"
      ? { kind: "neutral" }
      : currentObservation;
  }

  return {
    kind: "movement",
    cue: capturedMovement.cue,
    confidence: capturedMovement.confidence,
  };
}
