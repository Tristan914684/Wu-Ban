/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SongLibraryScreen } from "./SongLibraryScreen";

afterEach(cleanup);

describe("SongLibraryScreen", () => {
  it("offers one clear playable song and honest unavailable choices", () => {
    const onBack = vi.fn();
    const onPlay = vi.fn();
    const onSelect = vi.fn();

    render(
      <SongLibraryScreen
        language="en"
        onBack={onBack}
        onPlay={onPlay}
        onSelect={onSelect}
        selectedSongId="mo-li-hua"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Choose your song" }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Choose your song" }),
    ).toHaveFocus();
    const playable = screen.getByRole("button", { name: "Play Mo Li Hua" });
    expect(playable).toBeEnabled();
    expect(screen.getByText("Standing + seated")).toBeVisible();
    expect(screen.getAllByText("Coming soon")).toHaveLength(3);
    screen.getAllByText("Pending rights review").forEach((label) => {
      expect(label).toHaveClass("visually-hidden");
    });
    expect(
      screen.getAllByRole("article", { name: /Coming soon/ }),
    ).toHaveLength(3);
    expect(
      screen.getAllByRole("button").filter((button) =>
        button.textContent.includes("Play"),
      ),
    ).toHaveLength(1);

    fireEvent.click(playable);
    expect(onPlay).toHaveBeenCalledExactlyOnceWith("mo-li-hua");
    expect(onSelect).toHaveBeenCalledExactlyOnceWith("mo-li-hua");
  });

  it("uses short Chinese labels for distance reading", () => {
    render(
      <SongLibraryScreen
        language="zh"
        onBack={vi.fn()}
        onPlay={vi.fn()}
        onSelect={vi.fn()}
        selectedSongId="mo-li-hua"
      />,
    );

    expect(screen.getByRole("heading", { name: "选择歌曲" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "播放《茉莉花》" }),
    ).toBeVisible();
    expect(screen.getByText("站立 · 坐姿")).toBeVisible();
    expect(screen.getAllByText("即将推出")).toHaveLength(3);
    screen.getAllByText("版权审核中").forEach((label) => {
      expect(label).toHaveClass("visually-hidden");
    });
  });
});
