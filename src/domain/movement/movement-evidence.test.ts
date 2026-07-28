import { describe, expect, it } from "vitest";

import { createSessionChart } from "../chart/session-chart";
import type { CueAttempt } from "../scoring/session-score";
import { createMovementEvidenceReport } from "./movement-evidence";

const attempts: readonly CueAttempt[] = [
  {
    cueId: "private-left-match",
    expected: "step-left",
    observed: "step-left",
    timingOffsetMs: -100,
    scoreable: true,
  },
  {
    cueId: "private-left-confusion",
    expected: "step-left",
    observed: "step-right",
    timingOffsetMs: 180,
    scoreable: true,
  },
  {
    cueId: "private-forward-unclear",
    expected: "step-forward",
    observed: null,
    timingOffsetMs: null,
    scoreable: false,
  },
  {
    cueId: "private-back-neutral",
    expected: "step-back",
    observed: null,
    timingOffsetMs: null,
    scoreable: true,
  },
  {
    cueId: "private-no-go",
    expected: null,
    observed: null,
    timingOffsetMs: 0,
    scoreable: true,
  },
  {
    cueId: "private-wrong-mode",
    expected: "left-palm",
    observed: "left-palm",
    timingOffsetMs: 0,
    scoreable: true,
  },
];

describe("movement evidence report", () => {
  it("builds a confusion matrix and aggregate rates from move cues", () => {
    const report = createMovementEvidenceReport(
      createSessionChart("standing"),
      attempts,
    );

    expect(report).toMatchObject({
      totalMoveCues: 4,
      scoreableMoveCues: 3,
      matchedMoveCues: 1,
      scoreableRate: 0.75,
      overallMatchRate: 0.25,
      scoreableMatchRate: 1 / 3,
      absoluteTimingErrorP95Ms: 100,
    });
    expect(report.confusion).toEqual([
      {
        expected: "step-left",
        total: 2,
        outcomes: { "step-left": 1, "step-right": 1 },
      },
      { expected: "step-right", total: 0, outcomes: {} },
      {
        expected: "step-forward",
        total: 1,
        outcomes: { unscoreable: 1 },
      },
      {
        expected: "step-back",
        total: 1,
        outcomes: { neutral: 1 },
      },
    ]);
  });

  it("contains aggregates without cue IDs, attempts, or landmark data", () => {
    const serialized = JSON.stringify(
      createMovementEvidenceReport(
        createSessionChart("standing"),
        attempts,
      ),
    );

    expect(serialized).not.toContain("private-");
    expect(serialized).not.toContain("cueId");
    expect(serialized).not.toContain("attempts");
    expect(serialized).not.toContain("landmark");
    expect(serialized).toContain("aggregate-cue-outcomes-only");
  });
});
