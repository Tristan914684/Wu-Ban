import { describe, expect, it, vi } from "vitest";

import type { CheckInNotification } from "../ports/check-in-notification";
import type {
  CheckInSendAudit,
  SharingRepository,
} from "../ports/sharing-repository";
import { buildSessionSummary } from "../../test-support/session-summary-builder";
import {
  createSupporterGrant,
  revokeSupporterGrant,
} from "../../domain/sharing/supporter-grant";
import { evaluatePersonalTrend } from "../../domain/trend/personal-trend";
import { sendCheckIn } from "./send-check-in";

function report() {
  const baseline = Array.from({ length: 5 }, (_, index) =>
    buildSessionSummary({
      id: `session-${index}`,
      completedAt: new Date(Date.UTC(2026, 6, index + 1)).toISOString(),
    }),
  );
  const recent = Array.from({ length: 3 }, (_, index) =>
    buildSessionSummary({
      id: `session-${index + 5}`,
      completedAt: new Date(Date.UTC(2026, 6, index + 6)).toISOString(),
      ...(index < 2
        ? { measures: { beatAccuracy: 0.6, memoryControl: 0.6 } }
        : {}),
    }),
  );
  return evaluatePersonalTrend([...baseline, ...recent], {
    mode: "standing",
    simulated: false,
  });
}

function repository(): {
  readonly value: SharingRepository;
  readonly readAudit: () => CheckInSendAudit | null;
} {
  const grant = createSupporterGrant({
    grantId: "grant-1",
    supporterBindingId: "opaque-supporter",
    grantedAt: "2026-07-26T10:00:00.000Z",
  });
  let audit: CheckInSendAudit | null = null;
  return {
    readAudit: () => audit,
    value: {
      saveGrant: () => Promise.resolve(),
      latestGrant: () => Promise.resolve(grant),
      saveAudit: (next) => {
        audit = next;
        return Promise.resolve();
      },
      findAudit: () => Promise.resolve(audit),
      clear: () => Promise.resolve(),
    },
  };
}

describe("sendCheckIn", () => {
  it("fails closed when the transport is unavailable and stores no message body", async () => {
    const sharing = repository();
    const notification: CheckInNotification = {
      send: () => Promise.resolve({ kind: "unavailable" }),
    };

    const result = await sendCheckIn({
      report: report(),
      editedMessage: "Private preview body",
      repository: sharing.value,
      notification,
      attemptedAt: "2026-07-26T12:00:00.000Z",
    });

    expect(result).toEqual({ kind: "unavailable", duplicate: false });
    const audit = sharing.readAudit();
    expect(audit).not.toBeNull();
    expect(audit === null ? true : "message" in audit).toBe(false);
  });

  it("suppresses a duplicate command before the provider call", async () => {
    const sharing = repository();
    let sendCount = 0;
    const notification: CheckInNotification = {
      send: () => {
        sendCount += 1;
        return Promise.resolve({ kind: "sent" });
      },
    };
    const input = {
      report: report(),
      editedMessage: "Friendly check-in",
      repository: sharing.value,
      notification,
      attemptedAt: "2026-07-26T12:00:00.000Z",
    };

    await sendCheckIn(input);
    const retry = await sendCheckIn(input);

    expect(retry).toEqual({ kind: "sent", duplicate: true });
    expect(sendCount).toBe(1);
  });

  it("fails closed when sharing is revoked during the send attempt", async () => {
    const activeGrant = createSupporterGrant({
      grantId: "grant-race",
      supporterBindingId: "opaque-supporter",
      grantedAt: "2026-07-26T10:00:00.000Z",
    });
    const revokedGrant = revokeSupporterGrant(
      activeGrant,
      "2026-07-26T12:00:00.000Z",
    );
    let grantReadCount = 0;
    const send = vi.fn().mockResolvedValue({ kind: "sent" });
    const saveAudit = vi.fn().mockResolvedValue(undefined);
    const sharing: SharingRepository = {
      saveGrant: () => Promise.resolve(),
      latestGrant: () => {
        grantReadCount += 1;
        return Promise.resolve(
          grantReadCount === 1 ? activeGrant : revokedGrant,
        );
      },
      saveAudit,
      findAudit: () => Promise.resolve(null),
      clear: () => Promise.resolve(),
    };

    const result = await sendCheckIn({
      report: report(),
      editedMessage: "Friendly check-in",
      repository: sharing,
      notification: { send },
      attemptedAt: "2026-07-26T12:00:00.000Z",
    });

    expect(result).toEqual({
      kind: "blocked",
      reason: "sharing-inactive",
    });
    expect(grantReadCount).toBe(2);
    expect(send).not.toHaveBeenCalled();
    expect(saveAudit).not.toHaveBeenCalled();
  });

  it("fails closed when the supporter binding changes during the send attempt", async () => {
    const originalGrant = createSupporterGrant({
      grantId: "grant-binding-race",
      supporterBindingId: "original-supporter",
      grantedAt: "2026-07-26T10:00:00.000Z",
    });
    const substitutedGrant = {
      ...originalGrant,
      supporterBindingId: "substituted-supporter",
    };
    let grantReadCount = 0;
    const send = vi.fn().mockResolvedValue({ kind: "sent" });
    const saveAudit = vi.fn().mockResolvedValue(undefined);
    const sharing: SharingRepository = {
      saveGrant: () => Promise.resolve(),
      latestGrant: () => {
        grantReadCount += 1;
        return Promise.resolve(
          grantReadCount === 1 ? originalGrant : substitutedGrant,
        );
      },
      saveAudit,
      findAudit: () => Promise.resolve(null),
      clear: () => Promise.resolve(),
    };

    const result = await sendCheckIn({
      report: report(),
      editedMessage: "Friendly check-in",
      repository: sharing,
      notification: { send },
      attemptedAt: "2026-07-26T12:00:00.000Z",
    });

    expect(result).toEqual({
      kind: "blocked",
      reason: "sharing-changed",
    });
    expect(grantReadCount).toBe(2);
    expect(send).not.toHaveBeenCalled();
    expect(saveAudit).not.toHaveBeenCalled();
  });
});
