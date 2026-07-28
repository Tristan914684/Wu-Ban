import type { SupporterGrant } from "../../domain/sharing/supporter-grant";

export type CheckInAuditResult = "sent" | "unavailable" | "failed";

export interface CheckInSendAudit {
  readonly schemaVersion: 1;
  readonly commandId: string;
  readonly grantId: string;
  readonly trendEventId: string;
  readonly attemptedAt: string;
  readonly result: CheckInAuditResult;
}

export interface SharingRepository {
  saveGrant(grant: SupporterGrant): Promise<void>;
  latestGrant(): Promise<SupporterGrant | null>;
  saveAudit(audit: CheckInSendAudit): Promise<void>;
  findAudit(commandId: string): Promise<CheckInSendAudit | null>;
  clear(): Promise<void>;
}

