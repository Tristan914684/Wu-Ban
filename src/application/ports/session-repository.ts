import type { SessionSummary } from "../../domain/session/session-summary";

export interface SessionRepository {
  save(summary: SessionSummary): Promise<void>;
  list(): Promise<readonly SessionSummary[]>;
  clear(): Promise<void>;
}

