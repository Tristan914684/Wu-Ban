import type { SessionMode } from "../domain/chart/session-chart";
import type { SessionMeasures } from "../domain/scoring/session-score";
import type { SessionSummary } from "../domain/session/session-summary";
import { MOVEMENT_CLASSIFIER_VERSION } from "../domain/movement/landmarks";

const defaultMeasures: SessionMeasures = {
  beatAccuracy: 0.85,
  shapeAccuracy: 0.85,
  flowRecovery: 0.85,
  memoryControl: 0.85,
  scoreableRatio: 0.95,
};

export function buildSessionSummary(
  overrides: {
    readonly completedAt?: string;
    readonly id?: string;
    readonly measures?: Partial<SessionMeasures>;
    readonly mode?: SessionMode;
    readonly simulated?: boolean;
    readonly validForTrend?: boolean;
  } = {},
): SessionSummary {
  const measures = { ...defaultMeasures, ...overrides.measures };
  return {
    schemaVersion: 1,
    sessionId: overrides.id ?? "session-1",
    completedAt: overrides.completedAt ?? "2026-07-01T09:00:00.000Z",
    mode: overrides.mode ?? "standing",
    chartId: "test-chart",
    chartVersion: 1,
    classifierVersion: MOVEMENT_CLASSIFIER_VERSION,
    qualityVersion: 1,
    scoringVersion: 1,
    simulated: overrides.simulated ?? false,
    score: {
      funScore: 850,
      measures,
      outcomes: [],
    },
    validity: {
      validForTrend: overrides.validForTrend ?? true,
      participationCredit: true,
      exclusionReasons:
        overrides.validForTrend === false
          ? ["insufficient-scoreable-input"]
          : [],
    },
  };
}
