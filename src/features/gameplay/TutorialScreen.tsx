import { useEffect, useRef, useState } from "react";

import type { BrowserCamera } from "../../adapters/camera/browser-camera";
import type { MediaPipeLandmarkDetector } from "../../adapters/pose/mediapipe-landmark-detector";
import type { InputSource } from "../../application/session/session-machine";
import type { Language } from "../../content/copy";
import type { SessionMode } from "../../domain/chart/session-chart";
import type {
  LandmarkFrame,
  MovementCue,
  MovementObservation,
} from "../../domain/movement/landmarks";
import { classifySeated } from "../../domain/movement/seated-classifier";
import {
  classifyStanding,
  type StandingCalibration,
} from "../../domain/movement/standing-classifier";
import { Button } from "../../ui/primitives/Button";
import { StepLayout } from "../../ui/components/StepLayout";
import {
  FramingTargetOverlay,
  TrackingLandmarkOverlay,
} from "../../ui/components/TrackingLandmarkOverlay";
import { trackingPartsLabel } from "../../ui/components/tracking-landmark-label";

interface TutorialScreenProps {
  readonly audioPreparing: boolean;
  readonly language: Language;
  readonly mode: SessionMode;
  readonly source: InputSource;
  readonly camera: BrowserCamera;
  readonly detector: MediaPipeLandmarkDetector;
  readonly calibration: StandingCalibration | null;
  readonly onStart: () => Promise<void>;
  readonly onSwitchToSeated: () => void;
}

const tutorialCues: Record<SessionMode, readonly MovementCue[]> = {
  standing: [
    "step-left",
    "step-right",
    "step-forward",
    "step-back",
  ],
  seated: ["left-palm", "right-palm", "both-palms", "index-hold"],
};

const cueLabels: Record<MovementCue, readonly [string, string]> = {
  "step-left": ["向左一步", "Step left"],
  "step-right": ["向右一步", "Step right"],
  "step-forward": ["轻轻向前", "Gentle forward"],
  "step-back": ["轻轻退回", "Gentle back"],
  "left-palm": ["左手掌", "Left palm"],
  "right-palm": ["右手掌", "Right palm"],
  "both-palms": ["双手掌", "Both palms"],
  "index-hold": ["食指保持", "Index hold"],
};

export function TutorialScreen({
  audioPreparing,
  language,
  mode,
  source,
  camera,
  detector,
  calibration,
  onStart,
  onSwitchToSeated,
}: TutorialScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cueIndex, setCueIndex] = useState(0);
  const [repetitions, setRepetitions] = useState(0);
  const [practiceRun, setPracticeRun] = useState(0);
  const [slower, setSlower] = useState(false);
  const [trackedFrame, setTrackedFrame] = useState<LandmarkFrame | null>(null);
  const [observation, setObservation] =
    useState<MovementObservation | null>(null);
  const isChinese = language === "zh";
  const cues = tutorialCues[mode];
  const complete = cueIndex >= cues.length;
  const currentCue = cues[Math.min(cueIndex, cues.length - 1)];

  useEffect(() => {
    if (complete || currentCue === undefined) {
      return;
    }

    if (source === "synthetic") {
      let emitted = 0;
      const timer = window.setInterval(() => {
        emitted += 1;
        setRepetitions(emitted);
        if (emitted >= 2) {
          window.clearInterval(timer);
        }
      }, slower ? 260 : 120);
      return () => {
        window.clearInterval(timer);
      };
    }

    let cancelled = false;
    let frameRequest = 0;
    let lastInferenceAt = 0;
    let targetWasActive = false;

    const rehearse = async () => {
      const video = videoRef.current;
      if (video === null) {
        return;
      }
      try {
        await camera.attachPreview(video);
      } catch {
        return;
      }

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
          const nextObservation =
            frame.kind === "hands"
              ? classifySeated(frame)
              : calibration === null
                ? {
                    kind: "unscoreable" as const,
                    reason: "missing-landmarks" as const,
                  }
                : classifyStanding(frame, calibration);
          setObservation(nextObservation);
          const targetActive =
            nextObservation.kind === "movement" &&
            nextObservation.cue === currentCue;
          if (targetActive && !targetWasActive) {
            setRepetitions((current) => Math.min(2, current + 1));
          }
          targetWasActive = targetActive;
        }
        frameRequest = requestAnimationFrame(detectFrame);
      };
      frameRequest = requestAnimationFrame(detectFrame);
    };

    void rehearse();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRequest);
    };
  }, [
    calibration,
    camera,
    complete,
    currentCue,
    detector,
    practiceRun,
    slower,
    source,
  ]);

  useEffect(() => {
    if (repetitions < 2) {
      return;
    }
    const timer = window.setTimeout(() => {
      setCueIndex((current) => current + 1);
      setRepetitions(0);
    }, slower ? 600 : 260);
    return () => {
      window.clearTimeout(timer);
    };
  }, [repetitions, slower]);

  const observationLabel =
    observation === null
      ? isChinese
        ? "等待动作…"
        : "Waiting for movement…"
      : observation.kind === "movement"
        ? isChinese
          ? `检测到：${cueLabels[observation.cue][0]}`
          : `Detected: ${cueLabels[observation.cue][1]}`
        : observation.kind === "neutral"
          ? isChinese
            ? "检测到：回到中间"
            : "Detected: centred"
          : isChinese
            ? "追踪不清，请按绿色骨架调整位置"
            : "Tracking unclear — reposition using the green skeleton";

  return (
    <StepLayout
      aside={
        <div
          className="tutorial-demonstration"
          data-slower={slower ? "true" : "false"}
        >
          {source === "camera" ? (
            <div className="tutorial-demonstration__preview">
              <video
                aria-label={
                  isChinese ? "练习动作摄像头预览" : "Practice camera preview"
                }
                autoPlay
                data-camera-preview
                muted
                playsInline
                ref={videoRef}
              />
              <FramingTargetOverlay language={language} mode={mode} />
              <TrackingLandmarkOverlay
                frame={trackedFrame}
                language={language}
                mode={mode}
              />
            </div>
          ) : (
            <div className="synthetic-figure" aria-hidden="true">
              <span className="synthetic-figure__head" />
              <span className="synthetic-figure__body" />
              <span className="synthetic-figure__arms" />
            </div>
          )}
          <strong>
            {complete || currentCue === undefined
              ? isChinese
                ? "四个动作都准备好了"
                : "All four moves are ready"
              : cueLabels[currentCue][isChinese ? 0 : 1]}
          </strong>
          <span>
            {complete
              ? isChinese
                ? "不需要完美，舒服地跟上就好。"
                : "Comfortable movement is enough. It does not need to be perfect."
              : isChinese
                ? `舒服完成 ${repetitions} / 2 次`
                : `${repetitions} / 2 comfortable repetitions`}
          </span>
          {source === "camera" ? (
            <div className="tutorial-demonstration__tracking">
              <span>{trackingPartsLabel(trackedFrame, language, mode)}</span>
              <strong>{observationLabel}</strong>
            </div>
          ) : null}
        </div>
      }
      description={
        <p>
          {isChinese
            ? "一次只练一个动作。动作模型只确认方向和清晰度，不要求完美姿势。"
            : "Practice one move at a time. The movement model checks direction and clarity, not perfect form."}
        </p>
      }
      eyebrow={isChinese ? "§ 06 — 动作练习" : "§ 06 — MOVE PRACTICE"}
      title={
        complete
          ? isChinese
            ? "准备好了。"
            : "Ready to dance."
          : isChinese
            ? "每个动作，舒服做两次。"
            : "Two comfortable repetitions."
      }
    >
      <ol className="cue-vocabulary">
        {cues.map((cue, index) => (
          <li
            aria-current={index === cueIndex ? "step" : undefined}
            data-complete={index < cueIndex ? "true" : "false"}
            key={cue}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {cueLabels[cue][isChinese ? 0 : 1]}
          </li>
        ))}
      </ol>
      {complete ? (
        <Button disabled={audioPreparing} onClick={() => void onStart()}>
          {audioPreparing
            ? isChinese
              ? "正在准备节拍…"
              : "Preparing the beat…"
            : isChinese
              ? "听到节拍，开始倒数"
              : "Hear the beat and count down"}
        </Button>
      ) : (
        <div className="action-row">
          <Button
            onClick={() => {
              setRepetitions(0);
              setPracticeRun((current) => current + 1);
            }}
            variant="secondary"
          >
            {isChinese ? "重播这个动作" : "Replay this move"}
          </Button>
          <Button
            aria-pressed={slower}
            onClick={() => {
              setSlower((current) => !current);
            }}
            variant="quiet"
          >
            {isChinese ? "放慢示范" : "Slower demonstration"}
          </Button>
          {mode === "standing" ? (
            <Button onClick={onSwitchToSeated} variant="quiet">
              {isChinese ? "改用坐姿手势" : "Switch to seated mode"}
            </Button>
          ) : null}
        </div>
      )}
      <p className="supporting-copy">
        {isChinese
          ? "正式游戏使用项目自制的《茉莉花》程序编曲；模拟练习和模拟数据会始终清楚标示。"
          : "Normal play uses the project's procedural Mo Li Hua arrangement. Simulated practice and data remain clearly labelled."}
      </p>
    </StepLayout>
  );
}
