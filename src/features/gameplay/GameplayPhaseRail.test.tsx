/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { GameplayPhaseRail } from "./GameplayPhaseRail";

afterEach(cleanup);

describe("GameplayPhaseRail", () => {
  it("reduces session progress to four large dots and time", () => {
    render(
      <GameplayPhaseRail
        currentSection="rhythm"
        language="en"
        progress={0.5}
        remainingSeconds={125}
      />,
    );

    const region = screen.getByRole("region", { name: "Session progress" });
    expect(region).toBeVisible();
    expect(screen.getAllByTestId("phase-dot")).toHaveLength(4);
    expect(screen.getByTestId("phase-dot-rhythm")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByText("2:05")).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "Session progress" })).toHaveValue(0.5);
    expect(screen.queryByText("Move to the beat")).not.toBeInTheDocument();
  });

  it("uses the same concise clock in Chinese", () => {
    render(
      <GameplayPhaseRail
        currentSection="warmup"
        language="zh"
        progress={0.1}
        remainingSeconds={65}
      />,
    );

    expect(screen.getByText("1:05")).toBeVisible();
    expect(screen.getByLabelText("热身，当前阶段")).toHaveAttribute(
      "aria-current",
      "step",
    );
  });
});
