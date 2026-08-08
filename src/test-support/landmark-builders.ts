import {
  HAND_INDEX,
  POSE_INDEX,
  type HandFrame,
  type HandLandmarks,
  type Handedness,
  type NormalizedLandmark,
  type PoseFrame,
} from "../domain/movement/landmarks";

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

export function poseFrame(
  values: {
    readonly hipCenterX?: number;
    readonly shoulderWidth?: number;
    readonly bodyScale?: number;
    readonly leftAnkleX?: number;
    readonly rightAnkleX?: number;
    readonly leftAnkleY?: number;
    readonly rightAnkleY?: number;
    readonly confidence?: number;
    readonly personCount?: number;
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
    x: values.leftAnkleX ?? hipCenterX - 0.08,
    y: values.leftAnkleY ?? ankleY,
    visibility: confidence,
    presence: confidence,
  });
  landmarks[POSE_INDEX.rightAnkle] = point({
    x: values.rightAnkleX ?? hipCenterX + 0.08,
    y: values.rightAnkleY ?? ankleY,
    visibility: confidence,
    presence: confidence,
  });

  return {
    kind: "pose",
    timestampMs: 0,
    personCount: values.personCount ?? 1,
    landmarks,
  };
}

export function handLandmarks(
  handedness: Handedness,
  gesture: "open" | "index" | "closed",
  confidence = 0.99,
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

export function handFrame(
  hands: readonly HandLandmarks[],
  personCount = hands.length === 0 ? 0 : 1,
): HandFrame {
  return { kind: "hands", timestampMs: 0, personCount, hands };
}
