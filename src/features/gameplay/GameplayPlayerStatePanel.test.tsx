/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { livePlayerState } from "./live-player-state";
import { GameplayPlayerStatePanel } from "./GameplayPlayerStatePanel";

afterEach(cleanup);

const baseProps = {
  language: "en" as const,
  mode: "standing" as const,
  source: "synthetic" as const,
  playerState: livePlayerState("en", "standing", { kind: "neutral" }),
  trackingIssue: null,
  cueSupport: 1 as const,
  videoRef: createRef<HTMLVideoElement>(),
  onMakeGentler: vi.fn(),
};

describe("GameplayPlayerStatePanel", () => {
  it("separates framing from the standing start position", () => {
    render(<GameplayPlayerStatePanel {...baseProps} />);

    expect(
      screen.getByRole("complementary", {
        name: "Your position and tracking",
      }),
    ).toBeVisible();
    expect(screen.getByText("In frame")).toBeVisible();
    expect(screen.getByText("At start position")).toBeVisible();
    expect(
      screen.getByRole("group", { name: "Your movement position" }),
    ).toBeVisible();
    expect(screen.getAllByTestId("compass-position")).toHaveLength(5);
    expect(screen.getByText("Practice figure")).toBeVisible();
    expect(screen.queryByRole("video")).not.toBeInTheDocument();
  });

  it("gives a concrete reset instruction after a standing step", () => {
    render(
      <GameplayPlayerStatePanel
        {...baseProps}
        playerState={livePlayerState("en", "standing", {
          kind: "movement",
          cue: "step-right",
          confidence: 0.8,
        })}
      />,
    );

    expect(screen.getByText("Moving right")).toBeVisible();
    expect(
      screen.getByText("Step seen; return both feet to the start marks"),
    ).toBeVisible();
  });

  it("uses hand-specific framing and home language in seated mode", () => {
    render(
      <GameplayPlayerStatePanel
        {...baseProps}
        mode="seated"
        playerState={livePlayerState("en", "seated", { kind: "neutral" })}
      />,
    );

    expect(screen.getByText("Hands visible")).toBeVisible();
    expect(screen.getByText("Hands ready")).toBeVisible();
    expect(
      screen.queryByRole("group", { name: "Your movement position" }),
    ).not.toBeInTheDocument();
  });

  it("marks tracking uncertainty as unscored and non-blaming", () => {
    render(
      <GameplayPlayerStatePanel
        {...baseProps}
        playerState={livePlayerState("en", "standing", {
          kind: "unscoreable",
          reason: "multiple-people",
        })}
        trackingIssue="multiple-people"
      />,
    );

    expect(screen.getByText("More than one person")).toBeVisible();
    expect(screen.getByText("Not scored")).toBeVisible();
    expect(
      screen.getByText("Keep one player inside the start outline"),
    ).toBeVisible();
  });

  it("renders the full current camera view only for camera input", () => {
    const videoRef = createRef<HTMLVideoElement>();
    render(
      <GameplayPlayerStatePanel
        {...baseProps}
        source="camera"
        videoRef={videoRef}
      />,
    );

    const preview = screen.getByLabelText("Current camera view");
    expect(preview.tagName).toBe("VIDEO");
    expect(videoRef.current).toBe(preview);
    expect(screen.queryByText("Practice figure")).not.toBeInTheDocument();
  });
});
