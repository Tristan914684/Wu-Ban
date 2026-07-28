/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildSessionSummary } from "../../test-support/session-summary-builder";
import { CompletingScreen } from "./CompletingScreen";

afterEach(cleanup);

describe("session-summary persistence recovery", () => {
  it("does not complete until a failed local save is retried successfully", async () => {
    const summary = buildSessionSummary({ simulated: false });
    const commit = vi
      .fn<() => Promise<typeof summary>>()
      .mockRejectedValueOnce(new Error("IndexedDB unavailable"))
      .mockResolvedValueOnce(summary);
    const onCommitted = vi.fn();

    render(
      <CompletingScreen
        commit={commit}
        language="zh"
        onCommitted={onCommitted}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "只保存动作摘要。" }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "本机记录没有保存",
    );
    expect(onCommitted).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "重试保存" }));

    await waitFor(() => {
      expect(commit).toHaveBeenCalledTimes(2);
      expect(onCommitted).toHaveBeenCalledWith(summary);
    });
  });
});
