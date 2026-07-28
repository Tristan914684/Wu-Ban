import type { SessionMode } from "../../domain/chart/session-chart";
import { TRACKING_CONFIDENCE_THRESHOLD } from "../../domain/movement/landmarks";
import type {
  HandFrame,
  HandLandmarks,
  Handedness,
  LandmarkFrame,
  NormalizedLandmark,
  PoseFrame,
} from "../../domain/movement/landmarks";
import type {
  HandLandmarker,
  NormalizedLandmark as SdkLandmark,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

// Real-camera tuning entry point. This provider gate runs before the domain
// confidence checks in the standing and seated classifiers.
export const LANDMARK_DETECTOR_CONFIDENCE = TRACKING_CONFIDENCE_THRESHOLD;

export function translatePlayerFacingLandmark(
  landmark: SdkLandmark,
): NormalizedLandmark {
  const visibility =
    typeof landmark.visibility === "number" ? landmark.visibility : 1.0;
  return {
    // The preview is mirrored like a familiar selfie view. Normalize model
    // coordinates here so "left" in the domain matches what the player sees.
    x: 1 - landmark.x,
    y: landmark.y,
    z: landmark.z,
    visibility,
    presence: visibility,
  };
}

export class MediaPipeLandmarkDetector {
  private poseDetector: PoseLandmarker | null = null;
  private handDetector: HandLandmarker | null = null;
  private mode: SessionMode | null = null;
  private loadPromise: Promise<void> | null = null;

  load(mode: SessionMode): Promise<void> {
    if (this.mode === mode && this.loadPromise !== null) {
      return this.loadPromise;
    }
    this.close();
    this.mode = mode;
    this.loadPromise = this.loadForMode(mode);
    return this.loadPromise;
  }

  private async loadForMode(mode: SessionMode): Promise<void> {
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks(
      "/vendor/mediapipe",
    );

    if (mode === "standing") {
      this.poseDetector = await vision.PoseLandmarker.createFromOptions(
        fileset,
        {
          baseOptions: {
            modelAssetPath: "/models/pose_landmarker_lite.task",
            delegate: "CPU",
          },
          minPoseDetectionConfidence: LANDMARK_DETECTOR_CONFIDENCE,
          minPosePresenceConfidence: LANDMARK_DETECTOR_CONFIDENCE,
          minTrackingConfidence: LANDMARK_DETECTOR_CONFIDENCE,
          numPoses: 2,
          outputSegmentationMasks: false,
          runningMode: "VIDEO",
        },
      );
      return;
    }

    this.handDetector = await vision.HandLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: "/models/hand_landmarker.task",
        delegate: "CPU",
      },
      minHandDetectionConfidence: LANDMARK_DETECTOR_CONFIDENCE,
      minHandPresenceConfidence: LANDMARK_DETECTOR_CONFIDENCE,
      minTrackingConfidence: LANDMARK_DETECTOR_CONFIDENCE,
      numHands: 4,
      runningMode: "VIDEO",
    });
  }

  detect(video: HTMLVideoElement, timestampMs: number): LandmarkFrame {
    if (this.mode === "standing" && this.poseDetector !== null) {
      const result = this.poseDetector.detectForVideo(video, timestampMs);
      const firstPose = result.landmarks[0];
      const frame: PoseFrame = {
        kind: "pose",
        timestampMs,
        personCount: result.landmarks.length,
        landmarks: firstPose?.map(translatePlayerFacingLandmark) ?? [],
      };
      return frame;
    }

    if (this.mode === "seated" && this.handDetector !== null) {
      const result = this.handDetector.detectForVideo(video, timestampMs);
      const hands: HandLandmarks[] = result.landmarks.map(
        (landmarks, index) => {
          const category = result.handedness[index]?.[0];
          const handedness: Handedness =
            category?.categoryName.toLowerCase() === "left" ? "left" : "right";
          return {
            handedness,
            handednessScore: category?.score ?? 0,
            landmarks: landmarks.map(translatePlayerFacingLandmark),
          };
        },
      );
      const frame: HandFrame = {
        kind: "hands",
        timestampMs,
        personCount:
          result.landmarks.length === 0
            ? 0
            : Math.ceil(result.landmarks.length / 2),
        hands,
      };
      return frame;
    }

    throw new Error("Landmark detector is not ready for the selected mode.");
  }

  close(): void {
    this.poseDetector?.close();
    this.handDetector?.close();
    this.poseDetector = null;
    this.handDetector = null;
    this.loadPromise = null;
    this.mode = null;
  }
}
