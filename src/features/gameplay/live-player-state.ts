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
  readonly [string, string, string]
> = {
  "step-left": ["正在向左", "Moving left", "←"],
  "step-right": ["正在向右", "Moving right", "→"],
  "step-forward": ["正在向前", "Moving forward", "↑"],
  "step-back": ["正在退回", "Moving back", "↓"],
  "left-palm": ["检测到左手掌", "Left palm detected", "左"],
  "right-palm": ["检测到右手掌", "Right palm detected", "右"],
  "both-palms": ["检测到双手掌", "Both palms detected", "双"],
  "index-hold": ["检测到食指", "Index finger detected", "指"],
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
        ? "回到画面中央；看清后再计分"
        : "Return to the middle; scoring resumes when clear",
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
            : "Centered"
          : isChinese
            ? "双手已复位，准备好了"
            : "Hands reset and ready",
      helper:
        mode === "standing"
          ? isChinese
            ? "准备好了；轻轻迈出一步就会计数"
            : "Ready; one gentle step is enough to count"
          : isChinese
            ? "做出下一个手势即可"
            : "Make the next hand gesture",
      symbol: "●",
    };
  }

  const [chineseLabel, englishLabel, symbol] =
    MOVEMENT_LABELS[observation.cue];
  return {
    key: observation.cue,
    label: isChinese ? chineseLabel : englishLabel,
    helper:
      mode === "standing"
        ? isChinese
          ? "这一步已看到；回到中央准备下一步"
          : "Step seen; return to centre for the next move"
        : isChinese
          ? "手势已看到；双手复位准备下一个"
          : "Gesture seen; reset your hands for the next move",
    symbol,
  };
}
