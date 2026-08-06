import type {
  SessionChart,
  SessionMode,
} from "../../domain/chart/session-chart";
import { evaluateSessionValidity } from "../../domain/quality/session-validity";
import {
  scoreSession,
  type CueAttempt,
} from "../../domain/scoring/session-score";
import type { SessionSummary } from "../../domain/session/session-summary";
import type { InputSource } from "./session-machine";
import { MOVEMENT_CLASSIFIER_VERSION } from "../../domain/movement/landmarks";

export interface CreateSessionSummaryInput {
  readonly sessionId: string;
  readonly endedAt: string;
  readonly mode: SessionMode;
  readonly chart: SessionChart;
  readonly source: InputSource;
  readonly attempts: readonly CueAttempt[];
  readonly completed: boolean;
  readonly clockHealthy: boolean;
  readonly contextConfounder: boolean;
}

export function createSessionSummary(
  input: CreateSessionSummaryInput,
): SessionSummary {
  const score = scoreSession(input.attempts);
  return {
    schemaVersion: 1,
    sessionId: input.sessionId,
    completedAt: input.endedAt,
    mode: input.mode,
    chartId: input.chart.id,
    chartVersion: input.chart.version,
    classifierVersion: MOVEMENT_CLASSIFIER_VERSION,
    qualityVersion: 1,
    scoringVersion: 1,
    simulated: input.source === "synthetic",
    score,
    validity: evaluateSessionValidity({
      measures: score.measures,
      completed: input.completed,
      clockHealthy: input.clockHealthy,
      contextConfounder: input.contextConfounder,
      participated: input.completed || input.attempts.length > 0,
    }),
  };
}
