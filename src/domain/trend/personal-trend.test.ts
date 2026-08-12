import { describe, expect, it } from "vitest";

import { buildSessionSummary } from "../../test-support/session-summary-builder";
import { evaluatePersonalTrend } from "./personal-trend";
import { createSimulatedTrendHistory } from "./simulated-history";

function datedSession(
  index: number,
  overrides: Parameters<typeof buildSessionSummary>[0] = {},
) {
  return buildSessionSummary({
    id: `session-${index}`,
    completedAt: new Date(
      Date.UTC(2026, 6, index, 9, 0, 0),
    ).toISOString(),
    ...overrides,
  });
}

describe("personal trend rule", () => {
  it("reports the exact remaining baseline count", () => {
    const report = evaluatePersonalTrend(
      [datedSession(1), datedSession(2), datedSession(3)],
      { mode: "standing", simulated: false },
    );

    expect(report.status).toBe("insufficient-history");
    expect(report.validSessionCount).toBe(3);
    expect(report.sessionsNeeded).toBe(2);
  });

  it("excludes invalid, different-mode, and simulated sessions (BR-005, BR-008)", () => {
    const records = [
      datedSession(1),
      datedSession(2),
      datedSession(3, { validForTrend: false }),
      datedSession(4, { mode: "seated" }),
      datedSession(5, { simulated: true }),
    ];

    const report = evaluatePersonalTrend(records, {
      mode: "standing",
      simulated: false,
    });

    expect(report.validSessionCount).toBe(2);
    expect(report.sessionsNeeded).toBe(3);
  });

  it("does not infer a sustained shift before three later sessions", () => {
    const records = Array.from({ length: 6 }, (_, index) =>
      datedSession(
        index + 1,
        index === 5
          ? { measures: { beatAccuracy: 0.5, memoryControl: 0.5 } }
          : {},
      ),
    );

    const report = evaluatePersonalTrend(records, {
      mode: "standing",
      simulated: false,
    });

    expect(report.status).toBe("baseline-ready");
    expect(report.sustainedFamilies).toEqual([]);
  });

  it("requires two shifted families in two of the last three sessions", () => {
    const baseline = Array.from({ length: 5 }, (_, index) =>
      datedSession(index + 1),
    );
    const recent = [
      datedSession(6, {
        measures: { beatAccuracy: 0.6, memoryControl: 0.6 },
      }),
      datedSession(7, {
        measures: { beatAccuracy: 0.62, memoryControl: 0.61 },
      }),
      datedSession(8),
    ];

    const report = evaluatePersonalTrend([...baseline, ...recent], {
      mode: "standing",
      simulated: false,
    });

    expect(report.status).toBe("sustained-shift");
    expect(report.sustainedFamilies).toEqual(["beat", "memory"]);
    expect(report.ruleVersion).toBe(1);
    expect(report.analysisWindow).toEqual({
      startedAt: "2026-07-01T09:00:00.000Z",
      endedAt: "2026-07-08T09:00:00.000Z",
      dayCount: 8,
    });
    expect(report.metricEvidence?.beat).toMatchObject({
      recentMedian: 0.62,
      changeFromBaseline: -0.23,
      shiftedRecentSessionCount: 2,
      status: "repeated-change",
    });
    expect(report.metricEvidence?.shape).toMatchObject({
      recentMedian: 0.85,
      changeFromBaseline: 0,
      shiftedRecentSessionCount: 0,
      status: "within-usual-range",
    });
  });

  it("reports that each area is still collecting when fewer than three recent sessions exist", () => {
    const records = Array.from({ length: 6 }, (_, index) =>
      datedSession(
        index + 1,
        index === 5
          ? { measures: { beatAccuracy: 0.5, memoryControl: 0.5 } }
          : {},
      ),
    );

    const report = evaluatePersonalTrend(records, {
      mode: "standing",
      simulated: false,
    });

    expect(report.metricEvidence?.beat).toMatchObject({
      recentMedian: 0.5,
      shiftedRecentSessionCount: 1,
      status: "collecting",
    });
    expect(report.sustainedFamilies).toEqual([]);
  });

  it("keeps deterministic demo history visibly simulated", () => {
    const history = createSimulatedTrendHistory("standing");
    const report = evaluatePersonalTrend(history, {
      mode: "standing",
      simulated: true,
    });

    expect(history.every((session) => session.simulated)).toBe(true);
    expect(report.simulated).toBe(true);
    expect(report.status).toBe("sustained-shift");
    expect(report.sustainedFamilies).toEqual(["beat", "memory"]);
    expect(report.analysisWindow?.dayCount).toBeGreaterThanOrEqual(49);
  });
});
