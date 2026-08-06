import { describe, expect, it } from "vitest";

import { livePlayerState } from "./live-player-state";

describe("live player state", () => {
  it("makes the centred standing state explicit", () => {
    expect(livePlayerState("en", "standing", { kind: "neutral" })).toEqual({
      key: "center",
      label: "Centered",
      helper: "Ready; one gentle step is enough to count",
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
