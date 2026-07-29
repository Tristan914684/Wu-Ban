/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BrowserCamera } from "../../adapters/camera/browser-camera";
import { MediaPipeLandmarkDetector } from "../../adapters/pose/mediapipe-landmark-detector";
import { practiceHomeStatusLabel } from "./practice-home-status";
import { TutorialScreen } from "./TutorialScreen";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("TutorialScreen practice hierarchy", () => {
  it("keeps the camera stage primary and explains the centred home position", () => {
    vi.useFakeTimers();
    const { container } = render(
      <TutorialScreen
        audioPreparing={false}
        calibration={null}
        camera={new BrowserCamera()}
        detector={new MediaPipeLandmarkDetector()}
        language="en"
        mode="standing"
        onStart={vi.fn().mockResolvedValue(undefined)}
        onSwitchToSeated={vi.fn()}
        source="synthetic"
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Feet on the centre marks. Return after each step.",
    });
    expect(document.activeElement).toBe(heading);
    expect(
      container.querySelector("[data-practice-stage]"),
    ).toBeInTheDocument();
    expect(screen.getByText("Position guide")).toBeInTheDocument();
    expect(screen.getByText("CENTRE / HOME")).toBeInTheDocument();
    expect(
      screen.getAllByText(
        "After every step, place both feet back on the two marks before the next repetition.",
      ),
    ).toHaveLength(1);
  });

  it("uses seated-specific home position guidance", () => {
    vi.useFakeTimers();
    render(
      <TutorialScreen
        audioPreparing={false}
        calibration={null}
        camera={new BrowserCamera()}
        detector={new MediaPipeLandmarkDetector()}
        language="en"
        mode="seated"
        onStart={vi.fn().mockResolvedValue(undefined)}
        onSwitchToSeated={vi.fn()}
        source="synthetic"
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Hands by your shoulders. Reset after each gesture.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Keep both hands beside your shoulders")[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(
        "Keep your body centred. After each gesture, return both hands beside your shoulders.",
      ),
    ).toHaveLength(1);
  });

  it("names the physical reset action after a counted movement", () => {
    expect(
      practiceHomeStatusLabel("en", "seated", {
        kind: "movement",
        cue: "right-palm",
        confidence: 1,
      }),
    ).toBe("Gesture counted — lower both hands beside your shoulders");
    expect(
      practiceHomeStatusLabel("en", "standing", {
        kind: "movement",
        cue: "step-left",
        confidence: 1,
      }),
    ).toBe("Step counted — place both feet back on the centre marks");
  });
});
