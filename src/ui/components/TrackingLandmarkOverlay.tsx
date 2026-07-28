import type { Language } from "../../content/copy";
import type { SessionMode } from "../../domain/chart/session-chart";
import {
  POSE_INDEX,
  TRACKING_CONFIDENCE_THRESHOLD,
  type LandmarkFrame,
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
