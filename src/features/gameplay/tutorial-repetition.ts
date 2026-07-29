import type {
  MovementCue,
  MovementObservation,
} from "../../domain/movement/landmarks";

export interface TutorialRepetitionLatch {
  readonly readyFromCentre: boolean;
}

export const INITIAL_TUTORIAL_REPETITION_LATCH: TutorialRepetitionLatch = {
  readyFromCentre: true,
};

export function updateTutorialRepetitionLatch(
  latch: TutorialRepetitionLatch,
  observation: MovementObservation,
  expectedCue: MovementCue,
): {
  readonly latch: TutorialRepetitionLatch;
  readonly completedRepetition: boolean;
} {
  if (observation.kind === "neutral") {
    return {
      latch: { readyFromCentre: true },
      completedRepetition: false,
    };
  }
  if (
    observation.kind === "movement" &&
    observation.cue === expectedCue &&
    latch.readyFromCentre
  ) {
    return {
      latch: { readyFromCentre: false },
      completedRepetition: true,
    };
  }
  return { latch, completedRepetition: false };
}
