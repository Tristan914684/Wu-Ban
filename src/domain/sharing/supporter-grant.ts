export const SUPPORTER_SCOPE = "trend-summary-check-in" as const;
export const SUPPORTER_CONSENT_VERSION = 1 as const;

export interface SupporterGrant {
  readonly schemaVersion: 1;
  readonly grantId: string;
  readonly supporterBindingId: string;
  readonly scope: typeof SUPPORTER_SCOPE;
  readonly consentVersion: typeof SUPPORTER_CONSENT_VERSION;
  readonly grantedAt: string;
  readonly revokedAt: string | null;
}

export function createSupporterGrant(input: {
  readonly grantId: string;
  readonly supporterBindingId: string;
  readonly grantedAt: string;
}): SupporterGrant {
  return {
    schemaVersion: 1,
    grantId: input.grantId,
    supporterBindingId: input.supporterBindingId,
    scope: SUPPORTER_SCOPE,
    consentVersion: SUPPORTER_CONSENT_VERSION,
    grantedAt: input.grantedAt,
    revokedAt: null,
  };
}

export function revokeSupporterGrant(
  grant: SupporterGrant,
  revokedAt: string,
): SupporterGrant {
  return {
    ...grant,
    revokedAt,
  };
}

export function isGrantActive(
  grant: SupporterGrant | null,
): grant is SupporterGrant {
  return grant !== null && grant.revokedAt === null;
}
