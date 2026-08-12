import { useCallback, useEffect, useRef, useState } from "react";

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
import { PracticePositionGuide } from "../../ui/components/PracticePositionGuide";
import { Button } from "../../ui/primitives/Button";
import {
  FramingTargetOverlay,
  PerceptionStatus,
  TrackingLandmarkOverlay,
} from "../../ui/components/TrackingLandmarkOverlay";
import { trackingPartsLabel } from "../../ui/components/tracking-landmark-label";
import {
  INITIAL_TUTORIAL_REPETITION_LATCH,
  updateTutorialRepetitionLatch,
} from "./tutorial-repetition";
import { practiceHomeStatusLabel } from "./practice-home-status";

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

const cueMarks: Record<MovementCue, string> = {
  "step-left": "←",
  "step-right": "→",
  "step-forward": "↑",
  "step-back": "↓",
  "left-palm": "L",
  "right-palm": "R",
  "both-palms": "L·R",
  "index-hold": "I",
};

const cueInstructions: Record<MovementCue, { zh: string; en: string }> = {
  "step-left": {
    zh: "左脚向左侧迈出一步，随后收回中央脚印",
    en: "Step to the left with your left foot, then return to center",
  },
  "step-right": {
    zh: "右脚向右侧迈出一步，随后收回中央脚印",
    en: "Step to the right with your right foot, then return to center",
  },
  "step-forward": {
    zh: "一只脚向前轻迈一步，随后收回中央脚印",
    en: "Step gently forward with one foot, then return to center",
  },
  "step-back": {
    zh: "一只脚向后轻退一步，随后收回中央脚印",
    en: "Step gently back with one foot, then return to center",
  },
  "left-palm": {
    zh: "举起左手，掌心向前对准左侧圆圈",
    en: "Raise left hand, palm facing forward into left circle",
  },
  "right-palm": {
    zh: "举起右手，掌心向前对准右侧圆圈",
    en: "Raise right hand, palm facing forward into right circle",
  },
  "both-palms": {
    zh: "双手同时举起，掌心向前对准左右圆圈",
    en: "Raise both hands, palms facing forward into both circles",
  },
  "index-hold": {
    zh: "伸出食指向上，保持静止直到计数",
    en: "Point index finger upwards and hold still until counted",
  },
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [cueIndex, setCueIndex] = useState(0);
  const [repetitions, setRepetitions] = useState(0);
  const [practiceRun, setPracticeRun] = useState(0);
  const [slower, setSlower] = useState(false);
  const [trackedFrame, setTrackedFrame] = useState<LandmarkFrame | null>(null);
  const [observation, setObservation] =
    useState<MovementObservation | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoOverlayRef = useRef<HTMLDivElement>(null);
  const isChinese = language === "zh";
  const cues = tutorialCues[mode];
  const complete = cueIndex >= cues.length;
  const currentCue = cues[Math.min(cueIndex, cues.length - 1)];

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

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
    let repetitionLatch = INITIAL_TUTORIAL_REPETITION_LATCH;

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
          const nextLatch = updateTutorialRepetitionLatch(
            repetitionLatch,
            nextObservation,
            currentCue,
          );
          repetitionLatch = nextLatch.latch;
          if (nextLatch.completedRepetition) {
            setRepetitions((current) => Math.min(2, current + 1));
          }
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
      setObservation(null);
    }, slower ? 600 : 260);
    return () => {
      window.clearTimeout(timer);
    };
  }, [repetitions, slower]);

  const centred = observation?.kind === "neutral";
  const homeStatusLabel = practiceHomeStatusLabel(language, mode, observation);
  const homeCardLabel =
    observation?.kind === "movement"
      ? isChinese
        ? "下一步"
        : "NEXT"
      : isChinese
        ? "默认位置"
        : "DEFAULT POSITION";
  const centreInstruction =
    mode === "standing"
      ? isChinese
        ? "每次迈步后，把双脚放回两枚脚印，再做下一次。"
        : "After every step, place both feet back on the two marks before the next repetition."
      : isChinese
        ? "身体保持在中央；每次手势后，把双手放回肩膀旁。"
        : "Keep your body centred. After each gesture, return both hands beside your shoulders.";

  const closeInfo = useCallback(() => {
    setInfoOpen(false);
  }, []);

  useEffect(() => {
    if (!infoOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setInfoOpen(false);
      }
    };
    const handleClickOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !infoOverlayRef.current?.contains(event.target)
      ) {
        setInfoOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [infoOpen]);

  return (
    <main className="practice-screen">
      <header className="visually-hidden">
        <h1 ref={headingRef} tabIndex={-1}>
          {mode === "standing"
            ? isChinese
              ? "双脚从中央脚印开始，每一步后回到脚印。"
              : "Feet on the centre marks. Return after each step."
            : isChinese
              ? "双手从肩旁开始，每次手势后放回原位。"
              : "Hands by your shoulders. Reset after each gesture."}
        </h1>
        <p>{centreInstruction}</p>
      </header>

      <div
        className="practice-screen__workspace"
        data-complete={complete ? "true" : "false"}
      >
        <div className="practice-screen__stage-column">
          <section
            aria-label={isChinese ? "动作练习摄像头" : "Movement practice camera"}
            className="practice-stage"
            data-complete={complete ? "true" : "false"}
            data-practice-stage
            data-slower={slower ? "true" : "false"}
          >
            <div className="practice-camera-surface" data-practice-camera-surface>
              {source === "camera" ? (
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
              ) : (
                <div className="synthetic-figure" aria-hidden="true">
                  <span className="synthetic-figure__head" />
                  <span className="synthetic-figure__body" />
                  <span className="synthetic-figure__arms" />
                </div>
              )}
              <FramingTargetOverlay language={language} mode={mode} />
              <PracticePositionGuide
                centred={centred}
                language={language}
                mode={mode}
              />
              {source === "camera" ? (
                <>
                  <TrackingLandmarkOverlay
                    frame={trackedFrame}
                    language={language}
                    mode={mode}
                  />
                  <PerceptionStatus
                    frame={trackedFrame}
                    language={language}
                    mode={mode}
                    observation={observation}
                  />
                </>
              ) : null}
              {source === "camera" ? (
                <div className="practice-tracking-readout">
                  <span>{trackingPartsLabel(trackedFrame, language, mode)}</span>
                  <strong>
                    {observation?.kind === "movement"
                      ? isChinese
                        ? `检测到：${cueLabels[observation.cue][0]}`
                        : `Detected: ${cueLabels[observation.cue][1]}`
                      : homeStatusLabel}
                  </strong>
                </div>
              ) : (
                <div className="practice-tracking-readout">
                  <span>{isChinese ? "模拟模式" : "Synthetic mode"}</span>
                  <strong>{homeStatusLabel}</strong>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="practice-screen__sidebar">
          <aside
            aria-label={isChinese ? "四个练习动作" : "Four practice moves"}
            className="practice-move-index"
          >
            <span>{isChinese ? "动作" : "MOVES"}</span>
            <ol>
              {cues.map((cue, index) => (
                <li
                  aria-current={index === cueIndex ? "step" : undefined}
                  data-complete={index < cueIndex ? "true" : "false"}
                  key={cue}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span className="practice-move-index__name">
                    {cueLabels[cue][isChinese ? 0 : 1]}
                  </span>
                </li>
              ))}
            </ol>
          </aside>

          <div aria-live="polite" className="practice-cue-card">
            <div className="practice-cue-card__header">
              <span aria-hidden="true" className="practice-cue-card__mark">
                {complete || currentCue === undefined
                  ? "✓"
                  : cueMarks[currentCue]}
              </span>
              <div>
                <strong>
                  {complete || currentCue === undefined
                    ? isChinese
                      ? "四个动作都准备好了"
                      : "All four moves ready"
                    : cueLabels[currentCue][isChinese ? 0 : 1]}
                </strong>
                <span>
                  {complete
                    ? isChinese
                      ? "保持在中央，准备开始。"
                      : "Stay centred & ready."
                    : isChinese
                      ? `${repetitions} / 2 次`
                      : `${repetitions} / 2 repetitions`}
                </span>
              </div>
            </div>
            {!complete && currentCue !== undefined ? (
              <div className="practice-cue-instruction">
                <p>{cueInstructions[currentCue][isChinese ? "zh" : "en"]}</p>
              </div>
            ) : null}
          </div>

          <button
            aria-label={
              isChinese ? "查看默认位置说明" : "View default position guide"
            }
            className="practice-info-trigger"
            onClick={() => {
              setInfoOpen(true);
            }}
            type="button"
          >
            <span aria-hidden="true" className="practice-info-trigger__icon">
              i
            </span>
            {isChinese ? "默认位置" : "Position guide"}
          </button>

          {infoOpen ? (
            <div
              aria-label={
                isChinese ? "默认位置说明" : "Default position guide"
              }
              className="practice-info-overlay"
              role="dialog"
            >
              <div className="practice-info-overlay__card" ref={infoOverlayRef}>
                <button
                  aria-label={isChinese ? "关闭" : "Close"}
                  className="practice-info-overlay__close"
                  onClick={closeInfo}
                  type="button"
                >
                  ✕
                </button>
                <span>{homeCardLabel}</span>
                <strong>{homeStatusLabel}</strong>
                <div aria-hidden="true" className="practice-centre-diagram">
                  <span>←</span>
                  <i />
                  <span>→</span>
                </div>
                <p>{centreInstruction}</p>
              </div>
            </div>
          ) : null}

          <div className="practice-screen__controls">
            {!complete ? (
              <Button
                onClick={() => {
                  setRepetitions(0);
                  setObservation(null);
                  setPracticeRun((current) => current + 1);
                }}
                variant="secondary"
              >
                {isChinese ? "重播这个动作" : "Replay this move"}
              </Button>
            ) : null}

            {complete ? (
              <Button disabled={audioPreparing} onClick={() => void onStart()}>
                {audioPreparing
                  ? isChinese
                    ? "正在准备节拍…"
                    : "Preparing beat…"
                  : isChinese
                    ? "听到节拍，开始倒数"
                    : "Hear beat & count down"}
              </Button>
            ) : (
              <>
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
                    {isChinese ? "改用坐姿" : "Switch to seated"}
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

