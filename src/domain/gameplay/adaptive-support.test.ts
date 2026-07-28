import { describe, expect, it } from "vitest";

import type { CueAttempt } from "../scoring/session-score";
import {
  adaptCueSupport,
  makeCueSupportGentler,
} from "./adaptive-support";

function attempt(successful: boolean, index: number): CueAttempt {
  return {
    cueId: String(index),
    expected: "step-left",
    observed: successful ? "step-left" : "step-right",
    timingOffsetMs: successful ? 100 : 700,
    scoreable: true,
  };
}

describe("adaptive cue support", () => {
  it("fades one support step after eight of ten successful cues", () => {
    const attempts = Array.from({ length: 10 }, (_, index) =>
      attempt(index < 8, index),
    );

    expect(adaptCueSupport(2, attempts)).toBe(1);
  });

  it("restores one support step after three misses in five cues", () => {
    const attempts = [true, false, false, true, false].map(attempt);

    expect(adaptCueSupport(0, attempts)).toBe(1);
  });

  it("changes only one bounded step and always offers a gentler action", () => {
    expect(makeCueSupportGentler(0)).toBe(1);
    expect(makeCueSupportGentler(2)).toBe(2);
    expect(
      adaptCueSupport(
        0,
        Array.from({ length: 10 }, (_, index) => attempt(true, index)),
      ),
    ).toBe(0);
  });
});
