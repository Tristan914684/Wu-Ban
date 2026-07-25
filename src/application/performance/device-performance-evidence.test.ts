import { describe, expect, it } from "vitest";

import { DevicePerformanceEvidenceCollector } from "./device-performance-evidence";

describe("device performance evidence collector", () => {
  it("summarises active camera timing without retaining frame-level data", () => {
    const collector = new DevicePerformanceEvidenceCollector({
      mode: "standing",
      chartId: "standing-v1",
      chartVersion: 1,
    });

    collector.recordRender({
      timestampMs: 1_000,
      audioElapsedMs: 100,
      active: true,
    });
    collector.recordInference({
      durationMs: 8,
      confidence: 0.9,
      observation: { kind: "movement", cue: "step-left", confidence: 0.9 },
    });
    collector.recordRender({
      timestampMs: 1_500,
      audioElapsedMs: 605,
      active: true,
    });
    collector.recordInference({
      durationMs: 12,
      confidence: 0.7,
      observation: {
        kind: "unscoreable",
        reason: "low-confidence",
      },
    });
    collector.recordInference({
      durationMs: 20,
      confidence: 0.3,
      observation: {
        kind: "unscoreable",
        reason: "low-confidence",
      },
    });
    collector.recordRender({
      timestampMs: 2_000,
      audioElapsedMs: 1_090,
      active: true,
    });
    collector.recordInference({
      durationMs: 10,
      confidence: 0.8,
      observation: { kind: "neutral" },
    });

    const report = collector.finish();

    expect(report).toMatchObject({
      schemaVersion: 1,
      mode: "standing",
      chartId: "standing-v1",
      chartVersion: 1,
      measurementWindowMs: 1_000,
      renderFrameCount: 3,
      renderRateFps: 3,
      inferenceCount: 4,
      inferenceRateFps: 4,
      inferenceDurationMedianMs: 11,
      inferenceDurationP95Ms: 20,
      meanLandmarkConfidence: 0.675,
      scoreableFrameCount: 2,
      unscoreableFrameCount: 2,
      unscoreableEpisodeCount: 1,
      unscoreableReasons: { "low-confidence": 2 },
      absoluteAudioClockDriftEndMs: 10,
      absoluteAudioClockDriftP95Ms: 10,
      pauseCount: 0,
      debugOverlayEnabled: true,
      privacyBoundary: "aggregate-performance-only",
    });
    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain("landmarks");
    expect(serialized).not.toContain("frameData");
    expect(serialized).not.toContain("timestampMs");
    expect(serialized).not.toContain("audioElapsedMs");
  });

  it("excludes paused wall time from rates and records separate unclear episodes", () => {
    const collector = new DevicePerformanceEvidenceCollector({
      mode: "seated",
      chartId: "seated-v1",
      chartVersion: 1,
    });

    collector.recordRender({
      timestampMs: 0,
      audioElapsedMs: 0,
      active: true,
    });
    collector.recordInference({
      durationMs: 10,
      confidence: 0.2,
      observation: {
        kind: "unscoreable",
        reason: "missing-landmarks",
      },
    });
    collector.recordRender({
      timestampMs: 500,
      audioElapsedMs: 500,
      active: false,
    });
    collector.recordRender({
      timestampMs: 1_500,
      audioElapsedMs: 500,
      active: false,
    });
    collector.recordRender({
      timestampMs: 2_000,
      audioElapsedMs: 500,
      active: true,
    });
    collector.recordInference({
      durationMs: 10,
      confidence: 0.8,
      observation: { kind: "neutral" },
    });
    collector.recordInference({
      durationMs: 10,
      confidence: 0.1,
      observation: {
        kind: "unscoreable",
        reason: "multiple-people",
      },
    });
    collector.recordRender({
      timestampMs: 2_500,
      audioElapsedMs: 1_000,
      active: true,
    });

    expect(collector.finish()).toMatchObject({
      measurementWindowMs: 1_000,
      renderFrameCount: 3,
      renderRateFps: 3,
      inferenceCount: 3,
      inferenceRateFps: 3,
      pauseCount: 1,
      unscoreableEpisodeCount: 2,
      unscoreableReasons: {
        "missing-landmarks": 1,
        "multiple-people": 1,
      },
      absoluteAudioClockDriftEndMs: 0,
    });
  });

  it("returns explicit empty measurements instead of NaN or Infinity", () => {
    const collector = new DevicePerformanceEvidenceCollector({
      mode: "standing",
      chartId: "standing-v1",
      chartVersion: 1,
    });

    expect(collector.finish()).toMatchObject({
      measurementWindowMs: 0,
      renderRateFps: 0,
      inferenceRateFps: 0,
      inferenceDurationMedianMs: null,
      inferenceDurationP95Ms: null,
      meanLandmarkConfidence: null,
      absoluteAudioClockDriftEndMs: null,
      absoluteAudioClockDriftP95Ms: null,
    });
    const serialized = JSON.stringify(collector.finish());
    expect(serialized).not.toContain("NaN");
    expect(serialized).not.toContain("Infinity");
  });
});
