import {
  POSE_INDEX,
  TRACKING_CONFIDENCE_THRESHOLD,
  type MovementObservation,
  type NormalizedLandmark,
  type PoseFrame,
} from "./landmarks";

// These are intentionally forgiving entertainment thresholds. An ankle moving
// roughly three percent of the camera frame from its calibrated position is a
// step; the player does not need to shift their whole torso to prove it.
const FOOT_SIDE_THRESHOLD = 0.06;
const HIP_SIDE_THRESHOLD = 0.12;
const DEPTH_THRESHOLD = 0.07;

export interface StandingCalibration {
  readonly hipCenterX: number;
  readonly hipCenterY: number;
  readonly shoulderWidth: number;
  readonly bodyScale: number;
  readonly leftAnkleX: number | null;
  readonly rightAnkleX: number | null;
}

type RequiredPosePoint = keyof typeof POSE_INDEX;

function getPoint(
  landmarks: readonly NormalizedLandmark[],
  point: RequiredPosePoint,
): NormalizedLandmark | undefined {
  return landmarks[POSE_INDEX[point]];
}

function isScoreable(
  point: NormalizedLandmark | undefined,
  minConfidence = TRACKING_CONFIDENCE_THRESHOLD,
): point is NormalizedLandmark {
  return (
    point !== undefined &&
    point.visibility >= minConfidence &&
    point.presence >= minConfidence
  );
}

function distance(
  left: NormalizedLandmark,
  right: NormalizedLandmark,
): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function poseGeometry(
  landmarks: readonly NormalizedLandmark[],
):
  | {
      readonly hipCenterX: number;
      readonly hipCenterY: number;
      readonly shoulderWidth: number;
      readonly bodyScale: number;
      readonly leftAnkleX: number | null;
      readonly rightAnkleX: number | null;
    }
  | undefined {
  const leftShoulder = getPoint(landmarks, "leftShoulder");
  const rightShoulder = getPoint(landmarks, "rightShoulder");
  const leftHip = getPoint(landmarks, "leftHip");
  const rightHip = getPoint(landmarks, "rightHip");
  const leftAnkle = getPoint(landmarks, "leftAnkle");
  const rightAnkle = getPoint(landmarks, "rightAnkle");

  if (
    !isScoreable(leftShoulder) ||
    !isScoreable(rightShoulder) ||
    !isScoreable(leftHip) ||
    !isScoreable(rightHip)
  ) {
    return undefined;
  }

  const hipCenterX = (leftHip.x + rightHip.x) / 2;
  const hipCenterY = (leftHip.y + rightHip.y) / 2;
  const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;

  let bodyScale: number;
  if (isScoreable(leftAnkle) && isScoreable(rightAnkle)) {
    const ankleCenterY = (leftAnkle.y + rightAnkle.y) / 2;
    bodyScale = Math.max(ankleCenterY - shoulderCenterY, 0.01);
  } else {
    bodyScale = Math.max((hipCenterY - shoulderCenterY) * 2.2, 0.01);
  }

  return {
    hipCenterX,
    hipCenterY,
    shoulderWidth: distance(leftShoulder, rightShoulder),
    bodyScale,
    leftAnkleX: isScoreable(leftAnkle) ? leftAnkle.x : null,
    rightAnkleX: isScoreable(rightAnkle) ? rightAnkle.x : null,
  };
}

export function calibrateStanding(
  frame: PoseFrame,
): StandingCalibration | undefined {
  if (frame.personCount !== 1) {
    return undefined;
  }
  return poseGeometry(frame.landmarks);
}

export function averageStandingCalibrations(
  samples: readonly StandingCalibration[],
): StandingCalibration | undefined {
  if (samples.length === 0) {
    return undefined;
  }
  const average = (values: readonly number[]) =>
    values.reduce((total, value) => total + value, 0) / values.length;
  const leftAnkles = samples.flatMap((sample) =>
    sample.leftAnkleX === null ? [] : [sample.leftAnkleX],
  );
  const rightAnkles = samples.flatMap((sample) =>
    sample.rightAnkleX === null ? [] : [sample.rightAnkleX],
  );

  return {
    hipCenterX: average(samples.map((sample) => sample.hipCenterX)),
    hipCenterY: average(samples.map((sample) => sample.hipCenterY)),
    shoulderWidth: average(samples.map((sample) => sample.shoulderWidth)),
    bodyScale: average(samples.map((sample) => sample.bodyScale)),
    leftAnkleX: leftAnkles.length === 0 ? null : average(leftAnkles),
    rightAnkleX: rightAnkles.length === 0 ? null : average(rightAnkles),
  };
}

export function classifyStanding(
  frame: PoseFrame,
  calibration: StandingCalibration,
): MovementObservation {
  if (frame.personCount > 1) {
    return { kind: "unscoreable", reason: "multiple-people" };
  }
  const geometry = poseGeometry(frame.landmarks);
  if (geometry === undefined) {
    return {
      kind: "unscoreable",
      reason:
        frame.landmarks.length < 29
          ? "missing-landmarks"
          : "low-confidence",
    };
  }

  const hipLateralChange =
    (geometry.hipCenterX - calibration.hipCenterX) / calibration.bodyScale;
  const leftFootChange =
    geometry.leftAnkleX === null || calibration.leftAnkleX === null
      ? 0
      : (geometry.leftAnkleX - calibration.leftAnkleX) /
        calibration.bodyScale;
  const rightFootChange =
    geometry.rightAnkleX === null || calibration.rightAnkleX === null
      ? 0
      : (geometry.rightAnkleX - calibration.rightAnkleX) /
        calibration.bodyScale;
  const leftStrength = Math.max(
    Math.max(0, -leftFootChange) / FOOT_SIDE_THRESHOLD,
    Math.max(0, -hipLateralChange) / HIP_SIDE_THRESHOLD,
  );
  const rightStrength = Math.max(
    Math.max(0, rightFootChange) / FOOT_SIDE_THRESHOLD,
    Math.max(0, hipLateralChange) / HIP_SIDE_THRESHOLD,
  );

  if (leftStrength >= 1 && leftStrength > rightStrength) {
    return {
      kind: "movement",
      cue: "step-left",
      confidence: Math.min(1, leftStrength / 2),
    };
  }
  if (rightStrength >= 1) {
    return {
      kind: "movement",
      cue: "step-right",
      confidence: Math.min(1, rightStrength / 2),
    };
  }

  const scaleChange = geometry.bodyScale / calibration.bodyScale - 1;
  const shoulderChange =
    geometry.shoulderWidth / calibration.shoulderWidth - 1;
  const combinedDepthChange = scaleChange * 0.7 + shoulderChange * 0.3;
  if (combinedDepthChange >= DEPTH_THRESHOLD) {
    return {
      kind: "movement",
      cue: "step-forward",
      confidence: Math.min(1, combinedDepthChange / (DEPTH_THRESHOLD * 2)),
    };
  }
  if (combinedDepthChange <= -DEPTH_THRESHOLD) {
    return {
      kind: "movement",
      cue: "step-back",
      confidence: Math.min(
        1,
        Math.abs(combinedDepthChange) / (DEPTH_THRESHOLD * 2),
      ),
    };
  }

  return { kind: "neutral" };
}
