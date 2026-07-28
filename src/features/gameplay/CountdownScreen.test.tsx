/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CountdownScreen } from "./CountdownScreen";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("CountdownScreen", () => {
  it("advances without calling the parent transition during render", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    render(
      <CountdownScreen
        language="zh"
        onComplete={onComplete}
        reducedMotion
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
