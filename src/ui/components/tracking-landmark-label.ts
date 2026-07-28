import type { Language } from "../../content/copy";
import type { SessionMode } from "../../domain/chart/session-chart";
import {
  POSE_INDEX,
  TRACKING_CONFIDENCE_THRESHOLD,
  type LandmarkFrame,
  type NormalizedLandmark,
} from "../../domain/movement/landmarks";

function visible(point: NormalizedLandmark | undefined): boolean {
  return (
    point !== undefined &&
    point.visibility >= TRACKING_CONFIDENCE_THRESHOLD &&
    point.presence >= TRACKING_CONFIDENCE_THRESHOLD
  );
}

export function trackingPartsLabel(
  frame: LandmarkFrame | null,
  language: Language,
  mode: SessionMode,
): string {
  const isChinese = language === "zh";
  if (frame === null) {
    return isChinese ? "等待识别…" : "Waiting for landmarks…";
  }
  if (mode === "seated" && frame.kind === "hands") {
    const visibleHands = frame.hands.filter((hand) =>
      hand.landmarks.some(visible),
    ).length;
    return isChinese
      ? `已识别双手：${visibleHands} / 2`
      : `Hands detected: ${visibleHands} / 2`;
  }
  if (frame.kind !== "pose") {
    return isChinese ? "等待身体识别…" : "Waiting for body landmarks…";
  }

  const detected = (left: number, right: number) =>
    visible(frame.landmarks[left]) && visible(frame.landmarks[right]);
  const shoulderReady = detected(
    POSE_INDEX.leftShoulder,
    POSE_INDEX.rightShoulder,
  );
  const hipReady = detected(POSE_INDEX.leftHip, POSE_INDEX.rightHip);
  const ankleReady = detected(POSE_INDEX.leftAnkle, POSE_INDEX.rightAnkle);
  const mark = (ready: boolean) => (ready ? "✓" : "—");

  return isChinese
    ? `肩部 ${mark(shoulderReady)} · 髋部 ${mark(hipReady)} · 脚踝 ${mark(ankleReady)}`
    : `Shoulders ${mark(shoulderReady)} · Hips ${mark(hipReady)} · Ankles ${mark(ankleReady)}`;
}
