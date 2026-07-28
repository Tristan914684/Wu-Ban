/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BrowserCamera } from "../../adapters/camera/browser-camera";
import { MediaPipeLandmarkDetector } from "../../adapters/pose/mediapipe-landmark-detector";
import { CalibrationScreen } from "./CalibrationScreen";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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
