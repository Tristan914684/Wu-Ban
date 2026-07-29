import type { Language } from "../../content/copy";
import type { SessionMode } from "../../domain/chart/session-chart";
import type { MovementObservation } from "../../domain/movement/landmarks";

export function practiceHomeStatusLabel(
  language: Language,
  mode: SessionMode,
  observation: MovementObservation | null,
): string {
  const isChinese = language === "zh";

  if (observation === null) {
    if (mode === "standing") {
      return isChinese ? "双脚站在中央脚印上" : "Place both feet on the centre marks";
    }
    return isChinese
      ? "双手放在肩膀旁，准备开始"
      : "Keep both hands beside your shoulders";
  }

  if (observation.kind === "movement") {
    if (mode === "standing") {
      return isChinese
        ? "这一步已计数——双脚回到中央脚印"
        : "Step counted — place both feet back on the centre marks";
    }
    return isChinese
      ? "手势已计数——双手放回肩膀旁"
      : "Gesture counted — lower both hands beside your shoulders";
  }

  if (observation.kind === "neutral") {
    return mode === "standing"
      ? isChinese
        ? "已回到脚印——再做一次同样的动作"
        : "Back on the marks — repeat the same step"
      : isChinese
        ? "双手已复位——再做一次同样的手势"
        : "Hands reset — repeat the same gesture";
  }

  return mode === "standing"
    ? isChinese
      ? "请把全身移入轮廓内"
      : "Move your whole body inside the outline"
    : isChinese
      ? "请把双手放入两个手掌轮廓内"
      : "Place both hands inside the hand outlines";
}
