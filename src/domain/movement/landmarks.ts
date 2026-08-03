export interface NormalizedLandmark {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly visibility: number;
  readonly presence: number;
}

// Manual real-camera tuning entry point. This is model confidence, not a
// measured brightness threshold. Keep provider, classifiers, and debug UI
// aligned when testing a different value on the demo device.
export const TRACKING_CONFIDENCE_THRESHOLD = 0.45;
export const MOVEMENT_CLASSIFIER_VERSION = 2 as const;

export interface PoseFrame {
  readonly kind: "pose";
  readonly timestampMs: number;
  readonly personCount: number;
  readonly landmarks: readonly NormalizedLandmark[];
}

export type Handedness = "left" | "right";

export interface HandLandmarks {
  readonly handedness: Handedness;
  readonly handednessScore: number;
  readonly landmarks: readonly NormalizedLandmark[];
}

export interface HandFrame {
  readonly kind: "hands";
  readonly timestampMs: number;
  readonly personCount: number;
  readonly hands: readonly HandLandmarks[];
}

export type LandmarkFrame = PoseFrame | HandFrame;

export function frameConfidence(frame: LandmarkFrame): number {
  const landmarks =
    frame.kind === "pose"
      ? Object.values(POSE_INDEX)
          .map((index) => frame.landmarks[index])
          .filter(
            (landmark): landmark is NormalizedLandmark =>
              landmark !== undefined,
          )
      : frame.hands.flatMap((hand) => hand.landmarks);
  if (landmarks.length === 0) {
    return 0;
  }
  return (
    landmarks.reduce(
      (total, landmark) =>
        total + Math.min(landmark.visibility, landmark.presence),
      0,
    ) / landmarks.length
  );
}

export type StandingCue =
  | "step-left"
  | "step-right"
  | "step-forward"
  | "step-back";

export type SeatedCue =
  | "left-palm"
  | "right-palm"
  | "both-palms"
  | "index-hold";

export type MovementCue = StandingCue | SeatedCue;

export type MovementObservation =
  | {
      readonly kind: "unscoreable";
      readonly reason:
        | "missing-landmarks"
        | "low-confidence"
        | "multiple-people";
    }
  | {
      readonly kind: "neutral";
    }
  | {
      readonly kind: "movement";
      readonly cue: MovementCue;
      readonly confidence: number;
    };

export const POSE_INDEX = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
} as const;

export const HAND_INDEX = {
  wrist: 0,
  thumbTip: 4,
  indexPip: 6,
  indexTip: 8,
  middlePip: 10,
  middleTip: 12,
  ringPip: 14,
  ringTip: 16,
  pinkyPip: 18,
  pinkyTip: 20,
} as const;
