import { describe, expect, it } from "vitest";

import {
  CAMERA_INFERENCE_INTERVAL_MS,
  shouldRunCameraInference,
} from "./inference-cadence";

function scheduledInferenceCount(
  renderFramesPerSecond: number,
  durationMs: number,
): number {
  const renderIntervalMs = 1_000 / renderFramesPerSecond;
  let lastInferenceAtMs: number | null = null;
  let count = 0;

  for (
    let timestampMs = 0;
    timestampMs <= durationMs;
    timestampMs += renderIntervalMs
  ) {
    if (shouldRunCameraInference(timestampMs, lastInferenceAtMs)) {
      lastInferenceAtMs = timestampMs;
      count += 1;
    }
  }

  return count;
}

describe("camera inference cadence", () => {
  it("does not impose a cadence below the 20 FPS release budget", () => {
    expect(CAMERA_INFERENCE_INTERVAL_MS).toBeLessThanOrEqual(1_000 / 20);
    expect(scheduledInferenceCount(30, 1_000)).toBeGreaterThanOrEqual(20);
    expect(scheduledInferenceCount(60, 1_000)).toBeGreaterThanOrEqual(20);
  });

  it("runs immediately and then bounds repeat inference", () => {
    expect(shouldRunCameraInference(1_000, null)).toBe(true);
    expect(shouldRunCameraInference(1_020, 1_000)).toBe(false);
    expect(shouldRunCameraInference(1_030, 1_000)).toBe(true);
  });
});
