import type { SessionRepository } from "../../application/ports/session-repository";
import type { SessionExclusionReason } from "../../domain/quality/session-validity";
import type { AttemptOutcome } from "../../domain/scoring/session-score";
import type { SessionSummary } from "../../domain/session/session-summary";
import {
  SESSION_STORE_NAME,
  transactionComplete,
  unknownArrayResult,
  WubanDatabaseConnection,
} from "./wuban-database";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isUnitInterval(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}

function isCanonicalTimestamp(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const timestamp = Date.parse(value);
  return (
    Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString() === value
  );
}

function isAttemptOutcome(value: unknown): value is AttemptOutcome {
  return (
    value === "good" ||
    value === "nearly" ||
    value === "next" ||
    value === "unscoreable"
  );
}

function isExclusionReason(
  value: unknown,
): value is SessionExclusionReason {
  return (
    value === "insufficient-scoreable-input" ||
    value === "interrupted" ||
    value === "clock-error" ||
    value === "self-reported-context"
  );
}

function parseSessionSummary(value: unknown): SessionSummary | null {
  if (!isRecord(value)) {
    return null;
  }
  const score = value.score;
  const validity = value.validity;
  if (
    value.schemaVersion !== 1 ||
    typeof value.sessionId !== "string" ||
    value.sessionId.length === 0 ||
    !isCanonicalTimestamp(value.completedAt) ||
    (value.mode !== "standing" && value.mode !== "seated") ||
    typeof value.chartId !== "string" ||
    value.chartId.length === 0 ||
    value.chartVersion !== 1 ||
    (value.classifierVersion !== 1 && value.classifierVersion !== 2) ||
    value.qualityVersion !== 1 ||
    value.scoringVersion !== 1 ||
    typeof value.simulated !== "boolean" ||
    !isRecord(score) ||
    !isRecord(validity)
  ) {
    return null;
  }

  const measures = score.measures;
  if (
    typeof score.funScore !== "number" ||
    !Number.isInteger(score.funScore) ||
    score.funScore < 0 ||
    score.funScore > 1_000 ||
    !isRecord(measures) ||
    !isUnitInterval(measures.beatAccuracy) ||
    !isUnitInterval(measures.shapeAccuracy) ||
    !isUnitInterval(measures.flowRecovery) ||
    !isUnitInterval(measures.memoryControl) ||
    !isUnitInterval(measures.scoreableRatio) ||
    !isUnknownArray(score.outcomes) ||
    typeof validity.validForTrend !== "boolean" ||
    typeof validity.participationCredit !== "boolean" ||
    !isUnknownArray(validity.exclusionReasons)
  ) {
    return null;
  }

  const outcomes: AttemptOutcome[] = [];
  for (const outcome of score.outcomes) {
    if (!isAttemptOutcome(outcome)) {
      return null;
    }
    outcomes.push(outcome);
  }
  const exclusionReasons: SessionExclusionReason[] = [];
  for (const reason of validity.exclusionReasons) {
    if (!isExclusionReason(reason)) {
      return null;
    }
    exclusionReasons.push(reason);
  }
  if (validity.validForTrend !== (exclusionReasons.length === 0)) {
    return null;
  }

  return {
    schemaVersion: 1,
    sessionId: value.sessionId,
    completedAt: value.completedAt,
    mode: value.mode,
    chartId: value.chartId,
    chartVersion: 1,
    classifierVersion: value.classifierVersion,
    qualityVersion: 1,
    scoringVersion: 1,
    simulated: value.simulated,
    score: {
      funScore: score.funScore,
      measures: {
        beatAccuracy: measures.beatAccuracy,
        shapeAccuracy: measures.shapeAccuracy,
        flowRecovery: measures.flowRecovery,
        memoryControl: measures.memoryControl,
        scoreableRatio: measures.scoreableRatio,
      },
      outcomes,
    },
    validity: {
      validForTrend: validity.validForTrend,
      participationCredit: validity.participationCredit,
      exclusionReasons,
    },
  };
}

export class IndexedDbSessionRepository implements SessionRepository {
  private readonly connection = new WubanDatabaseConnection();

  private database(): Promise<IDBDatabase> {
    return this.connection.open();
  }

  async save(summary: SessionSummary): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(
      SESSION_STORE_NAME,
      "readwrite",
    );
    transaction.objectStore(SESSION_STORE_NAME).put(summary);
    await transactionComplete(transaction);
  }

  async list(): Promise<readonly SessionSummary[]> {
    const database = await this.database();
    const transaction = database.transaction(SESSION_STORE_NAME, "readonly");
    const records = await unknownArrayResult(
      transaction.objectStore(SESSION_STORE_NAME).getAll(),
    );
    await transactionComplete(transaction);
    const summaries = records.flatMap((record) => {
      const summary = parseSessionSummary(record);
      return summary === null ? [] : [summary];
    });
    return summaries.sort((left, right) =>
      right.completedAt.localeCompare(left.completedAt),
    );
  }

  async clear(): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(
      SESSION_STORE_NAME,
      "readwrite",
    );
    transaction.objectStore(SESSION_STORE_NAME).clear();
    await transactionComplete(transaction);
  }
}
