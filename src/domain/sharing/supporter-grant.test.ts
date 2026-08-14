import { describe, expect, it } from "vitest";

import { buildSessionSummary } from "../../test-support/session-summary-builder";
import { evaluatePersonalTrend } from "../trend/personal-trend";
import {
  authoriseCheckIn,
  createCheckInPreview,
} from "./check-in";
import {
  createSupporterGrant,
  isGrantActive,
  revokeSupporterGrant,
} from "./supporter-grant";

function usualReport() {
  const summaries = Array.from({ length: 8 }, (_, index) =>
    buildSessionSummary({
      id: `session-${index}`,
      completedAt: new Date(
        Date.UTC(2026, 6, index + 1),
      ).toISOString(),
    }),
  );
  return evaluatePersonalTrend(summaries, {
    mode: "standing",
    simulated: false,
  });
}

function improvingReport() {
  const baseline = Array.from({ length: 5 }, (_, index) =>
    buildSessionSummary({
      id: `baseline-${index}`,
      completedAt: new Date(
        Date.UTC(2026, 6, index + 1),
      ).toISOString(),
      measures: {
        beatAccuracy: 0.5,
        shapeAccuracy: 0.5,
        flowRecovery: 0.5,
        memoryControl: 0.5,
      },
    }),
  );
  const recent = [6, 7, 8].map((day) =>
    buildSessionSummary({
      id: `recent-${day}`,
      completedAt: new Date(Date.UTC(2026, 6, day)).toISOString(),
      measures: {
        beatAccuracy: day === 8 ? 0.55 : 0.75,
        shapeAccuracy: 0.5,
        flowRecovery: 0.5,
        memoryControl: day === 8 ? 0.55 : 0.75,
      },
    }),
  );

  return evaluatePersonalTrend([...baseline, ...recent], {
    mode: "standing",
    simulated: false,
  });
}

describe("supporter sharing", () => {
  it("is inactive until a purpose-specific grant exists (BR-009)", () => {
    expect(isGrantActive(null)).toBe(false);

    const grant = createSupporterGrant({
      grantId: "grant-1",
      supporterBindingId: "local-preview",
      grantedAt: "2026-07-26T10:00:00.000Z",
    });

    expect(isGrantActive(grant)).toBe(true);
    expect(grant.scope).toBe("trend-summary-check-in");
    expect(grant.consentVersion).toBe(1);
  });

  it("revokes future sharing without changing the underlying trend (BR-010)", () => {
    const report = usualReport();
    const grant = createSupporterGrant({
      grantId: "grant-1",
      supporterBindingId: "local-preview",
      grantedAt: "2026-07-26T10:00:00.000Z",
    });
    const revoked = revokeSupporterGrant(
      grant,
      "2026-07-26T11:00:00.000Z",
    );

    expect(isGrantActive(revoked)).toBe(false);
    expect(
      authoriseCheckIn(report, revoked, "Friendly check-in"),
    ).toEqual({ kind: "blocked", reason: "sharing-inactive" });
    expect(report.validSessionCount).toBe(8);
  });

  it("uses a stable idempotency command ID", () => {
    const report = {
      ...usualReport(),
      status: "sustained-shift" as const,
    };
    const grant = createSupporterGrant({
      grantId: "grant-1",
      supporterBindingId: "local-preview",
      grantedAt: "2026-07-26T10:00:00.000Z",
    });

    const first = authoriseCheckIn(report, grant, "Friendly check-in");
    const retry = authoriseCheckIn(report, grant, "Friendly check-in");

    expect(first).toEqual(retry);
    expect(first.kind).toBe("authorised");
  });

  it("keeps simulated history preview-only (BR-008, BR-011)", () => {
    const report = {
      ...usualReport(),
      simulated: true,
      status: "sustained-shift" as const,
    };
    const grant = createSupporterGrant({
      grantId: "grant-1",
      supporterBindingId: "local-preview",
      grantedAt: "2026-07-26T10:00:00.000Z",
    });

    expect(authoriseCheckIn(report, grant, "Preview")).toEqual({
      kind: "blocked",
      reason: "simulated-preview-only",
    });
  });

  it("creates calm non-diagnostic copy with uncertainty (BR-012, BR-013)", () => {
    const preview = createCheckInPreview(usualReport(), "en");

    expect(preview.message).toContain("can all affect");
    expect(preview.message).toContain("does not diagnose");
    expect(preview.message).not.toMatch(/MCI|risk score|urgent/i);
  });

  it("blocks sends when the prototype rule has no sustained shift", () => {
    const grant = createSupporterGrant({
      grantId: "grant-1",
      supporterBindingId: "local-preview",
      grantedAt: "2026-07-26T10:00:00.000Z",
    });

    expect(authoriseCheckIn(usualReport(), grant, "Preview")).toEqual({
      kind: "blocked",
      reason: "no-sustained-shift",
    });
  });

  it("does not authorise a supporter check-in for an improving gameplay trend", () => {
    const grant = createSupporterGrant({
      grantId: "grant-1",
      supporterBindingId: "local-preview",
      grantedAt: "2026-07-26T10:00:00.000Z",
    });
    const report = improvingReport();

    expect(report.performanceTrend).toBe("improving");
    expect(report.status).toBe("usual-range");
    expect(authoriseCheckIn(report, grant, "Preview")).toEqual({
      kind: "blocked",
      reason: "no-sustained-shift",
    });
  });
});
