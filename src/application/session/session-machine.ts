import type { SessionMode } from "../../domain/chart/session-chart";
import type { SessionSummary } from "../../domain/session/session-summary";

export type InputSource = "camera" | "synthetic";
export type SessionPhase =
  | "idle"
  | "disclosure"
  | "permission"
  | "mode"
  | "safety"
  | "calibrating"
  | "tutorial"
  | "countdown"
  | "playing"
  | "cooldown"
  | "completing"
  | "result";

export interface SessionState {
  readonly phase: SessionPhase;
  readonly source: InputSource | null;
  readonly mode: SessionMode | null;
  readonly playback: "running" | "paused" | "tracking-lost";
  readonly permissionError: string | null;
  readonly summary: SessionSummary | null;
  readonly sessionId: string;
  readonly returning: boolean;
}

export type SessionEvent =
  | { readonly type: "BEGIN" }
  | { readonly type: "BEGIN_RETURNING"; readonly mode: SessionMode }
  | { readonly type: "DISCLOSURE_ACCEPTED" }
  | { readonly type: "USE_SYNTHETIC" }
  | { readonly type: "USE_SYNTHETIC_FALLBACK" }
  | { readonly type: "CAMERA_READY" }
  | { readonly type: "CAMERA_FAILED"; readonly message: string }
  | { readonly type: "CHOOSE_MODE"; readonly mode: SessionMode }
  | { readonly type: "SAFETY_ACCEPTED" }
  | { readonly type: "CALIBRATED" }
  | { readonly type: "RETURNING_CALIBRATED" }
  | { readonly type: "SWITCH_MODE"; readonly mode: SessionMode }
  | { readonly type: "TUTORIAL_COMPLETE" }
  | { readonly type: "COUNTDOWN_COMPLETE" }
  | { readonly type: "PAUSE" }
  | { readonly type: "RESUME" }
  | { readonly type: "TRACKING_LOST" }
  | { readonly type: "TRACKING_RECOVERED" }
  | { readonly type: "PLAY_COMPLETE" }
  | { readonly type: "COOLDOWN_COMPLETE" }
  | { readonly type: "SESSION_COMMITTED"; readonly summary: SessionSummary }
  | { readonly type: "STOP"; readonly nextSessionId: string }
  | { readonly type: "RESTART"; readonly nextSessionId: string };

export function initialSessionState(sessionId: string): SessionState {
  return {
    phase: "idle",
    source: null,
    mode: null,
    playback: "running",
    permissionError: null,
    summary: null,
    sessionId,
    returning: false,
  };
}

export function reduceSession(
  state: SessionState,
  event: SessionEvent,
): SessionState {
  switch (event.type) {
    case "BEGIN":
      return state.phase === "idle"
        ? { ...state, phase: "disclosure", returning: false }
        : state;
    case "BEGIN_RETURNING":
      return state.phase === "idle"
        ? {
            ...state,
            phase: "permission",
            mode: event.mode,
            returning: true,
          }
        : state;
    case "DISCLOSURE_ACCEPTED":
      return state.phase === "disclosure"
        ? { ...state, phase: "permission" }
        : state;
    case "USE_SYNTHETIC":
      return state.phase === "permission"
        ? {
            ...state,
            phase:
              state.returning && state.mode !== null ? "safety" : "mode",
            source: "synthetic",
            permissionError: null,
          }
        : state;
    case "USE_SYNTHETIC_FALLBACK":
      return state.phase === "calibrating" || state.phase === "tutorial"
        ? {
            ...state,
            source: "synthetic",
            permissionError: null,
          }
        : state;
    case "CAMERA_READY":
      return state.phase === "permission"
        ? {
            ...state,
            phase:
              state.returning && state.mode !== null ? "safety" : "mode",
            source: "camera",
            permissionError: null,
          }
        : state;
    case "CAMERA_FAILED":
      return state.phase === "permission"
        ? { ...state, permissionError: event.message }
        : state;
    case "CHOOSE_MODE":
      return state.phase === "mode"
        ? { ...state, phase: "safety", mode: event.mode }
        : state;
    case "SAFETY_ACCEPTED":
      return state.phase === "safety"
        ? { ...state, phase: "calibrating" }
        : state;
    case "CALIBRATED":
      return state.phase === "calibrating"
        ? { ...state, phase: "tutorial" }
        : state;
    case "RETURNING_CALIBRATED":
      return state.phase === "calibrating" && state.returning
        ? { ...state, phase: "countdown" }
        : state;
    case "SWITCH_MODE":
      return state.phase === "tutorial"
        ? { ...state, phase: "safety", mode: event.mode }
        : state;
    case "TUTORIAL_COMPLETE":
      return state.phase === "tutorial"
        ? { ...state, phase: "countdown" }
        : state;
    case "COUNTDOWN_COMPLETE":
      return state.phase === "countdown"
        ? { ...state, phase: "playing", playback: "running" }
        : state;
    case "PAUSE":
      return state.phase === "playing"
        ? { ...state, playback: "paused" }
        : state;
    case "RESUME":
      return state.phase === "playing"
        ? { ...state, playback: "running" }
        : state;
    case "TRACKING_LOST":
      return state.phase === "playing" && state.playback === "running"
        ? { ...state, playback: "tracking-lost" }
        : state;
    case "TRACKING_RECOVERED":
      return state.phase === "playing" && state.playback === "tracking-lost"
        ? { ...state, playback: "running" }
        : state;
    case "PLAY_COMPLETE":
      return state.phase === "playing"
        ? { ...state, phase: "cooldown", playback: "running" }
        : state;
    case "COOLDOWN_COMPLETE":
      return state.phase === "cooldown"
        ? { ...state, phase: "completing" }
        : state;
    case "SESSION_COMMITTED":
      return state.phase === "completing"
        ? { ...state, phase: "result", summary: event.summary }
        : state;
    case "STOP":
    case "RESTART":
      return initialSessionState(event.nextSessionId);
  }
}
