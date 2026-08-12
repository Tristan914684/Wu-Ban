import type { RefObject } from "react";

import type { InputSource } from "../../application/session/session-machine";
import type { Language } from "../../content/copy";
import type { SessionMode } from "../../domain/chart/session-chart";
import type { MovementObservation } from "../../domain/movement/landmarks";
import type { LivePlayerState } from "./live-player-state";

export type TrackingIssue = Extract<
  MovementObservation,
  { readonly kind: "unscoreable" }
>["reason"];

interface GameplayPlayerStatePanelProps {
  readonly language: Language;
  readonly mode: SessionMode;
  readonly source: InputSource;
  readonly playerState: LivePlayerState;
  readonly trackingIssue: TrackingIssue | null;
  readonly videoRef: RefObject<HTMLVideoElement | null>;
}

function shortTrackingAction(
  language: Language,
  mode: SessionMode,
  issue: TrackingIssue,
): string {
  const isChinese = language === "zh";

  if (issue === "multiple-people") {
    return isChinese ? "只留一位玩家" : "One player only";
  }

  if (mode === "seated" && issue === "missing-landmarks") {
    return isChinese ? "举起双手" : "Show both hands";
  }

  if (issue === "low-confidence") {
    return isChinese ? "面向画面" : "Face the screen";
  }

  return isChinese ? "回到中间" : "Return to centre";
}

export function GameplayPlayerStatePanel({
  language,
  mode,
  source,
  playerState,
  trackingIssue,
  videoRef,
}: GameplayPlayerStatePanelProps) {
  const isChinese = language === "zh";

  return (
    <aside
      aria-label={isChinese ? "您的位置" : "Your position"}
      className="player-state-panel"
      data-player-state={playerState.key}
    >
      {source === "camera" ? (
        <video
          aria-label={
            isChinese ? "动作识别摄像头输入" : "Camera input for movement tracking"
          }
          autoPlay
          className="player-state-panel__camera-input"
          muted
          playsInline
          ref={videoRef}
        />
      ) : null}

      <span className="player-state-panel__you">{isChinese ? "您" : "YOU"}</span>
      <strong aria-hidden="true" className="player-state-panel__symbol">
        {playerState.symbol}
      </strong>
      <span className="player-state-panel__label">{playerState.label}</span>

      {trackingIssue === null ? null : (
        <div className="player-state-panel__issue" role="status">
          <b>{isChinese ? "不计分" : "Not scored"}</b>
          <span>{shortTrackingAction(language, mode, trackingIssue)}</span>
        </div>
      )}
    </aside>
  );
}
