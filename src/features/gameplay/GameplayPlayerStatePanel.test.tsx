/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { livePlayerState } from "./live-player-state";
import { GameplayPlayerStatePanel } from "./GameplayPlayerStatePanel";

afterEach(cleanup);

const baseProps = {
  language: "en" as const,
  mode: "standing" as const,
  source: "synthetic" as const,
  playerState: livePlayerState("en", "standing", { kind: "neutral" }),
  trackingIssue: null,
  videoRef: createRef<HTMLVideoElement>(),
};

describe("GameplayPlayerStatePanel", () => {
  it("shows one large standing location without framing explanations", () => {
    render(<GameplayPlayerStatePanel {...baseProps} />);

    expect(
      screen.getByRole("complementary", { name: "Your position" }),
    ).toBeVisible();
    expect(screen.getByText("YOU")).toBeVisible();
    expect(screen.getByText("●")).toBeVisible();
    expect(screen.getByText("At start position")).toBeVisible();
    expect(screen.queryByText("In frame")).not.toBeInTheDocument();
    expect(screen.queryByText("Practice figure")).not.toBeInTheDocument();
    expect(screen.queryByText("CUE SUPPORT")).not.toBeInTheDocument();
  });

  it("uses the current direction as the dominant standing symbol", () => {
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

    expect(screen.getByText("→")).toBeVisible();
    expect(screen.getByText("Moving right")).toBeVisible();
    expect(
      screen.queryByText("Step seen; return both feet to the start marks"),
    ).not.toBeInTheDocument();
  });

  it("keeps hand-specific seated guidance equally compact", () => {
    render(
      <GameplayPlayerStatePanel
        {...baseProps}
        mode="seated"
        playerState={livePlayerState("en", "seated", { kind: "neutral" })}
      />,
    );

    expect(screen.getByText("Hands ready")).toBeVisible();
    expect(screen.getByText("●")).toBeVisible();
  });

  it("marks tracking uncertainty as not scored with one short action", () => {
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

    expect(screen.getByText("Not scored")).toBeVisible();
    expect(screen.getByText("One player only")).toBeVisible();
  });

  it("retains a hidden live video only as the camera inference input", () => {
    const videoRef = createRef<HTMLVideoElement>();
    render(
      <GameplayPlayerStatePanel
        {...baseProps}
        source="camera"
        videoRef={videoRef}
      />,
    );

    const input = screen.getByLabelText("Camera input for movement tracking");
    expect(input.tagName).toBe("VIDEO");
    expect(input).toHaveClass("player-state-panel__camera-input");
    expect(videoRef.current).toBe(input);
  });
});
