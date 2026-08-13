import type { Language } from "../../content/copy";
import type { SessionMode } from "../../domain/chart/session-chart";
import type {
  MovementCue,
  MovementObservation,
} from "../../domain/movement/landmarks";

export type LivePlayerStateKey = MovementCue | "center" | "unclear";

export interface LivePlayerState {
  readonly key: LivePlayerStateKey;
  readonly label: string;
  readonly helper: string;
  readonly symbol: string;
}

const MOVEMENT_LABELS: Record<
  MovementCue,
  readonly [string, string, string, string, string]
> = {
  "step-left": [
    "中央左侧",
    "Left of centre",
    "向右迈一步，回到中央 →",
    "Step RIGHT → to return",
    "←",
  ],
  "step-right": [
    "中央右侧",
    "Right of centre",
    "向左迈一步，回到中央 ←",
    "Step LEFT ← to return",
    "→",
  ],
  "step-forward": [
    "中央前方",
    "In front of centre",
    "向后退一步，回到中央 ↓",
    "Step BACK ↓ to return",
    "↑",
  ],
  "step-back": [
    "中央后方",
    "Behind centre",
    "向前迈一步，回到中央 ↑",
    "Step FORWARD ↑ to return",
    "↓",
  ],
  "left-palm": [
    "检测到左手掌",
    "Left palm detected",
    "手势已看到；双手复位准备下一个",
    "Gesture seen; reset your hands for the next move",
    "左",
  ],
  "right-palm": [
    "检测到右手掌",
    "Right palm detected",
    "手势已看到；双手复位准备下一个",
    "Gesture seen; reset your hands for the next move",
    "右",
  ],
  "both-palms": [
    "检测到双手掌",
    "Both palms detected",
    "手势已看到；双手复位准备下一个",
    "Gesture seen; reset your hands for the next move",
    "双",
  ],
  "index-hold": [
    "检测到食指",
    "Index finger detected",
    "手势已看到；双手复位准备下一个",
    "Gesture seen; reset your hands for the next move",
    "指",
  ],
};

export function livePlayerState(
  language: Language,
  mode: SessionMode,
  observation: MovementObservation,
): LivePlayerState {
  const isChinese = language === "zh";

  if (observation.kind === "unscoreable") {
    return {
      key: "unclear",
      label: isChinese ? "暂时看不清位置" : "Position unclear",
      helper: isChinese
        ? "慢慢回到中央轮廓；看清后再继续"
        : "Return to the centre outline; continue when clear",
      symbol: "?",
    };
  }

  if (observation.kind === "neutral") {
    return {
      key: "center",
      label:
        mode === "standing"
          ? isChinese
            ? "已在中央"
            : "You are centred"
          : isChinese
            ? "双手已复位，准备好了"
            : "Hands reset and ready",
      helper:
        mode === "standing"
          ? isChinese
            ? "位置正确；等动作到达亮线再移动"
            : "Position ready; move when a cue reaches the line"
          : isChinese
            ? "做出下一个手势即可"
            : "Make the next hand gesture",
      symbol: "●",
    };
  }

  const [chineseLabel, englishLabel, chineseHelper, englishHelper, symbol] =
    MOVEMENT_LABELS[observation.cue];
  return {
    key: observation.cue,
    label: isChinese ? chineseLabel : englishLabel,
    helper: isChinese ? chineseHelper : englishHelper,
    symbol,
  };
}
