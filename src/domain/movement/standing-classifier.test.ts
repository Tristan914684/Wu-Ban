import { describe, expect, it } from "vitest";

import { poseFrame } from "../../test-support/landmark-builders";
import {
  averageStandingCalibrations,
  calibrateStanding,
  classifyStanding,
} from "./standing-classifier";

describe("standing movement traces", () => {
  const calibrationFrame = poseFrame();
  const calibration = calibrateStanding(calibrationFrame);

  it("creates a calibration from a scoreable stance", () => {
    expect(calibration).toBeDefined();
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
    ["step-left", poseFrame({ leftAnkleX: 0.34 })],
    ["step-right", poseFrame({ rightAnkleX: 0.66 })],
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
