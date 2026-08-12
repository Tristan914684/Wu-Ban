import { useEffect, useRef, useState } from "react";

import type { BrowserCamera } from "../../adapters/camera/browser-camera";
import type { MediaPipeLandmarkDetector } from "../../adapters/pose/mediapipe-landmark-detector";
import type { InputSource } from "../../application/session/session-machine";
import type { Language } from "../../content/copy";
import type { SessionMode } from "../../domain/chart/session-chart";
import { classifySeated } from "../../domain/movement/seated-classifier";
import {
  averageStandingCalibrations,
  calibrateStanding,
  type StandingCalibration,
} from "../../domain/movement/standing-classifier";
import type {
  LandmarkFrame,
  MovementObservation,
} from "../../domain/movement/landmarks";
import {
  INITIAL_TRACKING_STABILITY,
  updateTrackingStability,
} from "../../domain/quality/tracking-stability";
import { Button } from "../../ui/primitives/Button";
import { StepLayout } from "../../ui/components/StepLayout";
import {
  FramingTargetOverlay,
  PerceptionStatus,
  TrackingLandmarkOverlay,
} from "../../ui/components/TrackingLandmarkOverlay";
import { trackingPartsLabel } from "../../ui/components/tracking-landmark-label";

interface CalibrationScreenProps {
  readonly language: Language;
  readonly mode: SessionMode;
  readonly source: InputSource;
  readonly camera: BrowserCamera;
  readonly detector: MediaPipeLandmarkDetector;
  readonly onComplete: (calibration: StandingCalibration | null) => void;
  readonly onUseSyntheticFallback: () => void;
}

type CalibrationState =
  | { readonly kind: "loading" }
  | {
      readonly kind: "framing";
      readonly progress: number;
      readonly issue: "position" | "multiple-people" | "lighting";
    }
  | {
      readonly kind: "ready";
      readonly calibration: StandingCalibration | null;
    }
  | { readonly kind: "error"; readonly message: string };

function incompleteCalibrationPercent(progress: number): number {
  return Math.min(99, Math.floor(progress * 100));
}

export function CalibrationScreen({
  language,
  mode,
  source,
  camera,
  detector,
  onComplete,
  onUseSyntheticFallback,
}: CalibrationScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<CalibrationState>({ kind: "loading" });
  const [trackedFrame, setTrackedFrame] = useState<LandmarkFrame | null>(null);
  const [perceptionObservation, setPerceptionObservation] =
    useState<MovementObservation | null>(null);
  const isChinese = language === "zh";

  useEffect(() => {
    let cancelled = false;
    let frameRequest = 0;
    let lastInferenceAt = 0;
    let stability = INITIAL_TRACKING_STABILITY;
    const standingSamples: StandingCalibration[] = [];

    if (source === "synthetic") {
      const timer = window.setTimeout(() => {
        if (!cancelled) {
          setState({ kind: "ready", calibration: null });
        }
      }, 500);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }

    const prepare = async () => {
      const video = videoRef.current;
      if (video === null) {
        return;
      }
      try {
        await camera.attachPreview(video);
        await detector.load(mode);
        if (cancelled) {
          return;
        }
        setState({ kind: "framing", progress: 0, issue: "position" });

        const detectFrame = (timestampMs: number) => {
          if (cancelled) {
            return;
          }
          if (
            video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
            timestampMs - lastInferenceAt >= 80
          ) {
            lastInferenceAt = timestampMs;
            const frame = detector.detect(video, timestampMs);
            setTrackedFrame(frame);
            let nextCalibration: StandingCalibration | null = null;
            let scoreable = false;
            let issue: "position" | "multiple-people" | "lighting" =
              "position";
            if (frame.kind === "pose") {
              const calibration = calibrateStanding(frame);
              if (calibration !== undefined) {
                standingSamples.push(calibration);
                nextCalibration =
                  averageStandingCalibrations(standingSamples) ?? calibration;
                scoreable = true;
                setPerceptionObservation({ kind: "neutral" });
              } else {
                standingSamples.length = 0;
                const reason =
                  frame.personCount > 1
                    ? "multiple-people"
                    : frame.personCount === 0 || frame.landmarks.length < 29
                      ? "missing-landmarks"
                      : "low-confidence";
                setPerceptionObservation({
                  kind: "unscoreable",
                  reason,
                });
                issue =
                  frame.personCount > 1
                    ? "multiple-people"
                    : frame.personCount === 0 || frame.landmarks.length < 29
                      ? "position"
                      : "lighting";
              }
            } else {
              const observation = classifySeated(frame);
              setPerceptionObservation(observation);
              if (observation.kind !== "unscoreable") {
                scoreable = true;
              } else {
                issue =
                  observation.reason === "multiple-people"
                    ? "multiple-people"
                    : observation.reason === "missing-landmarks"
                      ? "position"
                      : "lighting";
              }
            }
            stability = updateTrackingStability(
              stability,
              timestampMs,
              scoreable,
            );
            if (stability.ready) {
              setState({ kind: "ready", calibration: nextCalibration });
              return;
            }
            setState({
              kind: "framing",
              progress: stability.progress,
              issue,
            });
          }
          frameRequest = requestAnimationFrame(detectFrame);
        };
        frameRequest = requestAnimationFrame(detectFrame);
      } catch (error: unknown) {
        if (!cancelled) {
          setState({
            kind: "error",
            message:
              error instanceof Error
                ? error.message
                : "Landmark preparation failed.",
          });
        }
      }
    };

    void prepare();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRequest);
    };
  }, [camera, detector, mode, source]);

  const instruction =
    mode === "standing"
      ? isChinese
        ? "后退到全身都在框内，双脚自然分开。"
        : "Step back until your full body is inside the frame."
      : isChinese
        ? "坐稳后，把双手举到肩膀附近。"
        : "Sit comfortably and raise both hands near shoulder height.";

  const framingMessage =
    state.kind !== "framing"
      ? ""
      : state.issue === "multiple-people"
        ? isChinese
          ? "只保留一位主要玩家在轮廓内；朋友可以站到边界外。"
          : "Keep one primary player inside the outline. Friends can stand outside the boundary."
        : state.issue === "lighting"
          ? isChinese
            ? "请增加正面光线、避开背光，并确保全身或双手清楚可见。"
            : "Add light in front, avoid backlight, and keep your body or hands visible."
          : isChinese
            ? "保持在轮廓内三秒。"
            : "Hold inside the outline for three seconds.";

  return (
    <StepLayout
      aside={
        <div className="camera-stage">
          {source === "camera" ? (
            <>
              <video
                aria-label={isChinese ? "摄像头预览" : "Camera preview"}
                autoPlay
                data-camera-preview
                muted
                playsInline
                ref={videoRef}
              />
              <TrackingLandmarkOverlay
                frame={trackedFrame}
                language={language}
                mode={mode}
              />
              <PerceptionStatus
                frame={trackedFrame}
                language={language}
                mode={mode}
                observation={perceptionObservation}
              />
            </>
          ) : (
            <div className="synthetic-figure" aria-hidden="true">
              <span className="synthetic-figure__head" />
              <span className="synthetic-figure__body" />
              <span className="synthetic-figure__arms" />
            </div>
          )}
          <FramingTargetOverlay language={language} mode={mode} />
          <p className="camera-stage__status">
            {state.kind === "loading"
              ? isChinese
                ? "正在准备本机模型…"
                : "Preparing local model…"
              : state.kind === "framing"
                ? isChinese
                  ? `稳定追踪 ${incompleteCalibrationPercent(state.progress)}%`
                  : `Stable tracking ${incompleteCalibrationPercent(state.progress)}%`
                : state.kind === "ready"
                  ? isChinese
                    ? "校准完成 — 100%"
                    : "Calibration complete — 100%"
                  : isChinese
                    ? "暂时无法读取"
                    : "Could not read input"}
          </p>
          {state.kind === "framing" ? (
            <>
              <p className="camera-stage__parts">
                {trackingPartsLabel(trackedFrame, language, mode)}
              </p>
              <p className="camera-stage__guidance">{framingMessage}</p>
            </>
          ) : null}
        </div>
      }
      description={<p>{instruction}</p>}
      eyebrow={isChinese ? "§ 05 — 校准" : "§ 05 — CALIBRATION"}
      title={
        mode === "standing"
          ? isChinese
            ? "站进轮廓里。"
            : "Step into the outline."
          : isChinese
            ? "让双手看得清。"
            : "Keep both hands visible."
      }
    >
      {state.kind === "ready" ? (
        <Button
          onClick={() => {
            onComplete(state.calibration);
          }}
        >
          {isChinese ? "位置没问题" : "Position looks good"}
        </Button>
      ) : null}
      {state.kind === "error" ? (
        <>
          <div className="status-message status-message--error" role="alert">
            {isChinese
              ? "本机动作模型没有准备好。你可以改用清楚标示的模拟演示。"
              : "The on-device movement model did not become ready. You can switch to the clearly labelled simulated demo."}
            <details>
              <summary>{isChinese ? "技术信息" : "Technical detail"}</summary>
              <code>{state.message}</code>
            </details>
          </div>
          <Button onClick={onUseSyntheticFallback} variant="secondary">
            {isChinese ? "改用模拟演示" : "Use simulated demo"}
          </Button>
        </>
      ) : null}
    </StepLayout>
  );
}
