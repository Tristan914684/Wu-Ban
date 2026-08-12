/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GameplayMusicVideo } from "./GameplayMusicVideo";

const play = vi.fn<() => Promise<void>>();
const pause = vi.fn<() => void>();

beforeEach(() => {
  play.mockReset();
  play.mockResolvedValue();
  pause.mockReset();
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const baseProps = {
  elapsedMs: 0,
  playback: "running" as const,
  poster: "/media/mo-li-hua-poster.webp",
  reducedMotion: false,
  src: "/media/mo-li-hua-mv.mp4",
};

describe("GameplayMusicVideo", () => {
  it("plays during running and tracking recovery, then pauses with the game", () => {
    const { getByTestId, rerender } = render(
      <GameplayMusicVideo {...baseProps} />,
    );

    const video = getByTestId("gameplay-mv");
    expect(video).toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveProperty("muted", true);
    expect(play).toHaveBeenCalledOnce();

    rerender(<GameplayMusicVideo {...baseProps} playback="paused" />);
    expect(pause).toHaveBeenCalledOnce();

    rerender(<GameplayMusicVideo {...baseProps} playback="tracking-lost" />);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it("re-aligns a resumed loop to the session time", () => {
    const { getByTestId, rerender } = render(
      <GameplayMusicVideo {...baseProps} playback="paused" />,
    );
    const video = getByTestId("gameplay-mv") as HTMLVideoElement;
    Object.defineProperty(video, "duration", {
      configurable: true,
      value: 24,
    });

    rerender(
      <GameplayMusicVideo
        {...baseProps}
        elapsedMs={37_000}
        playback="running"
      />,
    );

    expect(video.currentTime).toBe(13);
    expect(play).toHaveBeenCalledOnce();
  });

  it("keeps the MV playing when reduced dynamics is on", () => {
    const { getByTestId } = render(
      <GameplayMusicVideo {...baseProps} reducedMotion />,
    );

    expect(getByTestId("gameplay-mv")).toHaveAttribute(
      "data-reduced-motion",
      "true",
    );
    expect(play).toHaveBeenCalledOnce();
  });

  it("falls back to the poster without removing the stage", () => {
    const { getByTestId } = render(<GameplayMusicVideo {...baseProps} />);
    const layer = getByTestId("gameplay-mv-layer");

    fireEvent.error(getByTestId("gameplay-mv"));

    expect(layer).toHaveAttribute("data-mv-state", "fallback");
    expect(layer).toHaveStyle({
      backgroundImage: 'url("/media/mo-li-hua-poster.webp")',
    });
  });
});
