import { describe, expect, it } from "vitest";

import { evaluateSessionValidity } from "./session-validity";

describe("session validity", () => {
  const clearMeasures = {
    beatAccuracy: 0.8,
    shapeAccuracy: 0.8,
    flowRecovery: 0.8,
    memoryControl: 0.8,
    scoreableRatio: 0.8,
  };

  it("allows a clear completed session to contribute to a trend", () => {
    expect(
      evaluateSessionValidity({
        measures: clearMeasures,
        completed: true,
        clockHealthy: true,
        contextConfounder: false,
      }),
    ).toEqual({
      validForTrend: true,
      participationCredit: true,
      exclusionReasons: [],
    });
  });

  it("excludes invalid input but preserves participation (BR-005, BR-006)", () => {
    const result = evaluateSessionValidity({
      measures: { ...clearMeasures, scoreableRatio: 0.4 },
      completed: true,
      clockHealthy: true,
      contextConfounder: false,
    });

    expect(result.validForTrend).toBe(false);
    expect(result.participationCredit).toBe(true);
    expect(result.exclusionReasons).toContain(
      "insufficient-scoreable-input",
    );
  });

  it("requires the PRD's 80% scoreable-input threshold", () => {
    const result = evaluateSessionValidity({
      measures: { ...clearMeasures, scoreableRatio: 0.79 },
      completed: true,
      clockHealthy: true,
      contextConfounder: false,
    });

    expect(result.validForTrend).toBe(false);
    expect(result.exclusionReasons).toContain(
      "insufficient-scoreable-input",
    );
  });

  it("keeps participation but excludes a self-reported unusual day", () => {
    const result = evaluateSessionValidity({
      measures: clearMeasures,
      completed: true,
      clockHealthy: true,
      contextConfounder: true,
    });

    expect(result.validForTrend).toBe(false);
    expect(result.participationCredit).toBe(true);
    expect(result.exclusionReasons).toContain("self-reported-context");
  });

  it("does not invent participation for an untouched interrupted session", () => {
    const result = evaluateSessionValidity({
      measures: { ...clearMeasures, scoreableRatio: 0 },
      completed: false,
      clockHealthy: true,
      contextConfounder: false,
      participated: false,
    });

    expect(result.participationCredit).toBe(false);
    expect(result.exclusionReasons).toContain("interrupted");
  });
});
