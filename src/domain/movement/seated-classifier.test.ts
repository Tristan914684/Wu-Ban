import { describe, expect, it } from "vitest";

import {
  handFrame,
  handLandmarks,
} from "../../test-support/landmark-builders";
import { classifySeated } from "./seated-classifier";

describe("seated gesture traces", () => {
  it.each([
    ["left-palm", handFrame([handLandmarks("left", "open")])],
    ["right-palm", handFrame([handLandmarks("right", "open")])],
    [
      "both-palms",
      handFrame([
        handLandmarks("left", "open"),
        handLandmarks("right", "open"),
      ]),
    ],
    ["index-hold", handFrame([handLandmarks("right", "index")])],
  ] as const)("classifies the %s trace (BR-016)", (cue, frame) => {
    expect(classifySeated(frame)).toMatchObject({
      kind: "movement",
      cue,
    });
  });

  it("does not turn missing hands into a miss (BR-004)", () => {
    expect(classifySeated(handFrame([]))).toEqual({
      kind: "unscoreable",
      reason: "missing-landmarks",
    });
  });

  it("does not score a low-confidence hand (BR-004)", () => {
    expect(
      classifySeated(handFrame([handLandmarks("left", "open", 0.2)])),
    ).toEqual({
      kind: "unscoreable",
      reason: "low-confidence",
    });
  });

  it("pauses scoring when more than one seated player is detected", () => {
    expect(
      classifySeated(
        handFrame(
          [
            handLandmarks("left", "open"),
            handLandmarks("right", "open"),
            handLandmarks("left", "open"),
          ],
          2,
        ),
      ),
    ).toEqual({ kind: "unscoreable", reason: "multiple-people" });
  });
});
