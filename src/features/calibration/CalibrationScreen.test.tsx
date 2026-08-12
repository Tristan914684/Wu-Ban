/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BrowserCamera } from "../../adapters/camera/browser-camera";
import { MediaPipeLandmarkDetector } from "../../adapters/pose/mediapipe-landmark-detector";
import {
  handFrame,
  handLandmarks,
  poseFrame,
} from "../../test-support/landmark-builders";
import { CalibrationScreen } from "./CalibrationScreen";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function installAnimationFrameQueue() {
  const callbacks: FrameRequestCallback[] = [];
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  return callbacks;
}

function runNextFrame(
  callbacks: FrameRequestCallback[],
  timestampMs: number,
) {
  const callback = callbacks.shift();
  if (callback === undefined) {
    throw new Error("Expected a queued calibration frame.");
  }
  act(() => {
    callback(timestampMs);
  });
}

describe("calibration provider recovery", () => {
  it("offers the labelled simulation fallback when model preparation fails", async () => {
    const camera = new BrowserCamera();
    const detector = new MediaPipeLandmarkDetector();
    const onComplete = vi.fn();
    const onUseSyntheticFallback = vi.fn();
    vi.spyOn(camera, "attachPreview").mockResolvedValue();
    vi.spyOn(detector, "load").mockRejectedValue(
      new Error("Test model load failed."),
    );

    render(
      <CalibrationScreen
        camera={camera}
        detector={detector}
        language="zh"
        mode="standing"
        onComplete={onComplete}
        onUseSyntheticFallback={onUseSyntheticFallback}
        source="camera"
      />,
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "本机动作模型没有准备好。你可以改用清楚标示的模拟演示。",
    );
    expect(screen.getByText("Test model load failed.")).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "改用模拟演示" }));

    expect(onUseSyntheticFallback).toHaveBeenCalledOnce();
  });
});

describe("calibration completion", () => {
  it("shows 100% only after freezing standing calibration", async () => {
    const callbacks = installAnimationFrameQueue();
    const camera = new BrowserCamera();
    const detector = new MediaPipeLandmarkDetector();
    const onComplete = vi.fn();
    vi.spyOn(
      HTMLMediaElement.prototype,
      "readyState",
      "get",
    ).mockReturnValue(HTMLMediaElement.HAVE_CURRENT_DATA);
    vi.spyOn(camera, "attachPreview").mockResolvedValue();
    vi.spyOn(detector, "load").mockResolvedValue();
    const detect = vi
      .spyOn(detector, "detect")
      .mockReturnValueOnce(poseFrame({ hipCenterX: 0.4 }))
      .mockReturnValueOnce(poseFrame({ hipCenterX: 0.5 }))
      .mockReturnValueOnce(poseFrame({ hipCenterX: 0.6 }));

    render(
      <CalibrationScreen
        camera={camera}
        detector={detector}
        language="en"
        mode="standing"
        onComplete={onComplete}
        onUseSyntheticFallback={vi.fn()}
        source="camera"
      />,
    );

    await screen.findByText("Stable tracking 0%");
    runNextFrame(callbacks, 100);
    runNextFrame(callbacks, 3_099);

    expect(screen.getByText("Stable tracking 99%")).toBeInTheDocument();
    expect(
      screen.queryByText("Calibration complete — 100%"),
    ).not.toBeInTheDocument();

    runNextFrame(callbacks, 3_179);

    expect(
      screen.getByText("Calibration complete — 100%"),
    ).toBeInTheDocument();
    expect(callbacks).toHaveLength(0);
    expect(detect).toHaveBeenCalledTimes(3);

    fireEvent.click(
      screen.getByRole("button", { name: "Position looks good" }),
    );
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ hipCenterX: 0.5 }),
    );
  });

  it("freezes seated calibration when true progress reaches 100%", async () => {
    const callbacks = installAnimationFrameQueue();
    const camera = new BrowserCamera();
    const detector = new MediaPipeLandmarkDetector();
    const onComplete = vi.fn();
    const frame = handFrame([
      handLandmarks("left", "open"),
      handLandmarks("right", "open"),
    ]);
    vi.spyOn(
      HTMLMediaElement.prototype,
      "readyState",
      "get",
    ).mockReturnValue(HTMLMediaElement.HAVE_CURRENT_DATA);
    vi.spyOn(camera, "attachPreview").mockResolvedValue();
    vi.spyOn(detector, "load").mockResolvedValue();
    const detect = vi.spyOn(detector, "detect").mockReturnValue(frame);

    render(
      <CalibrationScreen
        camera={camera}
        detector={detector}
        language="en"
        mode="seated"
        onComplete={onComplete}
        onUseSyntheticFallback={vi.fn()}
        source="camera"
      />,
    );

    await screen.findByText("Stable tracking 0%");
    runNextFrame(callbacks, 100);
    runNextFrame(callbacks, 3_099);

    expect(screen.getByText("Stable tracking 99%")).toBeInTheDocument();

    runNextFrame(callbacks, 3_179);

    expect(
      screen.getByText("Calibration complete — 100%"),
    ).toBeInTheDocument();
    expect(callbacks).toHaveLength(0);
    expect(detect).toHaveBeenCalledTimes(3);

    fireEvent.click(
      screen.getByRole("button", { name: "Position looks good" }),
    );
    expect(onComplete).toHaveBeenCalledWith(null);
  });
});
