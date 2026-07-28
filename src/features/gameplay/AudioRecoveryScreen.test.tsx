/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AudioRecoveryScreen } from "./AudioRecoveryScreen";

afterEach(cleanup);

describe("audio recovery", () => {
  it("stops before scored cues and offers an explicit retry", () => {
    const onRetry = vi.fn();
    const onContinueSilently = vi.fn();

    render(
      <AudioRecoveryScreen
        busy={false}
        language="zh"
        onContinueSilently={onContinueSilently}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "计分提示还没有开始",
    );
    fireEvent.click(screen.getByRole("button", { name: "重试声音" }));

    expect(onRetry).toHaveBeenCalledOnce();
    expect(onContinueSilently).not.toHaveBeenCalled();
  });

  it("labels the silent path and blocks duplicate actions while retrying", () => {
    const onRetry = vi.fn();
    const onContinueSilently = vi.fn();

    render(
      <AudioRecoveryScreen
        busy
        language="en"
        onContinueSilently={onContinueSilently}
        onRetry={onRetry}
      />,
    );

    expect(
      screen.getByText(
        "A completed silent practice keeps the fun result and participation, but never shapes the personal usual range.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Preparing sound…" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: "Continue as silent practice",
      }),
    ).toBeDisabled();
  });
});
