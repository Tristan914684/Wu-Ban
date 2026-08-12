/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { GameplayPhaseRail } from "./GameplayPhaseRail";

afterEach(cleanup);

describe("GameplayPhaseRail", () => {
  it("turns route progress into four understandable play phases", () => {
    render(
      <GameplayPhaseRail
        currentSection="rhythm"
        language="en"
        progress={0.5}
        remainingSeconds={120}
      />,
    );

    const region = screen.getByRole("region", { name: "Session progress" });
    expect(region).toBeVisible();
    expect(screen.getByText("Settle in")).toBeVisible();
    expect(screen.getByText("Follow the guide")).toBeVisible();
    expect(screen.getByText("Move to the beat")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByText("Remember the lanterns")).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "Session progress" })).toHaveValue(
      0.5,
    );
    expect(screen.getByText("2 min remaining")).toBeVisible();
  });

  it("uses a complete Chinese remaining-time phrase", () => {
    render(
      <GameplayPhaseRail
        currentSection="warmup"
        language="zh"
        progress={0.1}
        remainingSeconds={65}
      />,
    );

    expect(screen.getByText("约剩 2 分钟")).toBeVisible();
    expect(screen.getByText("热身准备")).toHaveAttribute(
      "aria-current",
      "step",
    );
  });
});
