import { describe, expect, it } from "vitest";

import { translatePlayerFacingLandmark } from "./mediapipe-landmark-detector";

describe("MediaPipe player-facing coordinates", () => {
  it("mirrors the model x coordinate to match the visible selfie preview", () => {
    expect(
      translatePlayerFacingLandmark({
        x: 0.2,
        y: 0.4,
        z: -0.1,
        visibility: 0.8,
      }),
    ).toEqual({
      x: 0.8,
      y: 0.4,
      z: -0.1,
      visibility: 0.8,
      presence: 0.8,
    });
  });
});
