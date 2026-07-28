import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import type { SessionSummary } from "../../domain/session/session-summary";
import { IndexedDbSessionRepository } from "./indexeddb-session-repository";
import {
  openWubanDatabase,
  SESSION_STORE_NAME,
  transactionComplete,
} from "./wuban-database";

const summary: SessionSummary = {
  schemaVersion: 1,
  sessionId: "session-1",
  completedAt: "2026-07-26T00:00:00.000Z",
  mode: "seated",
  chartId: "seated-demo-fast",
  chartVersion: 1,
  classifierVersion: 1,
  qualityVersion: 1,
  scoringVersion: 1,
  simulated: true,
  score: {
    funScore: 800,
    outcomes: ["good"],
    measures: {
      beatAccuracy: 0.8,
      shapeAccuracy: 0.8,
      flowRecovery: 0.8,
      memoryControl: 1,
      scoreableRatio: 1,
    },
  },
  validity: {
    validForTrend: true,
    participationCredit: true,
    exclusionReasons: [],
  },
};

async function storeRawSession(value: object): Promise<void> {
  const database = await openWubanDatabase();
  const transaction = database.transaction(
    SESSION_STORE_NAME,
    "readwrite",
  );
  transaction.objectStore(SESSION_STORE_NAME).put(value);
  await transactionComplete(transaction);
  database.close();
}

describe("IndexedDB session repository", () => {
  const repository = new IndexedDbSessionRepository();

  beforeEach(async () => {
    await repository.clear();
  });

  it("stores derived summaries without media or landmarks (BR-002)", async () => {
    await repository.save(summary);

    const stored = await repository.list();
    expect(stored).toEqual([summary]);
    expect(JSON.stringify(stored)).not.toMatch(/frame|landmark|video|image/i);
  });

  it("clears local derived history", async () => {
    await repository.save(summary);
    await repository.clear();

    expect(await repository.list()).toEqual([]);
  });

  it("ignores malformed summaries and strips unexpected stored fields", async () => {
    await repository.save(summary);
    await storeRawSession({
      ...summary,
      sessionId: "session-corrupted",
      score: {
        ...summary.score,
        measures: {
          ...summary.score.measures,
          memoryControl: "not-a-number",
        },
      },
    });
    await storeRawSession({
      ...summary,
      sessionId: "session-extra-field",
      cameraFrame: "must-not-leave-storage-boundary",
    });
    await storeRawSession({
      ...summary,
      sessionId: "session-noncanonical-date",
      completedAt: "2026-07-26T00:00:00Z",
    });

    const stored = await repository.list();

    expect(stored.map((record) => record.sessionId).sort()).toEqual([
      "session-1",
      "session-extra-field",
    ]);
    expect(JSON.stringify(stored)).not.toContain(
      "must-not-leave-storage-boundary",
    );
    expect(JSON.stringify(stored)).not.toMatch(
      /cameraFrame|video|image|landmark/i,
    );
  });
});
