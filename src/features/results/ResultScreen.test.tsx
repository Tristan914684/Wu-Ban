/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createCameraEvidenceReport } from "../../application/performance/camera-evidence-report";
import { DevicePerformanceEvidenceCollector } from "../../application/performance/device-performance-evidence";
import { createSessionChart } from "../../domain/chart/session-chart";
import { buildSessionSummary } from "../../test-support/session-summary-builder";
import { ResultScreen } from "./ResultScreen";

afterEach(cleanup);

describe("result screen diagnostic evidence", () => {
  it("shows only the supplied dev camera aggregate report", () => {
    const chart = createSessionChart("standing");
    const performance = new DevicePerformanceEvidenceCollector({
      mode: chart.mode,
      chartId: chart.id,
      chartVersion: chart.version,
    });
    performance.recordRender({
      timestampMs: 0,
      audioElapsedMs: 0,
      active: true,
    });
    performance.recordRender({
      timestampMs: 1_000,
      audioElapsedMs: 1_000,
      active: true,
    });
    performance.recordInference({
      durationMs: 11,
      confidence: 0.9,
      observation: {
        kind: "movement",
        cue: "step-back",
        confidence: 0.9,
      },
    });
    const diagnosticReport = createCameraEvidenceReport({
      chart,
      attempts: [
        {
          cueId: "must-not-render",
          expected: "step-forward",
          observed: "step-back",
          timingOffsetMs: 120,
          scoreable: true,
        },
      ],
      performance: performance.finish(),
    });

    render(
      <ResultScreen
        diagnosticReport={diagnosticReport}
        language="zh"
        onFinish={vi.fn()}
        summary={buildSessionSummary()}
      />,
    );

    expect(
      screen.getByText(
        "DEV-ONLY CAMERA EVIDENCE — NOT YET HUMAN-VALIDATED",
      ),
    ).toBeInTheDocument();
    const json = screen.getByTestId("camera-evidence-json");
    expect(json).toHaveTextContent('"step-forward"');
    expect(json).toHaveTextContent('"step-back"');
    expect(json).toHaveTextContent('"inferenceDurationP95Ms": 11');
    expect(json).toHaveTextContent(
      '"privacyBoundary": "aggregate-camera-evidence-only"',
    );
    expect(json).not.toHaveTextContent("must-not-render");
  });

  it("does not expose a diagnostic surface without an explicit report", () => {
    render(
      <ResultScreen
        language="zh"
        onFinish={vi.fn()}
        summary={buildSessionSummary()}
      />,
    );

    expect(
      screen.queryByText(
        "DEV-ONLY CAMERA EVIDENCE — NOT YET HUMAN-VALIDATED",
      ),
    ).not.toBeInTheDocument();
  });
});
