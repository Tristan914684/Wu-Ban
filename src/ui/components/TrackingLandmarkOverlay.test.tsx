/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  handFrame,
  handLandmarks,
  poseFrame,
} from "../../test-support/landmark-builders";
import {
  PerceptionStatus,
  TrackingLandmarkOverlay,
} from "./TrackingLandmarkOverlay";
import { trackingPartsLabel } from "./tracking-landmark-label";

afterEach(cleanup);

describe("tracking landmark debug overlay", () => {
  it("draws and names the standing landmarks used for calibration", () => {
    const frame = poseFrame();
    const { container } = render(
      <TrackingLandmarkOverlay
        frame={frame}
        language="en"
        mode="standing"
      />,
    );

    expect(
      container.querySelector('[data-landmark="leftAnkle"]'),
    ).toBeInTheDocument();
    expect(trackingPartsLabel(frame, "en", "standing")).toBe(
      "Shoulders ✓ · Hips ✓ · Ankles ✓",
    );
  });

  it("shows how many hands are visible in seated mode", () => {
    const frame = handFrame([
      handLandmarks("left", "open"),
      handLandmarks("right", "open"),
    ]);
    render(
      <TrackingLandmarkOverlay
        frame={frame}
        language="zh"
        mode="seated"
      />,
    );

    expect(screen.getByTitle("已识别双手：2 / 2")).toBeInTheDocument();
  });

  it("shows pose confidence and explains when the quality gate refuses a frame (BR-004)", () => {
    render(
      <PerceptionStatus
        frame={poseFrame({ confidence: 0.4 })}
        language="en"
        mode="standing"
        observation={{ kind: "unscoreable", reason: "low-confidence" }}
      />,
    );

    expect(screen.getByText("ON-DEVICE POSE AI")).toBeInTheDocument();
    expect(
      screen.getByText("Required-landmark confidence 40%"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Frame not used — confidence is below the 45% gate."),
    ).toBeInTheDocument();
  });

  it("does not invent a numeric hand-landmark confidence the SDK does not expose", () => {
    render(
      <PerceptionStatus
        frame={handFrame([handLandmarks("left", "open")])}
        language="en"
        mode="seated"
        observation={{ kind: "neutral" }}
      />,
    );

    expect(screen.getByText("ON-DEVICE HAND AI")).toBeInTheDocument();
    expect(screen.getByText("Model quality gate passed")).toBeInTheDocument();
    expect(screen.queryByText(/confidence 100%/i)).not.toBeInTheDocument();
    expect(
      screen.getByText("Frame accepted — movement rules may use it."),
    ).toBeInTheDocument();
  });
});
