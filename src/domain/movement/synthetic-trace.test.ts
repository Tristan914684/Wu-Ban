import { describe, expect, it } from "vitest";

import {
  replaySyntheticObservation,
  replaySyntheticTrackingObservation,
  syntheticLandmarkFrame,
} from "./synthetic-trace";

describe("privacy-safe synthetic landmark replay", () => {
  it("replays standing landmarks through the production classifier", () => {
    const frame = syntheticLandmarkFrame(
      "standing",
      "step-left",
      0,
      1_000,
    );

    expect(frame).toMatchObject({
      kind: "pose",
      timestampMs: 1_000,
      personCount: 1,
    });
    expect(
      replaySyntheticObservation("standing", "step-left", 0, 1_000),
    ).toMatchObject({ kind: "movement", cue: "step-left" });
  });

  it("replays seated landmarks and preserves authored unclear segments", () => {
    expect(
      replaySyntheticObservation("seated", "both-palms", 0, 1_000),
    ).toMatchObject({ kind: "movement", cue: "both-palms" });
    expect(
      replaySyntheticObservation("seated", "left-palm", 7, 1_000),
    ).toEqual({ kind: "unscoreable", reason: "low-confidence" });
  });

  it("routes a deterministic tracking-loss window through the classifier", () => {
    expect(
      replaySyntheticTrackingObservation(
        "standing",
        "tracking-loss",
        2_000,
      ),
    ).toEqual({ kind: "unscoreable", reason: "low-confidence" });
    expect(
      replaySyntheticTrackingObservation(
        "standing",
        "tracking-loss",
        5_200,
      ),
    ).toEqual({ kind: "neutral" });
    expect(
      replaySyntheticTrackingObservation("standing", "standard", 2_000),
    ).toEqual({ kind: "neutral" });
  });
});
