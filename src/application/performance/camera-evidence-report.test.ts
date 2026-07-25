import { describe, expect, it } from "vitest";

import { createSessionChart } from "../../domain/chart/session-chart";
import { DevicePerformanceEvidenceCollector } from "./device-performance-evidence";
import { createCameraEvidenceReport } from "./camera-evidence-report";

describe("camera evidence report", () => {
  it("combines only aggregate movement and performance evidence", () => {
    const chart = createSessionChart("standing");
    const collector = new DevicePerformanceEvidenceCollector({
      mode: chart.mode,
      chartId: chart.id,
      chartVersion: chart.version,
    });
    collector.recordRender({
      timestampMs: 0,
      audioElapsedMs: 0,
      active: true,
    });
    collector.recordRender({
      timestampMs: 1_000,
      audioElapsedMs: 1_000,
      active: true,
    });
    collector.recordInference({
      durationMs: 9,
      confidence: 0.9,
      observation: {
        kind: "movement",
        cue: "step-left",
        confidence: 0.9,
      },
    });

    const report = createCameraEvidenceReport({
      chart,
      attempts: [
        {
          cueId: "private-cue-id",
          expected: "step-left",
          observed: "step-left",
          timingOffsetMs: 100,
          scoreable: true,
        },
      ],
      performance: collector.finish(),
    });

    expect(report).toMatchObject({
      schemaVersion: 1,
      chartId: chart.id,
      mode: "standing",
      movement: {
        totalMoveCues: 1,
        matchedMoveCues: 1,
      },
      performance: {
        inferenceCount: 1,
        inferenceDurationP95Ms: 9,
      },
      privacyBoundary: "aggregate-camera-evidence-only",
    });
    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain("private-cue-id");
    expect(serialized).not.toContain("attempts");
    expect(serialized).not.toContain("landmarks");
    expect(serialized).not.toContain("timestampMs");
  });

  it("rejects performance evidence from another chart", () => {
    const chart = createSessionChart("standing");
    const collector = new DevicePerformanceEvidenceCollector({
      mode: "seated",
      chartId: "seated-v1",
      chartVersion: 1,
    });

    expect(() =>
      createCameraEvidenceReport({
        chart,
        attempts: [],
        performance: collector.finish(),
      }),
    ).toThrow("Performance evidence does not match the completed chart.");
  });
});
