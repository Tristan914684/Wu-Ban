import type { SessionChart } from "../../domain/chart/session-chart";
import {
  createMovementEvidenceReport,
  type MovementEvidenceReport,
} from "../../domain/movement/movement-evidence";
import type { CueAttempt } from "../../domain/scoring/session-score";
import type { DevicePerformanceEvidenceReport } from "./device-performance-evidence";

interface CreateCameraEvidenceReportInput {
  readonly chart: SessionChart;
  readonly attempts: readonly CueAttempt[];
  readonly performance: DevicePerformanceEvidenceReport;
}

export interface CameraEvidenceReport {
  readonly schemaVersion: 1;
  readonly mode: SessionChart["mode"];
  readonly chartId: string;
  readonly chartVersion: SessionChart["version"];
  readonly movement: MovementEvidenceReport;
  readonly performance: DevicePerformanceEvidenceReport;
  readonly privacyBoundary: "aggregate-camera-evidence-only";
}

export function createCameraEvidenceReport({
  chart,
  attempts,
  performance,
}: CreateCameraEvidenceReportInput): CameraEvidenceReport {
  if (
    performance.mode !== chart.mode ||
    performance.chartId !== chart.id
  ) {
    throw new Error(
      "Performance evidence does not match the completed chart.",
    );
  }

  return {
    schemaVersion: 1,
    mode: chart.mode,
    chartId: chart.id,
    chartVersion: chart.version,
    movement: createMovementEvidenceReport(chart, attempts),
    performance,
    privacyBoundary: "aggregate-camera-evidence-only",
  };
}
