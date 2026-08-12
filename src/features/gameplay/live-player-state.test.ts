import { describe, expect, it } from "vitest";

import { livePlayerState } from "./live-player-state";

describe("live player state", () => {
  it("makes the centred standing state explicit", () => {
    expect(livePlayerState("en", "standing", { kind: "neutral" })).toEqual({
      key: "center",
      label: "At start position",
      helper: "Ready for the next gentle step",
      symbol: "●",
    });
  });

  it("uses hand-specific home language for seated play", () => {
    expect(livePlayerState("en", "seated", { kind: "neutral" })).toEqual({
      key: "center",
      label: "Hands ready",
      helper: "Make the next hand gesture",
      symbol: "●",
    });
  });

  it("names the currently detected direction", () => {
    expect(
      livePlayerState("en", "standing", {
        kind: "movement",
        cue: "step-right",
        confidence: 0.7,
      }),
    ).toMatchObject({
      key: "step-right",
      label: "Moving right",
      helper: "Step seen; return both feet to the start marks",
      symbol: "→",
    });
  });

  it("uses a recovery state when the camera is unclear", () => {
    expect(
      livePlayerState("zh", "standing", {
        kind: "unscoreable",
        reason: "low-confidence",
      }),
    ).toMatchObject({
      key: "unclear",
      label: "暂时看不清位置",
    });
  });
});
