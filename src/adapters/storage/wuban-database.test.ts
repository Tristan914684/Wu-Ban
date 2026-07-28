import { describe, expect, it, vi } from "vitest";

import { WubanDatabaseConnection } from "./wuban-database";

describe("WubanDatabaseConnection", () => {
  it("drops a failed opening attempt so a later read can retry", async () => {
    const database = {} as IDBDatabase;
    const openDatabase = vi
      .fn<(onVersionChange: () => void) => Promise<IDBDatabase>>()
      .mockRejectedValueOnce(new Error("temporarily unavailable"))
      .mockResolvedValueOnce(database);
    const connection = new WubanDatabaseConnection(openDatabase);

    await expect(connection.open()).rejects.toThrow(
      "temporarily unavailable",
    );
    await expect(connection.open()).resolves.toBe(database);
    expect(openDatabase).toHaveBeenCalledTimes(2);
  });
});
