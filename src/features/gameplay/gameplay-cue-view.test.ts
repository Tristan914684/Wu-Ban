import { describe, expect, it } from "vitest";

import { cueRunwayView, GAMEPLAY_PHASES } from "./gameplay-cue-view";

describe("gameplay cue view", () => {
  it("keeps continuous cue travel tied to the audio clock", () => {
    expect(cueRunwayView(10_000, 5_000, 10_000, false)).toEqual({
      progress: 0.5,
      timingStage: "next",
    });
  });

  it("uses stable readable positions when dynamics are reduced", () => {
    expect(cueRunwayView(10_000, 5_000, 10_000, true)).toEqual({
      progress: 0.34,
      timingStage: "next",
    });
    expect(cueRunwayView(10_000, 9_800, 10_000, true)).toEqual({
      progress: 0.8,
      timingStage: "now",
    });
  });

  it("names all four timing stages and clamps out-of-range cues", () => {
    expect(cueRunwayView(10_000, -2_000, 10_000, false)).toEqual({
      progress: 0,
      timingStage: "later",
    });
    expect(cueRunwayView(10_000, 7_000, 10_000, true)).toEqual({
      progress: 0.62,
      timingStage: "ready",
    });
    expect(cueRunwayView(10_000, 15_000, 10_000, false)).toEqual({
      progress: 1,
      timingStage: "now",
    });
  });

  it("keeps the player-facing session to four understandable phases", () => {
    expect(GAMEPLAY_PHASES).toEqual([
      "warmup",
      "follow",
      "rhythm",
      "memory",
    ]);
  });
});
