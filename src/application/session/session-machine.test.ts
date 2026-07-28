import { describe, expect, it } from "vitest";

import {
  initialSessionState,
  reduceSession,
  type SessionEvent,
} from "./session-machine";

describe("session state machine", () => {
  it("follows the disclosure-first synthetic path", () => {
    const events: readonly SessionEvent[] = [
      { type: "BEGIN" },
      { type: "DISCLOSURE_ACCEPTED" },
      { type: "USE_SYNTHETIC" },
      { type: "CHOOSE_MODE", mode: "seated" },
      { type: "SAFETY_ACCEPTED" },
      { type: "CALIBRATED" },
      { type: "TUTORIAL_COMPLETE" },
      { type: "COUNTDOWN_COMPLETE" },
      { type: "PLAY_COMPLETE" },
      { type: "COOLDOWN_COMPLETE" },
    ];
    const state = events.reduce(reduceSession, initialSessionState("session-1"));

    expect(state).toMatchObject({
      phase: "completing",
      source: "synthetic",
      mode: "seated",
    });
  });

  it("cannot acquire a source before disclosure (BR-001)", () => {
    const state = reduceSession(initialSessionState("session-1"), {
      type: "CAMERA_READY",
    });

    expect(state.source).toBeNull();
    expect(state.phase).toBe("idle");
  });

  it("creates a new identity when stopped so late results are stale", () => {
    const playing = {
      ...initialSessionState("session-1"),
      phase: "playing" as const,
    };

    expect(
      reduceSession(playing, {
        type: "STOP",
        nextSessionId: "session-2",
      }),
    ).toEqual(initialSessionState("session-2"));
  });

  it("returns through safety when the tutorial switches to seated mode", () => {
    const tutorial = {
      ...initialSessionState("session-1"),
      phase: "tutorial" as const,
      mode: "standing" as const,
      source: "camera" as const,
    };

    expect(
      reduceSession(tutorial, { type: "SWITCH_MODE", mode: "seated" }),
    ).toMatchObject({ phase: "safety", mode: "seated" });
  });

  it("uses the saved mode and skips first-time selection/tutorial for a returning player", () => {
    const events: readonly SessionEvent[] = [
      { type: "BEGIN_RETURNING", mode: "seated" },
      { type: "USE_SYNTHETIC" },
      { type: "SAFETY_ACCEPTED" },
      { type: "RETURNING_CALIBRATED" },
    ];
    const state = events.reduce(reduceSession, initialSessionState("return-1"));

    expect(state).toMatchObject({
      phase: "countdown",
      mode: "seated",
      source: "synthetic",
      returning: true,
    });
  });
});
