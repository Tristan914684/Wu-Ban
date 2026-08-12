/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppChrome } from "./AppChrome";

afterEach(cleanup);

const baseProps = {
  language: "en" as const,
  onLanguageChange: vi.fn(),
  reducedMotion: false,
  onReducedMotionChange: vi.fn(),
  simulated: true,
  silentPractice: false,
  cameraActive: false,
  onStop: vi.fn(),
};

describe("AppChrome gameplay context", () => {
  it("removes route numbering during scored play", () => {
    render(
      <AppChrome {...baseProps} phase="playing">
        <main>Gameplay</main>
      </AppChrome>,
    );

    expect(screen.queryByLabelText("Step 8")).not.toBeInTheDocument();
    expect(screen.queryByText("08 / 11")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Stop and exit" }),
    ).toBeVisible();
    expect(screen.getByText("SIMULATED")).toBeVisible();
    expect(screen.getByText("Video stays on this device")).toBeVisible();
  });

  it("keeps route numbering during setup", () => {
    render(
      <AppChrome {...baseProps} phase="calibrating">
        <main>Calibration</main>
      </AppChrome>,
    );

    expect(screen.getByLabelText("Step 5")).toHaveTextContent("05 / 11");
  });
});
