import { describe, expect, it } from "vitest";

import {
  INITIAL_MOVEMENT_CAPTURE_LATCH,
  MOVEMENT_CAPTURE_WINDOW_MS,
  observationForCue,
  updateMovementCaptureLatch,
} from "./captured-movement";

describe("captured gameplay movement", () => {
  it("keeps a clear step available after the player returns to centre", () => {
    expect(
      observationForCue(
        { kind: "neutral" },
        { cue: "step-right", confidence: 0.8, atMs: 9_700 },
        10_000,
      ),
    ).toEqual({
      kind: "movement",
      cue: "step-right",
      confidence: 0.8,
    });
  });

  it("accepts an early step across the forgiving preview window", () => {
    expect(
      observationForCue(
        { kind: "neutral" },
        {
          cue: "step-left",
          confidence: 0.7,
          atMs: 10_000 - MOVEMENT_CAPTURE_WINDOW_MS.beforeCue,
        },
        10_000,
      ),
    ).toMatchObject({ kind: "movement", cue: "step-left" });
  });

  it("does not reuse a stale movement for a later cue", () => {
    const current = { kind: "neutral" } as const;
    expect(
      observationForCue(
        current,
        { cue: "step-right", confidence: 0.9, atMs: 8_000 },
        10_000,
      ),
    ).toBe(current);
  });

  it("does not count a held pose again without a fresh step event", () => {
    expect(
      observationForCue(
        {
          kind: "movement",
          cue: "step-right",
          confidence: 0.9,
        },
        null,
        10_000,
      ),
    ).toEqual({ kind: "neutral" });
  });

  it("requires a return to centre before capturing another step", () => {
    const first = updateMovementCaptureLatch(
      INITIAL_MOVEMENT_CAPTURE_LATCH,
      {
        kind: "movement",
        cue: "step-left",
        confidence: 0.8,
      },
      1_000,
    );
    const changedWithoutCentre = updateMovementCaptureLatch(
      first,
      {
        kind: "movement",
        cue: "step-right",
        confidence: 0.9,
      },
      1_200,
    );
    const centred = updateMovementCaptureLatch(
      changedWithoutCentre,
      { kind: "neutral" },
      1_400,
    );
    const second = updateMovementCaptureLatch(
      centred,
      {
        kind: "movement",
        cue: "step-right",
        confidence: 0.9,
      },
      1_600,
    );

    expect(changedWithoutCentre.latest?.cue).toBe("step-left");
    expect(second.latest?.cue).toBe("step-right");
    expect(second.armedFromCentre).toBe(false);
  });
});
