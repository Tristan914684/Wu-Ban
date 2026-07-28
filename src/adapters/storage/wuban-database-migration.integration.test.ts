import "fake-indexeddb/auto";

import { describe, expect, it } from "vitest";

import {
  DATABASE_NAME,
  GRANT_STORE_NAME,
  openWubanDatabase,
  SEND_AUDIT_STORE_NAME,
  SESSION_STORE_NAME,
} from "./wuban-database";

function createVersionOneFixture(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.addEventListener("upgradeneeded", () => {
      request.result.createObjectStore(SESSION_STORE_NAME, {
        keyPath: "sessionId",
      });
    });
    request.addEventListener("success", () => {
      const database = request.result;
      const transaction = database.transaction(
        SESSION_STORE_NAME,
        "readwrite",
      );
      transaction.objectStore(SESSION_STORE_NAME).put({
        sessionId: "legacy-session",
        schemaVersion: 1,
      });
      transaction.addEventListener("complete", () => {
        database.close();
        resolve();
      });
      transaction.addEventListener("error", () => {
        reject(transaction.error ?? new Error("Fixture write failed."));
      });
    });
    request.addEventListener("error", () => {
      reject(request.error ?? new Error("Fixture database failed."));
    });
  });
}

function readLegacyRecord(database: IDBDatabase): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const request = database
      .transaction(SESSION_STORE_NAME, "readonly")
      .objectStore(SESSION_STORE_NAME)
      .get("legacy-session");
    request.addEventListener("success", () => {
      resolve(request.result as unknown);
    });
    request.addEventListener("error", () => {
      reject(request.error ?? new Error("Fixture read failed."));
    });
  });
}

describe("IndexedDB schema migration", () => {
  it("expands v1 without deleting existing session data", async () => {
    await createVersionOneFixture();

    const database = await openWubanDatabase();

    expect(database.version).toBe(2);
    expect(database.objectStoreNames.contains(SESSION_STORE_NAME)).toBe(true);
    expect(database.objectStoreNames.contains(GRANT_STORE_NAME)).toBe(true);
    expect(database.objectStoreNames.contains(SEND_AUDIT_STORE_NAME)).toBe(
      true,
    );
    await expect(readLegacyRecord(database)).resolves.toEqual({
      sessionId: "legacy-session",
      schemaVersion: 1,
    });
    database.close();
  });
});
