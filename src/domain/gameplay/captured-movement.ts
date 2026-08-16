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
  // Timestamp of the first frame in the current unbroken run of "both-palms"
  // observations, or null if we're not currently mid-run. Used to detect a
  // sustained both-palms hold so it can override an earlier single-palm
  // capture (see BOTH_PALMS_OVERRIDE_MS below).
  readonly bothPalmsSinceMs: number | null;
}

export const INITIAL_MOVEMENT_CAPTURE_LATCH: MovementCaptureLatch = {
  armedFromCentre: true,
  latest: null,
  bothPalmsSinceMs: null,
};

// One hand (e.g. the right) often reaches "open palm" a frame or two before
// the other, so the very first movement frame after centre can read as
// "right-palm" even when the player is going for "both-palms". If
// "both-palms" is then observed continuously for at least this long, it
// overrides whatever single-palm cue got latched first.
export const BOTH_PALMS_OVERRIDE_MS = 50;

export const MOVEMENT_CAPTURE_WINDOW_MS = {
  beforeCue: 1000,
  afterCue: 500,
} as const;

export function updateMovementCaptureLatch(
  latch: MovementCaptureLatch,
  observation: MovementObservation,
  atMs: number,
): MovementCaptureLatch {
  if (observation.kind === "neutral") {
    return { ...latch, armedFromCentre: true, bothPalmsSinceMs: null };
  }
  if (observation.kind !== "movement") {
    return latch;
  }

  if (observation.cue === "both-palms") {
    const bothPalmsSinceMs = latch.bothPalmsSinceMs ?? atMs;
    const heldMs = atMs - bothPalmsSinceMs;
    const shouldLatch =
      latch.armedFromCentre ||
      (latch.latest?.cue !== "both-palms" && heldMs >= BOTH_PALMS_OVERRIDE_MS);
    if (shouldLatch) {
      return {
        armedFromCentre: false,
        latest: {
          cue: "both-palms",
          confidence: observation.confidence,
          atMs: bothPalmsSinceMs,
        },
        bothPalmsSinceMs,
      };
    }
    return { ...latch, bothPalmsSinceMs };
  }

  // Any other cue breaks a both-palms run in progress.
  if (!latch.armedFromCentre) {
    return { ...latch, bothPalmsSinceMs: null };
  }
  return {
    armedFromCentre: false,
    latest: {
      cue: observation.cue,
      confidence: observation.confidence,
      atMs,
    },
    bothPalmsSinceMs: null,
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
