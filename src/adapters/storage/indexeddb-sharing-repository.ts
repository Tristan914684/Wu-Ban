import type {
  CheckInSendAudit,
  SharingRepository,
} from "../../application/ports/sharing-repository";
import type { SupporterGrant } from "../../domain/sharing/supporter-grant";
import {
  GRANT_STORE_NAME,
  SEND_AUDIT_STORE_NAME,
  transactionComplete,
  unknownArrayResult,
  unknownResult,
  WubanDatabaseConnection,
} from "./wuban-database";

function isSupporterGrant(value: unknown): value is SupporterGrant {
  return (
    typeof value === "object" &&
    value !== null &&
    "schemaVersion" in value &&
    value.schemaVersion === 1 &&
    "grantId" in value &&
    typeof value.grantId === "string" &&
    "supporterBindingId" in value &&
    typeof value.supporterBindingId === "string" &&
    "scope" in value &&
    value.scope === "trend-summary-check-in" &&
    "consentVersion" in value &&
    value.consentVersion === 1 &&
    "grantedAt" in value &&
    typeof value.grantedAt === "string" &&
    "revokedAt" in value &&
    (typeof value.revokedAt === "string" || value.revokedAt === null)
  );
}

function isSendAudit(value: unknown): value is CheckInSendAudit {
  return (
    typeof value === "object" &&
    value !== null &&
    "schemaVersion" in value &&
    value.schemaVersion === 1 &&
    "commandId" in value &&
    typeof value.commandId === "string" &&
    "grantId" in value &&
    typeof value.grantId === "string" &&
    "trendEventId" in value &&
    typeof value.trendEventId === "string" &&
    "attemptedAt" in value &&
    typeof value.attemptedAt === "string" &&
    "result" in value &&
    (value.result === "sent" ||
      value.result === "unavailable" ||
      value.result === "failed")
  );
}

export class IndexedDbSharingRepository implements SharingRepository {
  private readonly connection = new WubanDatabaseConnection();

  private database(): Promise<IDBDatabase> {
    return this.connection.open();
  }

  async saveGrant(grant: SupporterGrant): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(GRANT_STORE_NAME, "readwrite");
    transaction.objectStore(GRANT_STORE_NAME).put(grant);
    await transactionComplete(transaction);
  }

  async latestGrant(): Promise<SupporterGrant | null> {
    const database = await this.database();
    const transaction = database.transaction(GRANT_STORE_NAME, "readonly");
    const records = await unknownArrayResult(
      transaction.objectStore(GRANT_STORE_NAME).getAll(),
    );
    await transactionComplete(transaction);
    return (
      records
        .filter(isSupporterGrant)
        .sort((left, right) =>
          right.grantedAt.localeCompare(left.grantedAt),
        )
        .at(0) ?? null
    );
  }

  async saveAudit(audit: CheckInSendAudit): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(
      SEND_AUDIT_STORE_NAME,
      "readwrite",
    );
    transaction.objectStore(SEND_AUDIT_STORE_NAME).put(audit);
    await transactionComplete(transaction);
  }

  async findAudit(commandId: string): Promise<CheckInSendAudit | null> {
    const database = await this.database();
    const transaction = database.transaction(
      SEND_AUDIT_STORE_NAME,
      "readonly",
    );
    const value = await unknownResult(
      transaction.objectStore(SEND_AUDIT_STORE_NAME).get(commandId),
    );
    await transactionComplete(transaction);
    return isSendAudit(value) ? value : null;
  }

  async clear(): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(
      [GRANT_STORE_NAME, SEND_AUDIT_STORE_NAME],
      "readwrite",
    );
    transaction.objectStore(GRANT_STORE_NAME).clear();
    transaction.objectStore(SEND_AUDIT_STORE_NAME).clear();
    await transactionComplete(transaction);
  }
}
