import type { SessionMode } from "../chart/session-chart";
import type { SessionValidity } from "../quality/session-validity";
import type { SessionScore } from "../scoring/session-score";

export interface SessionSummary {
  readonly schemaVersion: 1;
  readonly sessionId: string;
  readonly completedAt: string;
  readonly mode: SessionMode;
  readonly chartId: string;
  readonly chartVersion: 1;
  readonly classifierVersion: 1;
  readonly qualityVersion: 1;
  readonly scoringVersion: 1;
  readonly simulated: boolean;
  readonly score: SessionScore;
  readonly validity: SessionValidity;
}

