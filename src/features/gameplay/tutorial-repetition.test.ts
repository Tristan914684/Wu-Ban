import { describe, expect, it } from "vitest";

import {
  INITIAL_TUTORIAL_REPETITION_LATCH,
  updateTutorialRepetitionLatch,
} from "./tutorial-repetition";

describe("tutorial repetition centre latch", () => {
  it("requires a return to neutral before the same cue can count again", () => {
    const first = updateTutorialRepetitionLatch(
      INITIAL_TUTORIAL_REPETITION_LATCH,
      { kind: "movement", cue: "step-left", confidence: 0.9 },
      "step-left",
    );
    const held = updateTutorialRepetitionLatch(
      first.latch,
      { kind: "movement", cue: "step-left", confidence: 0.9 },
      "step-left",
    );
    const centred = updateTutorialRepetitionLatch(
      held.latch,
      { kind: "neutral" },
      "step-left",
    );
    const second = updateTutorialRepetitionLatch(
      centred.latch,
      { kind: "movement", cue: "step-left", confidence: 0.9 },
      "step-left",
    );

    expect(first.completedRepetition).toBe(true);
    expect(held.completedRepetition).toBe(false);
    expect(second.completedRepetition).toBe(true);
  });

  it("does not treat a different movement or unclear tracking as centred", () => {
    const first = updateTutorialRepetitionLatch(
      INITIAL_TUTORIAL_REPETITION_LATCH,
      { kind: "movement", cue: "step-left", confidence: 0.9 },
      "step-left",
    );
    const wrongDirection = updateTutorialRepetitionLatch(
      first.latch,
      { kind: "movement", cue: "step-right", confidence: 0.9 },
      "step-left",
    );
    const unclear = updateTutorialRepetitionLatch(
      wrongDirection.latch,
      { kind: "unscoreable", reason: "low-confidence" },
      "step-left",
    );

    expect(wrongDirection.completedRepetition).toBe(false);
    expect(unclear.completedRepetition).toBe(false);
    expect(unclear.latch.readyFromCentre).toBe(false);
  });
});
