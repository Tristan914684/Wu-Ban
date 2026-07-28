import { describe, expect, it } from "vitest";

import { buildSessionSummary } from "../../test-support/session-summary-builder";
import { sessionsThisWeek } from "./weekly-participation";

describe("weekly participation", () => {
  it("counts credited sessions in the current local week", () => {
    const now = new Date("2026-07-26T12:00:00+08:00");
    const summaries = [
      buildSessionSummary({ completedAt: "2026-07-20T09:00:00+08:00" }),
      buildSessionSummary({ completedAt: "2026-07-26T09:00:00+08:00" }),
      buildSessionSummary({ completedAt: "2026-07-19T09:00:00+08:00" }),
    ];

    expect(sessionsThisWeek(summaries, now)).toBe(2);
  });

  it("does not turn simulated demonstrations into weekly participation", () => {
    const now = new Date("2026-07-26T12:00:00+08:00");

    expect(
      sessionsThisWeek(
        [
          buildSessionSummary({
            completedAt: "2026-07-26T09:00:00+08:00",
            simulated: true,
          }),
        ],
        now,
      ),
    ).toBe(0);
  });
});
