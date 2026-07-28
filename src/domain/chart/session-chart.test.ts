import { describe, expect, it } from "vitest";

import { createSessionChart, cueAt } from "./session-chart";

describe("session chart", () => {
  it("authors a four-minute standing session from the audio timeline", () => {
    const chart = createSessionChart("standing");

    expect(chart.durationMs).toBe(240_000);
    expect(chart.cues[0]?.atMs).toBe(4_000);
    expect(chart.cues.some((cue) => cue.section === "warmup")).toBe(true);
    expect(chart.cues.find((cue) => cue.atMs >= 30_000)?.section).toBe(
      "follow",
    );
    expect(chart.cues.find((cue) => cue.atMs >= 90_000)?.section).toBe(
      "rhythm",
    );
    expect(chart.cues.find((cue) => cue.atMs >= 165_000)?.section).toBe(
      "memory",
    );
    expect(chart.cues.some((cue) => cue.section === "memory")).toBe(true);
    expect(chart.cues.some((cue) => cue.action === "hold")).toBe(true);
  });

  it("keeps the accelerated chart phase proportions", () => {
    const chart = createSessionChart("standing", { accelerated: true });

    expect(chart.cues.map((cue) => cue.section)).toContain("warmup");
    expect(chart.cues.map((cue) => cue.section)).toContain("follow");
    expect(chart.cues.map((cue) => cue.section)).toContain("rhythm");
    expect(chart.cues.map((cue) => cue.section)).toContain("memory");
  });

  it("keeps the seated chart within its own cue vocabulary (BR-016)", () => {
    const chart = createSessionChart("seated");
    const expected = new Set([
      "left-palm",
      "right-palm",
      "both-palms",
      "index-hold",
      null,
    ]);

    expect(chart.cues.every((cue) => expected.has(cue.expected))).toBe(true);
  });

  it("looks up cues by elapsed audio time", () => {
    const chart = createSessionChart("standing");

    expect(cueAt(chart, 4_180)?.id).toBe("standing-1");
    expect(cueAt(chart, 7_000)).toBeUndefined();
  });
});
