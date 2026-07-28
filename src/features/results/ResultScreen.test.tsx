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
    const download = screen.getByRole("link", {
      name: "Download aggregate evidence JSON",
    });
    expect(download).toHaveAttribute(
      "download",
      `wuban-camera-evidence-${chart.mode}-${chart.id}.json`,
    );
    const href = download.getAttribute("href");
    expect(href).toMatch(
      /^data:application\/json;charset=utf-8,/,
    );
    const downloadedJson = decodeURIComponent(
      href?.split(",")[1] ?? "",
    );
    expect(downloadedJson).toContain(
      '"privacyBoundary": "aggregate-camera-evidence-only"',
    );
    expect(downloadedJson).not.toContain("must-not-render");
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
    expect(
      screen.queryByRole("link", {
        name: "Download aggregate evidence JSON",
      }),
    ).not.toBeInTheDocument();
  });

  it("explains that an audio-fallback result cannot shape the usual range", () => {
    const summary = buildSessionSummary({ validForTrend: false });

    render(
      <ResultScreen
        language="en"
        onFinish={vi.fn()}
        summary={{
          ...summary,
          validity: {
            validForTrend: false,
            participationCredit: true,
            exclusionReasons: ["clock-error"],
          },
        }}
      />,
    );

    expect(
      screen.getByText(
        "The beat was unavailable for part or all of this session. Your result and participation are saved, but it will not shape your personal usual range.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "You completed the session, but some input was unclear, so it will not join your usual pattern.",
      ),
    ).not.toBeInTheDocument();
  });
});
