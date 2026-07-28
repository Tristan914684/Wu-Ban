import type { SessionMode } from "../chart/session-chart";
import type { SessionMeasures } from "../scoring/session-score";
import type { SessionSummary } from "../session/session-summary";

const BASELINE_VALUES = [0.86, 0.83, 0.88, 0.85, 0.84] as const;

function summary(
  mode: SessionMode,
  index: number,
  measures: SessionMeasures,
): SessionSummary {
  return {
    schemaVersion: 1,
    sessionId: `simulated-${mode}-${String(index + 1).padStart(2, "0")}`,
    completedAt: new Date(
      Date.UTC(2026, 6, 10 + index, 9, 0, 0),
    ).toISOString(),
    mode,
    chartId: `${mode}-mvp-chart`,
    chartVersion: 1,
    classifierVersion: 1,
    qualityVersion: 1,
    scoringVersion: 1,
    simulated: true,
    score: {
      funScore: Math.round(
        ((measures.beatAccuracy +
          measures.shapeAccuracy +
          measures.flowRecovery +
          measures.memoryControl) /
          4) *
          1000,
      ),
      measures,
      outcomes: [],
    },
    validity: {
      validForTrend: true,
      participationCredit: true,
      exclusionReasons: [],
    },
  };
}

export function createSimulatedTrendHistory(
  mode: SessionMode,
): readonly SessionSummary[] {
  const baseline = BASELINE_VALUES.map((value, index) =>
    summary(mode, index, {
      beatAccuracy: value,
      shapeAccuracy: value - 0.02,
      flowRecovery: value - 0.01,
      memoryControl: value + 0.02,
      scoreableRatio: 0.94,
    }),
  );
  const recent = [
    {
      beatAccuracy: 0.61,
      shapeAccuracy: 0.8,
      flowRecovery: 0.78,
      memoryControl: 0.62,
      scoreableRatio: 0.92,
    },
    {
      beatAccuracy: 0.64,
      shapeAccuracy: 0.79,
      flowRecovery: 0.77,
      memoryControl: 0.6,
      scoreableRatio: 0.91,
    },
    {
      beatAccuracy: 0.82,
      shapeAccuracy: 0.81,
      flowRecovery: 0.8,
      memoryControl: 0.83,
      scoreableRatio: 0.93,
    },
  ].map((measures, index) => summary(mode, index + 5, measures));

  return [...baseline, ...recent];
}

