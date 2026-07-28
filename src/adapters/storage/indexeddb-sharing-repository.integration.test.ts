import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import {
  createSupporterGrant,
  revokeSupporterGrant,
} from "../../domain/sharing/supporter-grant";
import { IndexedDbSharingRepository } from "./indexeddb-sharing-repository";

const repository = new IndexedDbSharingRepository();

beforeEach(async () => {
  await repository.clear();
});

describe("IndexedDbSharingRepository", () => {
  it("persists the latest grant and revocation", async () => {
    const active = createSupporterGrant({
      grantId: "grant-1",
      supporterBindingId: "opaque-supporter",
      grantedAt: "2026-07-26T10:00:00.000Z",
    });
    await repository.saveGrant(active);
    await repository.saveGrant(
      revokeSupporterGrant(active, "2026-07-26T11:00:00.000Z"),
    );

    await expect(repository.latestGrant()).resolves.toMatchObject({
      grantId: "grant-1",
      revokedAt: "2026-07-26T11:00:00.000Z",
    });
  });

  it("stores and reuses privacy-safe send audit outcomes", async () => {
    await repository.saveAudit({
      schemaVersion: 1,
      commandId: "command-1",
      grantId: "grant-1",
      trendEventId: "trend-1",
      attemptedAt: "2026-07-26T12:00:00.000Z",
      result: "unavailable",
    });

    const audit = await repository.findAudit("command-1");
    expect(audit).toEqual({
      schemaVersion: 1,
      commandId: "command-1",
      grantId: "grant-1",
      trendEventId: "trend-1",
      attemptedAt: "2026-07-26T12:00:00.000Z",
      result: "unavailable",
    });
    expect(audit === null ? true : "message" in audit).toBe(false);
  });
});
