import {
  HAND_INDEX,
  POSE_INDEX,
  type HandFrame,
  type HandLandmarks,
  type Handedness,
  type LandmarkFrame,
  type MovementCue,
  type MovementObservation,
  type NormalizedLandmark,
  type PoseFrame,
} from "./landmarks";
import { classifySeated } from "./seated-classifier";
import {
  calibrateStanding,
  classifyStanding,
} from "./standing-classifier";

type SyntheticMode = "standing" | "seated";
export type SyntheticTrackingScenario = "standard" | "tracking-loss";

export const SYNTHETIC_TRACKING_LOSS_WINDOW_MS = {
  start: 1_200,
  end: 5_000,
} as const;

function point(
  values: Partial<NormalizedLandmark> = {},
): NormalizedLandmark {
  return {
    x: values.x ?? 0.5,
    y: values.y ?? 0.5,
    z: values.z ?? 0,
    visibility: values.visibility ?? 0.99,
    presence: values.presence ?? 0.99,
  };
}

function poseTrace(
  timestampMs: number,
  values: {
    readonly hipCenterX?: number;
    readonly shoulderWidth?: number;
    readonly bodyScale?: number;
    readonly confidence?: number;
  } = {},
): PoseFrame {
  const landmarks = Array.from({ length: 33 }, () => point());
  const hipCenterX = values.hipCenterX ?? 0.5;
  const shoulderWidth = values.shoulderWidth ?? 0.22;
  const bodyScale = values.bodyScale ?? 0.52;
  const confidence = values.confidence ?? 0.99;
  const shoulderY = 0.24;
  const hipY = 0.52;
  const ankleY = shoulderY + bodyScale;

  landmarks[POSE_INDEX.leftShoulder] = point({
    x: 0.5 - shoulderWidth / 2,
    y: shoulderY,
    visibility: confidence,
    presence: confidence,
  });
  landmarks[POSE_INDEX.rightShoulder] = point({
    x: 0.5 + shoulderWidth / 2,
    y: shoulderY,
    visibility: confidence,
    presence: confidence,
  });
  landmarks[POSE_INDEX.leftHip] = point({
    x: hipCenterX - 0.07,
    y: hipY,
    visibility: confidence,
    presence: confidence,
  });
  landmarks[POSE_INDEX.rightHip] = point({
    x: hipCenterX + 0.07,
    y: hipY,
    visibility: confidence,
    presence: confidence,
  });
  landmarks[POSE_INDEX.leftAnkle] = point({
    x: hipCenterX - 0.08,
    y: ankleY,
    visibility: confidence,
    presence: confidence,
  });
  landmarks[POSE_INDEX.rightAnkle] = point({
    x: hipCenterX + 0.08,
    y: ankleY,
    visibility: confidence,
    presence: confidence,
  });

  return {
    kind: "pose",
    timestampMs,
    personCount: 1,
    landmarks,
  };
}

function handTrace(
  handedness: Handedness,
  gesture: "open" | "index" | "closed",
  confidence: number,
): HandLandmarks {
  const landmarks = Array.from({ length: 21 }, () =>
    point({ visibility: confidence, presence: confidence }),
  );
  const setFinger = (tipIndex: number, pipIndex: number, extended: boolean) => {
    landmarks[pipIndex] = point({
      y: 0.5,
      visibility: confidence,
      presence: confidence,
    });
    landmarks[tipIndex] = point({
      y: extended ? 0.38 : 0.56,
      visibility: confidence,
      presence: confidence,
    });
  };
  const indexExtended = gesture === "open" || gesture === "index";
  const otherExtended = gesture === "open";

  setFinger(HAND_INDEX.indexTip, HAND_INDEX.indexPip, indexExtended);
  setFinger(HAND_INDEX.middleTip, HAND_INDEX.middlePip, otherExtended);
  setFinger(HAND_INDEX.ringTip, HAND_INDEX.ringPip, otherExtended);
  setFinger(HAND_INDEX.pinkyTip, HAND_INDEX.pinkyPip, otherExtended);

  return { handedness, handednessScore: confidence, landmarks };
}

function standingFrameFor(
  cue: MovementCue | null,
  timestampMs: number,
  confidence: number,
): PoseFrame {
  switch (cue) {
    case "step-left":
      return poseTrace(timestampMs, { hipCenterX: 0.32, confidence });
    case "step-right":
      return poseTrace(timestampMs, { hipCenterX: 0.68, confidence });
    case "step-forward":
      return poseTrace(timestampMs, {
        bodyScale: 0.61,
        shoulderWidth: 0.26,
        confidence,
      });
    case "step-back":
      return poseTrace(timestampMs, {
        bodyScale: 0.43,
        shoulderWidth: 0.18,
        confidence,
      });
    default:
      return poseTrace(timestampMs, { confidence });
  }
}

function seatedFrameFor(
  cue: MovementCue | null,
  timestampMs: number,
  confidence: number,
): HandFrame {
  let hands: readonly HandLandmarks[];
  switch (cue) {
    case "left-palm":
      hands = [handTrace("left", "open", confidence)];
      break;
    case "right-palm":
      hands = [handTrace("right", "open", confidence)];
      break;
    case "both-palms":
      hands = [
        handTrace("left", "open", confidence),
        handTrace("right", "open", confidence),
      ];
      break;
    case "index-hold":
      hands = [handTrace("right", "index", confidence)];
      break;
    default:
      hands = [handTrace("right", "closed", confidence)];
  }
  return {
    kind: "hands",
    timestampMs,
    personCount: 1,
    hands,
  };
}

export function syntheticLandmarkFrame(
  mode: SyntheticMode,
  expected: MovementCue | null,
  index: number,
  timestampMs: number,
): LandmarkFrame {
  const lowConfidence = index % 11 === 7;
  const authoredMiss = index % 8 === 6;
  const cue = authoredMiss ? null : expected;
  const confidence = lowConfidence ? 0.2 : 0.99;
  return mode === "standing"
    ? standingFrameFor(cue, timestampMs, confidence)
    : seatedFrameFor(cue, timestampMs, confidence);
}

export function replaySyntheticObservation(
  mode: SyntheticMode,
  expected: MovementCue | null,
  index: number,
  timestampMs: number,
): MovementObservation {
  const frame = syntheticLandmarkFrame(mode, expected, index, timestampMs);
  if (frame.kind === "hands") {
    return classifySeated(frame);
  }
  const calibration = calibrateStanding(poseTrace(0));
  if (calibration === undefined) {
    return { kind: "unscoreable", reason: "missing-landmarks" };
  }
  return classifyStanding(frame, calibration);
}

export function replaySyntheticTrackingObservation(
  mode: SyntheticMode,
  scenario: SyntheticTrackingScenario,
  elapsedMs: number,
): MovementObservation {
  const trackingLost =
    scenario === "tracking-loss" &&
    elapsedMs >= SYNTHETIC_TRACKING_LOSS_WINDOW_MS.start &&
    elapsedMs < SYNTHETIC_TRACKING_LOSS_WINDOW_MS.end;
  return replaySyntheticObservation(
    mode,
    null,
    trackingLost ? 7 : 0,
    elapsedMs,
  );
}
