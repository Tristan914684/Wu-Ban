import { describe, expect, it } from "vitest";

import { createSessionChart } from "../../domain/chart/session-chart";
import { createSessionSummary } from "./create-session-summary";

describe("session summary creation", () => {
  it("stores interrupted gameplay as invalid with a reason", () => {
    const summary = createSessionSummary({
      sessionId: "interrupted-1",
      endedAt: "2026-07-26T12:00:00.000Z",
      mode: "standing",
      chart: createSessionChart("standing"),
      source: "camera",
      attempts: [],
      completed: false,
      clockHealthy: true,
      contextConfounder: false,
    });

    expect(summary.score.funScore).toBe(0);
    expect(summary.validity).toMatchObject({
      validForTrend: false,
      participationCredit: false,
    });
    expect(summary.validity.exclusionReasons).toContain(
      "insufficient-scoreable-input",
    );
    expect(summary.validity.exclusionReasons).toContain("interrupted");
  });

  it("retains participation when at least one scored cue was attempted", () => {
    const summary = createSessionSummary({
      sessionId: "interrupted-2",
      endedAt: "2026-07-26T12:00:00.000Z",
      mode: "seated",
      chart: createSessionChart("seated"),
      source: "synthetic",
      attempts: [
        {
          cueId: "cue-1",
          expected: "left-palm",
          observed: "left-palm",
          timingOffsetMs: 120,
          scoreable: true,
        },
      ],
      completed: false,
      clockHealthy: true,
      contextConfounder: false,
    });

    expect(summary.validity.participationCredit).toBe(true);
    expect(summary.validity.exclusionReasons).toContain("interrupted");
  });
});
