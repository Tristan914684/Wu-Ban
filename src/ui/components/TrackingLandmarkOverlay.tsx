import type { Language } from "../../content/copy";
import type { SessionMode } from "../../domain/chart/session-chart";
import {
  POSE_INDEX,
  TRACKING_CONFIDENCE_THRESHOLD,
  type LandmarkFrame,
  type MovementObservation,
  type NormalizedLandmark,
} from "../../domain/movement/landmarks";
import { trackingPartsLabel } from "./tracking-landmark-label";

const POSE_CONNECTIONS = [
  ["leftShoulder", "rightShoulder"],
  ["leftShoulder", "leftHip"],
  ["rightShoulder", "rightHip"],
  ["leftHip", "rightHip"],
  ["leftHip", "leftKnee"],
  ["rightHip", "rightKnee"],
  ["leftKnee", "leftAnkle"],
  ["rightKnee", "rightAnkle"],
] as const;

const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
] as const;

function visible(
  point: NormalizedLandmark | undefined,
): point is NormalizedLandmark {
  return (
    point !== undefined &&
    point.visibility >= TRACKING_CONFIDENCE_THRESHOLD &&
    point.presence >= TRACKING_CONFIDENCE_THRESHOLD
  );
}

function percent(value: number): number {
  return Math.min(100, Math.max(0, value * 100));
}

interface TrackingLandmarkOverlayProps {
  readonly frame: LandmarkFrame | null;
  readonly language: Language;
  readonly mode: SessionMode;
}

interface PerceptionStatusProps extends TrackingLandmarkOverlayProps {
  readonly observation: MovementObservation | null;
}

function refusalCopy(
  reason: Extract<MovementObservation, { readonly kind: "unscoreable" }>["reason"],
  language: Language,
): string {
  const isChinese = language === "zh";
  switch (reason) {
    case "low-confidence":
      return isChinese
        ? `此画面未使用——可信度低于 ${Math.round(TRACKING_CONFIDENCE_THRESHOLD * 100)}% 的门槛。`
        : `Frame not used — confidence is below the ${Math.round(TRACKING_CONFIDENCE_THRESHOLD * 100)}% gate.`;
    case "missing-landmarks":
      return isChinese
        ? "此画面未使用——所需的身体或手部位置不完整。"
        : "Frame not used — required body or hand landmarks are missing.";
    case "multiple-people":
      return isChinese
        ? "此画面未使用——画面中出现了多位玩家。"
        : "Frame not used — more than one player is visible.";
  }
}

function poseGateConfidence(frame: LandmarkFrame): number {
  if (frame.kind !== "pose") {
    return 0;
  }
  const required = Object.values(POSE_INDEX).map(
    (index) => frame.landmarks[index],
  );
  if (required.some((landmark) => landmark === undefined)) {
    return 0;
  }
  return Math.min(
    ...required.map((landmark) =>
      Math.min(landmark!.visibility, landmark!.presence),
    ),
  );
}

export function PerceptionStatus({
  frame,
  language,
  mode,
  observation,
}: PerceptionStatusProps) {
  const isChinese = language === "zh";
  const refused = observation?.kind === "unscoreable";
  const modelLabel =
    mode === "standing"
      ? isChinese
        ? "本机姿态 AI"
        : "ON-DEVICE POSE AI"
      : isChinese
        ? "本机手势 AI"
        : "ON-DEVICE HAND AI";
  const confidenceLabel =
    frame === null
      ? isChinese
        ? "正在等待画面"
        : "Waiting for a frame"
      : frame.kind === "pose"
        ? isChinese
          ? `所需关键点可信度 ${Math.round(poseGateConfidence(frame) * 100)}%`
          : `Required-landmark confidence ${Math.round(poseGateConfidence(frame) * 100)}%`
        : frame.hands.length === 0
          ? isChinese
            ? "尚未识别到手部"
            : "Hands not detected"
          : isChinese
            ? "模型质量门槛已通过"
            : "Model quality gate passed";
  const decision =
    observation === null
      ? isChinese
        ? "模型正在检查所需位置。"
        : "The model is checking the required landmarks."
      : refused
        ? refusalCopy(observation.reason, language)
        : isChinese
          ? "画面已采用——动作规则可以使用这些位置。"
          : "Frame accepted — movement rules may use it.";

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="perception-status"
      data-decision={refused ? "refused" : "accepted"}
    >
      <span>{modelLabel}</span>
      <strong>{confidenceLabel}</strong>
      <small>{decision}</small>
    </div>
  );
}

export function FramingTargetOverlay({
  language,
  mode,
}: {
  readonly language: Language;
  readonly mode: SessionMode;
}) {
  if (mode === "standing") {
    return <span className="camera-stage__outline" aria-hidden="true" />;
  }

  return (
    <div className="camera-stage__hand-targets" aria-hidden="true">
      <span>{language === "zh" ? "左手" : "LEFT HAND"}</span>
      <span>{language === "zh" ? "右手" : "RIGHT HAND"}</span>
    </div>
  );
}

export function TrackingLandmarkOverlay({
  frame,
  language,
  mode,
}: TrackingLandmarkOverlayProps) {
  if (frame === null) {
    return null;
  }

  return (
    <svg
      aria-hidden="true"
      className="landmark-debug-overlay"
      data-mode={mode}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {frame.kind === "pose" ? (
        <>
          {POSE_CONNECTIONS.map(([fromName, toName]) => {
            const from = frame.landmarks[POSE_INDEX[fromName]];
            const to = frame.landmarks[POSE_INDEX[toName]];
            return visible(from) && visible(to) ? (
              <line
                key={`${fromName}-${toName}`}
                x1={percent(from.x)}
                x2={percent(to.x)}
                y1={percent(from.y)}
                y2={percent(to.y)}
              />
            ) : null;
          })}
          {Object.entries(POSE_INDEX).map(([name, index]) => {
            const point = frame.landmarks[index];
            return visible(point) ? (
              <circle
                cx={percent(point.x)}
                cy={percent(point.y)}
                data-landmark={name}
                key={name}
                r="1.15"
              />
            ) : null;
          })}
        </>
      ) : (
        frame.hands.map((hand, handIndex) => (
          <g data-hand={hand.handedness} key={`${hand.handedness}-${handIndex}`}>
            {HAND_CONNECTIONS.map(([fromIndex, toIndex]) => {
              const from = hand.landmarks[fromIndex];
              const to = hand.landmarks[toIndex];
              return visible(from) && visible(to) ? (
                <line
                  key={`${fromIndex}-${toIndex}`}
                  x1={percent(from.x)}
                  x2={percent(to.x)}
                  y1={percent(from.y)}
                  y2={percent(to.y)}
                />
              ) : null;
            })}
            {hand.landmarks.map((point, pointIndex) =>
              visible(point) ? (
                <circle
                  cx={percent(point.x)}
                  cy={percent(point.y)}
                  data-landmark={`${hand.handedness}-${pointIndex}`}
                  key={pointIndex}
                  r={pointIndex === 0 ? "1.35" : "0.75"}
                />
              ) : null,
            )}
          </g>
        ))
      )}
      <title>
        {trackingPartsLabel(frame, language, mode)}
      </title>
    </svg>
  );
}
