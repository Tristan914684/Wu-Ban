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
});
