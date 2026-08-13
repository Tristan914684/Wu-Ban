import { describe, expect, it } from "vitest";

import { livePlayerState } from "./live-player-state";

describe("live player state", () => {
  it("makes the centred standing state explicit", () => {
    expect(livePlayerState("en", "standing", { kind: "neutral" })).toEqual({
      key: "center",
      label: "You are centred",
      helper: "Position ready; move when a cue reaches the line",
      symbol: "●",
    });
  });

  it.each([
    ["step-left", "Left of centre", "Step RIGHT → to return", "←"],
    ["step-right", "Right of centre", "Step LEFT ← to return", "→"],
    ["step-forward", "In front of centre", "Step BACK ↓ to return", "↑"],
    ["step-back", "Behind centre", "Step FORWARD ↑ to return", "↓"],
  ] as const)(
    "names %s as the current position and gives the opposite correction",
    (cue, label, helper, symbol) => {
      expect(
        livePlayerState("en", "standing", {
          kind: "movement",
          cue,
          confidence: 0.7,
        }),
      ).toEqual({
        key: cue,
        label,
        helper,
        symbol,
      });
    },
  );

  it("uses a recovery state when the camera is unclear", () => {
    expect(
      livePlayerState("zh", "standing", {
        kind: "unscoreable",
        reason: "low-confidence",
      }),
    ).toMatchObject({
      key: "unclear",
      label: "暂时看不清位置",
      helper: "慢慢回到中央轮廓；看清后再继续",
    });
  });

  it("keeps the seated path focused on gesture reset instead of stepping", () => {
    expect(
      livePlayerState("en", "seated", {
        kind: "movement",
        cue: "both-palms",
        confidence: 0.8,
      }),
    ).toMatchObject({
      key: "both-palms",
      label: "Both palms detected",
      helper: "Gesture seen; reset your hands for the next move",
    });
  });
});
