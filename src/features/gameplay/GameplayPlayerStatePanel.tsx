import type { RefObject } from "react";

import type { InputSource } from "../../application/session/session-machine";
import type { Language } from "../../content/copy";
import type { SessionMode } from "../../domain/chart/session-chart";
import type { CueSupportLevel } from "../../domain/gameplay/adaptive-support";
import type { MovementObservation } from "../../domain/movement/landmarks";
import { Button } from "../../ui/primitives/Button";
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
  readonly cueSupport: CueSupportLevel;
  readonly videoRef: RefObject<HTMLVideoElement | null>;
  readonly onMakeGentler: () => void;
}

const SUPPORT_LABELS = [
  ["标准提示", "Standard cues"],
  ["更多准备时间", "More time to prepare"],
  ["最温和提示", "Gentlest cues"],
] as const;

function framingCopy(
  language: Language,
  mode: SessionMode,
  issue: TrackingIssue | null,
): { readonly label: string; readonly helper: string } {
  const isChinese = language === "zh";
  if (issue === "multiple-people") {
    return {
      label: isChinese ? "画面里有多人" : "More than one person",
      helper: isChinese
        ? "请只让一位玩家站在起始轮廓内"
        : "Keep one player inside the start outline",
    };
  }
  if (issue === "low-confidence") {
    return {
      label: isChinese ? "暂时看不清位置" : "Position unclear",
      helper: isChinese
        ? "面向画面并增加正面光线"
        : "Face the screen and add light in front of you",
    };
  }
  if (issue === "missing-landmarks") {
    return {
      label:
        mode === "seated"
          ? isChinese
            ? "请举起双手"
            : "Show both hands"
          : isChinese
            ? "请回到画面内"
            : "Step into view",
      helper:
        mode === "seated"
          ? isChinese
            ? "让手腕和手指都清楚可见"
            : "Keep your wrists and fingers visible"
          : isChinese
            ? "把全身放在起始轮廓内"
            : "Keep your whole body inside the start outline",
    };
  }
  return {
    label:
      mode === "seated"
        ? isChinese
          ? "双手清楚可见"
          : "Hands visible"
        : isChinese
          ? "已在画面内"
          : "In frame",
    helper:
      mode === "seated"
        ? isChinese
          ? "系统只看动作，不保存画面"
          : "Movement is read here; video is not saved"
        : isChinese
          ? "全身清楚可见"
          : "Your whole body is visible",
  };
}

export function GameplayPlayerStatePanel({
  language,
  mode,
  source,
  playerState,
  trackingIssue,
  cueSupport,
  videoRef,
  onMakeGentler,
}: GameplayPlayerStatePanelProps) {
  const isChinese = language === "zh";
  const framing = framingCopy(language, mode, trackingIssue);
  const supportLabel = SUPPORT_LABELS[cueSupport][isChinese ? 0 : 1];

  return (
    <aside
      aria-label={isChinese ? "您的位置与动作识别" : "Your position and tracking"}
      className="player-state-panel"
      data-player-state={playerState.key}
    >
      <div className="player-state-panel__heading">
        <span>{isChinese ? "您" : "YOU"}</span>
        <strong>{isChinese ? "位置与准备状态" : "POSITION & READINESS"}</strong>
      </div>

      <div className="player-state-panel__preview">
        {source === "camera" ? (
          <video
            aria-label={isChinese ? "当前摄像头画面" : "Current camera view"}
            autoPlay
            data-camera-preview
            muted
            playsInline
            ref={videoRef}
          />
        ) : (
          <div
            aria-label={isChinese ? "模拟练习人物" : "Practice figure"}
            className="player-state-panel__practice-figure"
            role="img"
          >
            <span aria-hidden="true" className="practice-figure__head" />
            <span aria-hidden="true" className="practice-figure__body" />
            <span aria-hidden="true" className="practice-figure__start" />
            <strong>{isChinese ? "模拟练习人物" : "Practice figure"}</strong>
          </div>
        )}
        <span className="player-state-panel__privacy">
          {isChinese ? "画面不保存" : "VIDEO NOT SAVED"}
        </span>
      </div>

      <div className="player-state-panel__framing" data-clear={trackingIssue === null}>
        <span aria-hidden="true" className="state-checkmark">
          {trackingIssue === null ? "✓" : "!"}
        </span>
        <div>
          <strong>{framing.label}</strong>
          <span>{framing.helper}</span>
        </div>
        {trackingIssue === null ? null : (
          <b>{isChinese ? "不计分" : "Not scored"}</b>
        )}
      </div>

      <div
        aria-atomic="true"
        aria-live="polite"
        className="player-state-panel__movement"
      >
        {mode === "standing" ? (
          <div
            aria-label={isChinese ? "您的移动位置" : "Your movement position"}
            className="player-state-panel__compass"
            role="group"
          >
            {[
              ["step-forward", "↑", isChinese ? "前" : "Forward"],
              ["step-left", "←", isChinese ? "左" : "Left"],
              ["center", "●", isChinese ? "起点" : "Start"],
              ["step-right", "→", isChinese ? "右" : "Right"],
              ["step-back", "↓", isChinese ? "后" : "Back"],
            ].map(([position, symbol, label]) => (
              <span
                aria-label={label}
                data-active={playerState.key === position}
                data-position={position}
                data-testid="compass-position"
                key={position}
              >
                {symbol}
              </span>
            ))}
          </div>
        ) : (
          <span aria-hidden="true" className="player-state-panel__gesture-symbol">
            {playerState.symbol}
          </span>
        )}
        <div className="player-state-panel__state-copy">
          <strong>{playerState.label}</strong>
          <span>{playerState.helper}</span>
        </div>
      </div>

      <div className="player-state-panel__support">
        <span>
          {isChinese ? "提示速度" : "CUE SUPPORT"}: <strong>{supportLabel}</strong>
        </span>
        <Button
          disabled={cueSupport === 2}
          onClick={onMakeGentler}
          variant="quiet"
        >
          {cueSupport === 2
            ? isChinese
              ? "已是最温和"
              : "Gentlest cues on"
            : isChinese
              ? "让提示更温和"
              : "Make cues gentler"}
        </Button>
      </div>
    </aside>
  );
}
