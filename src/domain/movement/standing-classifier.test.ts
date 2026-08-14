import { describe, expect, it } from "vitest";

import { poseFrame } from "../../test-support/landmark-builders";
import {
  averageStandingCalibrations,
  calibrateStanding,
  classifyStanding,
  standingCalibrationIssue,
} from "./standing-classifier";

describe("standing movement traces", () => {
  const calibrationFrame = poseFrame();
  const calibration = calibrateStanding(calibrationFrame);

  it("creates a calibration from a scoreable stance", () => {
    expect(calibration).toBeDefined();
  });

  it.each([
    ["left", { leftAnkleConfidence: 0.2 }],
    ["right", { rightAnkleConfidence: 0.2 }],
  ] as const)(
    "does not calibrate when the %s ankle is unclear",
    (_side, values) => {
      expect(calibrateStanding(poseFrame(values))).toBeUndefined();
    },
  );

  it("keeps generally low-confidence calibration separate from missing ankles", () => {
    expect(
      standingCalibrationIssue(poseFrame({ confidence: 0.2 })),
    ).toBe("low-confidence");
  });

  it("averages the stable calibration window instead of using one frame", () => {
    const first = calibrateStanding(poseFrame({ hipCenterX: 0.48 }));
    const second = calibrateStanding(poseFrame({ hipCenterX: 0.52 }));

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (first === undefined || second === undefined) {
      return;
    }

    expect(averageStandingCalibrations([first, second])).toMatchObject({
      hipCenterX: 0.5,
      leftAnkleX: 0.42,
      rightAnkleX: 0.58,
    });
  });

  it.each([
    ["step-left", poseFrame({ hipCenterX: 0.32 })],
    ["step-right", poseFrame({ hipCenterX: 0.68 })],
    [
      "step-forward",
      poseFrame({ bodyScale: 0.61, shoulderWidth: 0.26 }),
    ],
    ["step-back", poseFrame({ bodyScale: 0.43, shoulderWidth: 0.18 })],
  ] as const)("classifies the %s trace", (cue, frame) => {
    expect(calibration).toBeDefined();
    if (calibration === undefined) {
      return;
    }

    expect(classifyStanding(frame, calibration)).toMatchObject({
      kind: "movement",
      cue,
    });
  });

  it.each([
    ["step-left", poseFrame({ leftAnkleX: 0.38 })],
    ["step-right", poseFrame({ rightAnkleX: 0.62 })],
  ] as const)("recognizes a %s from foot movement before the hips move", (cue, frame) => {
    expect(calibration).toBeDefined();
    if (calibration === undefined) {
      return;
    }

    expect(classifyStanding(frame, calibration)).toMatchObject({
      kind: "movement",
      cue,
    });
  });

  it.each([
    ["step-left", poseFrame({ hipCenterX: 0.43 })],
    ["step-right", poseFrame({ hipCenterX: 0.57 })],
  ] as const)("recognizes a gentle %s when the ankles are not driving the trace", (cue, frame) => {
    expect(calibration).toBeDefined();
    if (calibration === undefined) {
      return;
    }

    expect(classifyStanding(frame, calibration)).toMatchObject({
      kind: "movement",
      cue,
    });
  });

  it.each([
    ["step-forward", poseFrame({ bodyScale: 0.56, shoulderWidth: 0.235 })],
    ["step-back", poseFrame({ bodyScale: 0.48, shoulderWidth: 0.205 })],
  ] as const)("recognizes a bounded %s without requiring a large depth change", (cue, frame) => {
    expect(calibration).toBeDefined();
    if (calibration === undefined) {
      return;
    }

    expect(classifyStanding(frame, calibration)).toMatchObject({
      kind: "movement",
      cue,
    });
  });

  it("uses the stronger forward signal when the stepping foot also drifts sideways", () => {
    expect(calibration).toBeDefined();
    if (calibration === undefined) {
      return;
    }

    expect(
      classifyStanding(
        poseFrame({ leftAnkleX: 0.38, leftAnkleY: 0.81 }),
        calibration,
      ),
    ).toMatchObject({
      kind: "movement",
      cue: "step-forward",
    });
  });

  it("keeps a small foot adjustment neutral", () => {
    expect(calibration).toBeDefined();
    if (calibration === undefined) {
      return;
    }

    expect(
      classifyStanding(poseFrame({ leftAnkleX: 0.39 }), calibration),
    ).toEqual({ kind: "neutral" });
  });

  it("treats a low-confidence trace as unscoreable (BR-004)", () => {
    expect(calibration).toBeDefined();
    if (calibration === undefined) {
      return;
    }

    expect(
      classifyStanding(poseFrame({ confidence: 0.2 }), calibration),
    ).toEqual({ kind: "unscoreable", reason: "low-confidence" });
  });

  it("pauses scoring when a companion overlaps the primary player", () => {
    expect(calibration).toBeDefined();
    if (calibration === undefined) {
      return;
    }

    expect(
      classifyStanding(poseFrame({ personCount: 2 }), calibration),
    ).toEqual({ kind: "unscoreable", reason: "multiple-people" });
  });
});
