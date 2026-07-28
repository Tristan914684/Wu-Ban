import { describe, expect, it } from "vitest";

import {
  outcomeForAttempt,
  scoreSession,
  type CueAttempt,
} from "./session-score";

describe("session score", () => {
  it("separates unscoreable input from an incorrect move (BR-004)", () => {
    const attempts: readonly CueAttempt[] = [
      {
        cueId: "1",
        expected: "step-left",
        observed: null,
        timingOffsetMs: null,
        scoreable: false,
      },
      {
        cueId: "2",
        expected: "step-right",
        observed: "step-left",
        timingOffsetMs: 90,
        scoreable: true,
      },
    ];

    expect(scoreSession(attempts).outcomes).toEqual([
      "unscoreable",
      "next",
    ]);
  });

  it("keeps the fun score separate from measures (BR-007)", () => {
    const score = scoreSession([
      {
        cueId: "1",
        expected: "left-palm",
        observed: "left-palm",
        timingOffsetMs: 80,
        scoreable: true,
      },
      {
        cueId: "2",
        expected: null,
        observed: null,
        timingOffsetMs: 0,
        scoreable: true,
      },
    ]);

    expect(score.funScore).toBe(1000);
    expect(score.measures).toEqual({
      beatAccuracy: 1,
      shapeAccuracy: 1,
      flowRecovery: 1,
      memoryControl: 1,
      scoreableRatio: 1,
    });
  });

  it("uses forgiving Good, Nearly, and Try-next timing bands", () => {
    const base: CueAttempt = {
      cueId: "1",
      expected: "step-left",
      observed: "step-left",
      timingOffsetMs: 0,
      scoreable: true,
    };

    expect(outcomeForAttempt({ ...base, timingOffsetMs: 200 })).toBe("good");
    expect(outcomeForAttempt({ ...base, timingOffsetMs: 420 })).toBe(
      "nearly",
    );
    expect(
      outcomeForAttempt({ ...base, observed: "step-right" }),
    ).toBe("next");
  });

  it("does not award a score when no cue was scoreable", () => {
    expect(scoreSession([]).funScore).toBe(0);
  });
});
