import {
  HAND_INDEX,
  TRACKING_CONFIDENCE_THRESHOLD,
  type HandFrame,
  type HandLandmarks,
  type MovementObservation,
} from "./landmarks";

const FINGER_EXTENSION = 0.025;

function isFingerExtended(
  hand: HandLandmarks,
  tipIndex: number,
  pipIndex: number,
): boolean {
  const tip = hand.landmarks[tipIndex];
  const pip = hand.landmarks[pipIndex];
  return tip !== undefined && pip !== undefined && pip.y - tip.y > FINGER_EXTENSION;
}

function fingerState(hand: HandLandmarks) {
  return {
    index: isFingerExtended(
      hand,
      HAND_INDEX.indexTip,
      HAND_INDEX.indexPip,
    ),
    middle: isFingerExtended(
      hand,
      HAND_INDEX.middleTip,
      HAND_INDEX.middlePip,
    ),
    ring: isFingerExtended(hand, HAND_INDEX.ringTip, HAND_INDEX.ringPip),
    pinky: isFingerExtended(hand, HAND_INDEX.pinkyTip, HAND_INDEX.pinkyPip),
  };
}

function isHandScoreable(hand: HandLandmarks): boolean {
  return (
    hand.handednessScore >= TRACKING_CONFIDENCE_THRESHOLD &&
    hand.landmarks.length >= 21 &&
    hand.landmarks.every(
      (landmark) =>
        landmark.presence >= TRACKING_CONFIDENCE_THRESHOLD &&
        landmark.visibility >= TRACKING_CONFIDENCE_THRESHOLD,
    )
  );
}

function isOpenPalm(hand: HandLandmarks): boolean {
  const fingers = fingerState(hand);
  return fingers.index && fingers.middle && fingers.ring && fingers.pinky;
}

function isIndexHold(hand: HandLandmarks): boolean {
  const fingers = fingerState(hand);
  return fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky;
}

export function classifySeated(frame: HandFrame): MovementObservation {
  if (frame.personCount > 1) {
    return { kind: "unscoreable", reason: "multiple-people" };
  }
  if (frame.hands.length === 0) {
    return { kind: "unscoreable", reason: "missing-landmarks" };
  }

  const scoreableHands = frame.hands.filter(isHandScoreable);
  if (scoreableHands.length === 0) {
    return { kind: "unscoreable", reason: "low-confidence" };
  }

  const openHands = scoreableHands.filter(isOpenPalm);
  if (openHands.length >= 2) {
    return { kind: "movement", cue: "both-palms", confidence: 1 };
  }

  const indexHand = scoreableHands.find(isIndexHold);
  if (indexHand !== undefined) {
    return {
      kind: "movement",
      cue: "index-hold",
      confidence: indexHand.handednessScore,
    };
  }

  const openHand = openHands[0];
  if (openHand !== undefined) {
    return {
      kind: "movement",
      cue: openHand.handedness === "left" ? "left-palm" : "right-palm",
      confidence: openHand.handednessScore,
    };
  }

  return { kind: "neutral" };
}
