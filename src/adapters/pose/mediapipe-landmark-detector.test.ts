import { describe, expect, it, vi } from "vitest";

import {
  copyVideoFrameForHandDetection,
  translatePlayerFacingHandLandmark,
  translatePlayerFacingLandmark,
} from "./mediapipe-landmark-detector";

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

  it("does not reject detected hands when the SDK leaves visibility unset", () => {
    expect(
      translatePlayerFacingHandLandmark({
        x: 0.2,
        y: 0.4,
        z: -0.1,
        visibility: 0,
      }),
    ).toEqual({
      x: 0.8,
      y: 0.4,
      z: -0.1,
      visibility: 1,
      presence: 1,
    });
  });

  it("copies the current webcam frame into a reusable hand input canvas", () => {
    const drawImage = vi.fn();
    const video = {
      videoHeight: 480,
      videoWidth: 640,
    } as HTMLVideoElement;
    const canvas = {
      getContext: vi.fn().mockReturnValue({ drawImage }),
      height: 0,
      width: 0,
    } as unknown as HTMLCanvasElement;

    expect(copyVideoFrameForHandDetection(video, canvas)).toBe(canvas);
    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(480);
    expect(drawImage).toHaveBeenCalledWith(video, 0, 0, 640, 480);
  });
});
