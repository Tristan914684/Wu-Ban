import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { BrowserCueNarrator } from "../../adapters/audio/browser-cue-narrator";
import type { BrowserCamera } from "../../adapters/camera/browser-camera";
import type { MediaPipeLandmarkDetector } from "../../adapters/pose/mediapipe-landmark-detector";
import {
  DevicePerformanceEvidenceCollector,
  type DevicePerformanceEvidenceReport,
} from "../../application/performance/device-performance-evidence";
import { shouldRunCameraInference } from "../../application/performance/inference-cadence";
import type { SessionClock } from "../../application/ports/session-clock";
import type { InputSource } from "../../application/session/session-machine";
import type { Language } from "../../content/copy";
import type {
  SessionChart,
  SessionCue,
  SessionMode,
} from "../../domain/chart/session-chart";
import type {
  MovementCue,
  MovementObservation,
} from "../../domain/movement/landmarks";
import type { SongDefinition } from "../../domain/music/song-catalog";
import {
  frameConfidence,
  MOVEMENT_CLASSIFIER_VERSION,
} from "../../domain/movement/landmarks";
import { classifySeated } from "../../domain/movement/seated-classifier";
import {
  replaySyntheticObservation,
  replaySyntheticTrackingObservation,
  type SyntheticTrackingScenario,
} from "../../domain/movement/synthetic-trace";
import {
  classifyStanding,
  type StandingCalibration,
} from "../../domain/movement/standing-classifier";
import {
  outcomeForAttempt,
  type AttemptOutcome,
  type CueAttempt,
} from "../../domain/scoring/session-score";
import {
  adaptCueSupport,
  CUE_PREVIEW_MS,
  makeCueSupportGentler,
  type CueSupportLevel,
} from "../../domain/gameplay/adaptive-support";
import {
  INITIAL_MOVEMENT_CAPTURE_LATCH,
  observationForCue,
  updateMovementCaptureLatch,
  type MovementCaptureLatch,
} from "../../domain/gameplay/captured-movement";
import { Button } from "../../ui/primitives/Button";
import { cueRunwayView } from "./gameplay-cue-view";
import { GameplayMusicVideo } from "./GameplayMusicVideo";
import { GameplayPhaseRail } from "./GameplayPhaseRail";
import { GameplayPlayerStatePanel } from "./GameplayPlayerStatePanel";
import { livePlayerState } from "./live-player-state";

type TrackingIssue = Extract<
  MovementObservation,
  { readonly kind: "unscoreable" }
>["reason"];

interface GameplayScreenProps {
  readonly language: Language;
  readonly mode: SessionMode;
  readonly source: InputSource;
  readonly chart: SessionChart;
  readonly song: SongDefinition;
  readonly camera: BrowserCamera;
  readonly detector: MediaPipeLandmarkDetector;
  readonly calibration: StandingCalibration | null;
  readonly clock: SessionClock;
  readonly playback: "running" | "paused" | "tracking-lost";
  readonly syntheticTrackingScenario: SyntheticTrackingScenario;
  readonly reducedMotion: boolean;
  readonly onPause: () => void;
  readonly onResume: () => void;
  readonly onTrackingLost: () => void;
  readonly onTrackingRecovered: () => void;
  readonly onClockFailure: (point: "start" | "runtime") => void;
  readonly onAttemptsChange: (attempts: readonly CueAttempt[]) => void;
  readonly onComplete: (
    attempts: readonly CueAttempt[],
    performanceEvidence: DevicePerformanceEvidenceReport | null,
  ) => void;
}

const CUE_LANES: Record<MovementCue, number> = {
  "step-left": 0,
  "step-forward": 1,
  "step-back": 2,
  "step-right": 3,
  "left-palm": 0,
  "both-palms": 1,
  "index-hold": 2,
  "right-palm": 3,
};

const CUE_SYMBOLS: Record<MovementCue, string> = {
  "step-left": "←",
  "step-forward": "↑",
  "step-back": "↓",
  "step-right": "→",
  "left-palm": "左",
  "both-palms": "双",
  "index-hold": "指",
  "right-palm": "右",
};

const RUNWAY_LANE_TOP = [39.5, 46.5, 53.5, 60.5] as const;
const RUNWAY_LANE_BOTTOM = [14, 38, 62, 86] as const;

function cueLabel(language: Language, cue: MovementCue | null): string {
  const labels: Record<MovementCue, readonly [string, string]> = {
    "step-left": ["向左一步", "Step left"],
    "step-right": ["向右一步", "Step right"],
    "step-forward": ["轻轻向前", "Gentle forward"],
    "step-back": ["轻轻退回", "Gentle back"],
    "left-palm": ["左手掌", "Left palm"],
    "right-palm": ["右手掌", "Right palm"],
    "both-palms": ["双手掌", "Both palms"],
    "index-hold": ["食指保持", "Index hold"],
  };
  if (cue === null) {
    return language === "zh" ? "停住" : "HOLD";
  }
  return labels[cue][language === "zh" ? 0 : 1];
}

function cueRunwayStyle(
  cue: SessionCue,
  elapsedMs: number,
  lookaheadMs: number,
  reducedMotion: boolean,
): CSSProperties {
  const { progress } = cueRunwayView(
    cue.atMs,
    elapsedMs,
    lookaheadMs,
    reducedMotion,
  );
  const lane = cue.expected === null ? null : CUE_LANES[cue.expected];
  const laneTop = lane === null ? 50 : (RUNWAY_LANE_TOP[lane] ?? 50);
  const laneBottom = lane === null ? 50 : (RUNWAY_LANE_BOTTOM[lane] ?? 50);
  const left =
    lane === null
      ? 50
      : laneTop + (laneBottom - laneTop) * progress;

  return {
    left: `${left}%`,
    top: `${8 + progress * 72}%`,
    opacity: 0.52 + progress * 0.48,
    transform: `translate(-50%, -50%) scale(${0.84 + progress * 0.16})`,
  };
}

function observationToAttempt(
  cue: SessionCue,
  observation: MovementObservation,
  timingOffsetMs: number | null,
): CueAttempt {
  return {
    cueId: cue.id,
    expected: cue.expected,
    observed: observation.kind === "movement" ? observation.cue : null,
    timingOffsetMs:
      observation.kind === "unscoreable" ? null : timingOffsetMs,
    scoreable: observation.kind !== "unscoreable",
  };
}

export function GameplayScreen({
  language,
  mode,
  source,
  chart,
  song,
  camera,
  detector,
  calibration,
  clock,
  playback,
  syntheticTrackingScenario,
  reducedMotion,
  onPause,
  onResume,
  onTrackingLost,
  onTrackingRecovered,
  onClockFailure,
  onAttemptsChange,
  onComplete,
}: GameplayScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const attemptsRef = useRef<CueAttempt[]>([]);
  const attemptedIdsRef = useRef(new Set<string>());
  const lastObservationRef = useRef<MovementObservation>({ kind: "neutral" });
  const movementCaptureRef = useRef<MovementCaptureLatch>(
    INITIAL_MOVEMENT_CAPTURE_LATCH,
  );
  const lastAdaptationAtRef = useRef(0);
  const completedRef = useRef(false);
  const trackingLostAtRef = useRef<number | null>(null);
  const lastInferenceAtRef = useRef<number | null>(null);
  const syntheticTrackingFaultRef = useRef(false);
  const playbackRef = useRef(playback);
  const pauseDialogRef = useRef<HTMLDivElement>(null);
  const restorePauseFocusRef = useRef(false);
  const performanceStartRef = useRef(0);
  const renderSampleRef = useRef({ atMs: 0, frames: 0 });
  const inferenceSampleRef = useRef({
    atMs: 0,
    frames: 0,
    confidenceTotal: 0,
  });
  const [elapsedMs, setElapsedMs] = useState(0);
  const [cueSupport, setCueSupport] = useState<CueSupportLevel>(1);
  const [musicVolume, setMusicVolume] = useState(0.75);
  const [cueVolume, setCueVolume] = useState(0.9);
  const [voiceGuidance, setVoiceGuidance] = useState(false);
  const [judgment, setJudgment] = useState<{
    readonly outcome: AttemptOutcome;
    readonly atMs: number;
  } | null>(null);
  const [narrator] = useState(() => new BrowserCueNarrator());
  const [trackingIssue, setTrackingIssue] =
    useState<TrackingIssue | null>(null);
  const [debugMetrics, setDebugMetrics] = useState({
    renderRate: 0,
    inferenceRate: 0,
    audioOffsetMs: 0,
    confidence: 0,
  });
  const [detectedAction, setDetectedAction] = useState("neutral");
  const [liveObservation, setLiveObservation] =
    useState<MovementObservation>({ kind: "neutral" });
  const [provisionalValid, setProvisionalValid] = useState(false);
  const [feedback, setFeedback] = useState(
    language === "zh" ? "准备" : "Ready",
  );
  const [clockError, setClockError] = useState(false);
  const isChinese = language === "zh";
  const debugEnabled =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get("debug") === "1";
  const cuePreviewMs = CUE_PREVIEW_MS[cueSupport];

  const visibleCue = useMemo(
    () =>
      chart.cues.find(
        (cue) =>
          cue.atMs >= elapsedMs - 500 &&
          cue.atMs <= elapsedMs + cuePreviewMs,
      ),
    [chart.cues, cuePreviewMs, elapsedMs],
  );
  const cueIntervalMs = Math.max(
    1,
    (chart.cues[1]?.atMs ?? 2_000) - (chart.cues[0]?.atMs ?? 0),
  );
  const runwayLookaheadMs = cueIntervalMs * 5;
  const runwayCues = useMemo(
    () =>
      chart.cues
        .filter(
          (cue) =>
            cue.atMs >= elapsedMs - 500 &&
            cue.atMs <= elapsedMs + runwayLookaheadMs,
        )
        .slice(0, 5),
    [chart.cues, elapsedMs, runwayLookaheadMs],
  );

  useEffect(() => {
    playbackRef.current = playback;
  }, [playback]);

  useEffect(() => {
    if (playback === "paused") {
      pauseDialogRef.current
        ?.querySelector<HTMLButtonElement>(".pause-overlay__resume")
        ?.focus({ preventScroll: true });
      return;
    }
    if (playback === "running" && restorePauseFocusRef.current) {
      restorePauseFocusRef.current = false;
      document
        .querySelector<HTMLButtonElement>(".gameplay-pause")
        ?.focus({ preventScroll: true });
    }
  }, [playback]);

  useEffect(() => {
    if (!voiceGuidance || visibleCue === undefined) {
      narrator.stop();
      return;
    }
    narrator.speak(
      cueLabel(language, visibleCue.expected),
      language,
      cueVolume,
    );
    return () => {
      narrator.stop();
    };
  }, [
    cueVolume,
    language,
    narrator,
    visibleCue,
    voiceGuidance,
  ]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (
        document.hidden &&
        playbackRef.current === "running"
      ) {
        void clock
          .pause()
          .then(() => {
            onPause();
          })
          .catch(() => {
            onClockFailure("runtime");
          });
      }
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      document.removeEventListener("visibilitychange", pauseWhenHidden);
    };
  }, [clock, onClockFailure, onPause]);

  useEffect(() => {
    let cancelled = false;
    let animationFrame = 0;
    let lastUiUpdate = 0;
    const performanceEvidence =
      debugEnabled && source === "camera"
        ? new DevicePerformanceEvidenceCollector({
          mode: chart.mode,
          chartId: chart.id,
          chartVersion: chart.version,
        })
        : null;

    const start = async () => {
      try {
        if (source === "camera" && videoRef.current !== null) {
          await camera.attachPreview(videoRef.current);
        }
        await clock.start(chart);
        performanceStartRef.current = performance.now();
        renderSampleRef.current = {
          atMs: performanceStartRef.current,
          frames: 0,
        };
        inferenceSampleRef.current = {
          atMs: performanceStartRef.current,
          frames: 0,
          confidenceTotal: 0,
        };
      } catch {
        if (!cancelled) {
          setClockError(true);
          onClockFailure("start");
        }
        return;
      }

      const applyTrackingObservation = (
        observation: MovementObservation,
        timestampMs: number,
        elapsed: number,
      ) => {
        lastObservationRef.current = observation;
        setLiveObservation((current) => {
          if (
            current.kind === observation.kind &&
            (current.kind !== "movement" ||
              (observation.kind === "movement" &&
                current.cue === observation.cue)) &&
            (current.kind !== "unscoreable" ||
              (observation.kind === "unscoreable" &&
                current.reason === observation.reason))
          ) {
            return current;
          }
          return observation;
        });
        if (debugEnabled) {
          setDetectedAction(
            observation.kind === "movement"
              ? observation.cue
              : observation.kind,
          );
        }
        movementCaptureRef.current = updateMovementCaptureLatch(
          movementCaptureRef.current,
          observation,
          elapsed,
        );

        if (observation.kind === "unscoreable") {
          setTrackingIssue(observation.reason);
          const seatedNoHands =
            mode === "seated" && observation.reason === "missing-landmarks";
          if (seatedNoHands) {
            trackingLostAtRef.current = null;
            if (playbackRef.current === "tracking-lost") {
              onTrackingRecovered();
            }
            return;
          }
          trackingLostAtRef.current ??= timestampMs;
          if (
            timestampMs - trackingLostAtRef.current >= 1_200 &&
            playbackRef.current === "running"
          ) {
            onTrackingLost();
          }
          return;
        }

        setTrackingIssue(null);
        trackingLostAtRef.current = null;
        if (playbackRef.current === "tracking-lost") {
          onTrackingRecovered();
        }
      };

      const tick = (timestampMs: number) => {
        if (cancelled || completedRef.current) {
          return;
        }
        const elapsed = clock.elapsedMs();
        renderSampleRef.current.frames += 1;
        performanceEvidence?.recordRender({
          timestampMs,
          audioElapsedMs: elapsed,
          active: playbackRef.current !== "paused",
        });

        if (timestampMs - lastUiUpdate >= 100) {
          lastUiUpdate = timestampMs;
          setElapsedMs(elapsed);
        }

        if (
          source === "camera" &&
          playbackRef.current !== "paused" &&
          videoRef.current !== null &&
          videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          shouldRunCameraInference(
            timestampMs,
            lastInferenceAtRef.current,
          )
        ) {
          lastInferenceAtRef.current = timestampMs;
          const inferenceStartedAtMs = performance.now();
          const frame = detector.detect(videoRef.current, timestampMs);
          const inferenceDurationMs =
            performance.now() - inferenceStartedAtMs;
          const observation =
            frame.kind === "hands"
              ? classifySeated(frame)
              : calibration === null
                ? {
                  kind: "unscoreable" as const,
                  reason: "missing-landmarks" as const,
                }
                : classifyStanding(frame, calibration);
          applyTrackingObservation(observation, timestampMs, elapsed);
          performanceEvidence?.recordInference({
            durationMs: inferenceDurationMs,
            confidence: frameConfidence(frame),
            observation,
          });
          inferenceSampleRef.current.frames += 1;
          inferenceSampleRef.current.confidenceTotal +=
            frameConfidence(frame);
        }

        if (
          source === "synthetic" &&
          syntheticTrackingScenario === "tracking-loss" &&
          playbackRef.current !== "paused"
        ) {
          const observation = replaySyntheticTrackingObservation(
            mode,
            syntheticTrackingScenario,
            elapsed,
          );
          syntheticTrackingFaultRef.current =
            observation.kind === "unscoreable";
          applyTrackingObservation(observation, timestampMs, elapsed);
        }

        if (
          debugEnabled &&
          timestampMs - renderSampleRef.current.atMs >= 500
        ) {
          const renderWindowMs =
            timestampMs - renderSampleRef.current.atMs;
          const inferenceWindowMs =
            timestampMs - inferenceSampleRef.current.atMs;
          setDebugMetrics({
            renderRate:
              (renderSampleRef.current.frames * 1_000) / renderWindowMs,
            inferenceRate:
              inferenceWindowMs === 0
                ? 0
                : (inferenceSampleRef.current.frames * 1_000) /
                inferenceWindowMs,
            audioOffsetMs:
              elapsed - (timestampMs - performanceStartRef.current),
            confidence:
              inferenceSampleRef.current.frames === 0
                ? source === "synthetic"
                  ? 1
                  : 0
                : inferenceSampleRef.current.confidenceTotal /
                inferenceSampleRef.current.frames,
          });
          renderSampleRef.current = { atMs: timestampMs, frames: 0 };
          inferenceSampleRef.current = {
            atMs: timestampMs,
            frames: 0,
            confidenceTotal: 0,
          };
        }

        chart.cues.forEach((cue, index) => {
          if (
            elapsed >= cue.atMs + 320 &&
            !attemptedIdsRef.current.has(cue.id)
          ) {
            const observation =
              source === "synthetic"
                ? syntheticTrackingFaultRef.current
                  ? lastObservationRef.current
                  : replaySyntheticObservation(
                    mode,
                    cue.expected,
                    index,
                    elapsed,
                  )
                : observationForCue(
                  lastObservationRef.current,
                  movementCaptureRef.current.latest,
                  cue.atMs,
                );
            const syntheticOffsets = [120, 340, -180, 520] as const;
            const detectedMovement = movementCaptureRef.current.latest;
            const timingOffset =
              source === "synthetic"
                ? syntheticOffsets[index % syntheticOffsets.length] ?? 0
                : cue.expected === null
                  ? 0
                  : detectedMovement !== null &&
                    observation.kind === "movement" &&
                    detectedMovement.cue === observation.cue
                    ? detectedMovement.atMs - cue.atMs
                    : null;
            const attempt = observationToAttempt(
              cue,
              observation,
              timingOffset,
            );
            if (source === "camera") {
              movementCaptureRef.current = {
                ...movementCaptureRef.current,
                latest: null,
              };
            }
            attemptedIdsRef.current.add(cue.id);
            if (cue.section === "warmup") {
              setFeedback(
                !attempt.scoreable
                  ? isChinese
                    ? "不计分"
                    : "Not scored"
                  : isChinese
                    ? "准备"
                    : "Ready",
              );
              return;
            }
            attemptsRef.current.push(attempt);
            onAttemptsChange([...attemptsRef.current]);
            const scoreableCount = attemptsRef.current.filter(
              (item) => item.scoreable,
            ).length;
            if (debugEnabled) {
              setDetectedAction(
                observation.kind === "movement"
                  ? observation.cue
                  : observation.kind,
              );
              setProvisionalValid(
                scoreableCount / attemptsRef.current.length >= 0.8,
              );
            }
            if (
              scoreableCount - lastAdaptationAtRef.current >= 5
            ) {
              setCueSupport((current) => {
                const next = adaptCueSupport(
                  current,
                  attemptsRef.current,
                );
                if (next !== current) {
                  lastAdaptationAtRef.current = scoreableCount;
                }
                return next;
              });
            }
            const outcome = outcomeForAttempt(attempt);
            if (outcome === "good" || outcome === "nearly") {
              clock.playCorrectCue();
            } else if (outcome === "next") {
              clock.playIncorrectCue();
            }
            setJudgment({ outcome, atMs: elapsed });
            setFeedback(
              outcome === "unscoreable"
                ? isChinese
                  ? "不计分"
                  : "Not scored"
                : outcome === "good"
                  ? isChinese
                    ? "很好"
                    : "Good"
                  : outcome === "nearly"
                    ? isChinese
                      ? "差一点"
                      : "Nearly"
                    : isChinese
                      ? "下一个"
                      : "Next",
            );
          }
        });

        if (elapsed >= chart.durationMs) {
          completedRef.current = true;
          onComplete(
            attemptsRef.current,
            performanceEvidence?.finish() ?? null,
          );
          return;
        }
        animationFrame = requestAnimationFrame(tick);
      };
      animationFrame = requestAnimationFrame(tick);
    };

    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      void clock.stop();
    };
  }, [
    calibration,
    camera,
    chart,
    clock,
    detector,
    debugEnabled,
    isChinese,
    mode,
    onClockFailure,
    onAttemptsChange,
    onComplete,
    onTrackingLost,
    onTrackingRecovered,
    source,
    syntheticTrackingScenario,
  ]);

  const togglePause = async () => {
    try {
      if (playback === "paused") {
        restorePauseFocusRef.current = true;
        await clock.resume();
        onResume();
        return;
      }
      await clock.pause();
      onPause();
    } catch {
      onClockFailure("runtime");
    }
  };

  const trapPauseDialogFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }
    const focusable = Array.from(
      pauseDialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled)",
      ) ?? [],
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (first === undefined || last === undefined) {
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const progress = Math.min(1, elapsedMs / chart.durationMs);
  const currentSection =
    visibleCue?.section ?? runwayCues[0]?.section ?? "warmup";
  const playerState = livePlayerState(language, mode, liveObservation);
  const remainingSeconds = Math.ceil(
    Math.max(0, chart.durationMs - elapsedMs) / 1_000,
  );
  return (
    <main
      className="gameplay-screen"
      data-playback={playback}
    >
      <section
        className="gameplay-stage"
        aria-label={isChinese ? "舞步游戏区" : "Dance playfield"}
        data-gameplay-stage
      >
        {song.mv === undefined ? null : (
          <GameplayMusicVideo
            elapsedMs={elapsedMs}
            playback={playback}
            poster={song.mv.poster}
            reducedMotion={reducedMotion}
            src={song.mv.src}
          />
        )}
        <div className="gameplay-stage__shade" aria-hidden="true" />
        <GameplayPlayerStatePanel
          language={language}
          mode={mode}
          playerState={playerState}
          source={source}
          trackingIssue={trackingIssue}
          videoRef={videoRef}
        />
        <header className="gameplay-now">
          <div className="gameplay-current-cue">
            <span aria-hidden="true" className="gameplay-current-cue__symbol">
              {visibleCue === undefined
                ? "◆"
                : visibleCue.expected === null
                  ? "●"
                  : CUE_SYMBOLS[visibleCue.expected]}
            </span>
            <h1>
              {visibleCue === undefined
                ? isChinese
                  ? "准备"
                  : "Ready"
                : cueLabel(language, visibleCue.expected)}
            </h1>
          </div>
          {playback === "running" ? (
            <Button
              className="gameplay-pause"
              onClick={() => void togglePause()}
              variant="secondary"
            >
              {isChinese ? "暂停" : "Pause"}
            </Button>
          ) : null}
        </header>
        <section
          aria-label={isChinese ? "接下来的动作" : "Upcoming moves"}
          className="move-runway"
          data-move-runway
        >
          <div className="move-runway__track" aria-hidden="true">
            <svg
              className="move-runway__lines"
              preserveAspectRatio="none"
              viewBox="0 0 1000 700"
            >
              <path d="M360 0 L20 700" />
              <path d="M430 0 L260 700" />
              <path d="M500 0 L500 700" />
              <path d="M570 0 L740 700" />
              <path d="M640 0 L980 700" />
            </svg>
            <div className="move-runway__hit-line" />
            {judgment !== null && elapsedMs - judgment.atMs < 900 ? (
              <p
                className="judgment-banner"
                data-outcome={judgment.outcome}
                key={judgment.atMs}
              >
                {judgment.outcome === "good"
                  ? isChinese
                    ? "很好"
                    : "Good"
                  : judgment.outcome === "nearly"
                    ? isChinese
                      ? "差一点"
                      : "Nearly"
                    : judgment.outcome === "next"
                      ? isChinese
                        ? "看下一个"
                        : "Next one"
                      : isChinese
                        ? "不计分"
                        : "Not scored"}
              </p>
            ) : null}
            {runwayCues.map((cue) => {
              const lane =
                cue.expected === null ? "hold" : CUE_LANES[cue.expected];
              const cueView = cueRunwayView(
                cue.atMs,
                elapsedMs,
                runwayLookaheadMs,
                reducedMotion,
              );
              const isCurrent = cueView.timingStage === "now";
              return (
                <div
                  className={`move-note move-note--lane-${lane}`}
                  data-current={isCurrent ? "true" : "false"}
                  data-move-note
                  data-timing-stage={cueView.timingStage}
                  key={cue.id}
                  style={cueRunwayStyle(
                    cue,
                    elapsedMs,
                    runwayLookaheadMs,
                    reducedMotion,
                  )}
                >
                  <span className="move-note__symbol">
                    {cue.expected === null ? (
                      <span aria-hidden="true" className="move-note__lantern" />
                    ) : (
                      CUE_SYMBOLS[cue.expected]
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <ol className="visually-hidden">
            {runwayCues.map((cue, index) => (
              <li key={cue.id}>
                {isChinese ? `第 ${index + 1} 个：` : `Next ${index + 1}: `}
                {cueLabel(language, cue.expected)}
              </li>
            ))}
          </ol>
        </section>
        <div className="gameplay-feedback" aria-live="polite">
          {feedback}
        </div>
        <GameplayPhaseRail
          currentSection={currentSection}
          language={language}
          progress={progress}
          remainingSeconds={remainingSeconds}
        />
        {playback === "tracking-lost" ? (
          <div className="tracking-overlay" role="status">
            <b>{isChinese ? "不计分" : "Not scored"}</b>
            <strong>
              {isChinese
                ? trackingIssue === "multiple-people"
                  ? "只留一位玩家"
                  : "回到中间"
                : trackingIssue === "multiple-people"
                  ? "One player only"
                  : "Return to centre"}
            </strong>
            <Button
              className="gameplay-pause"
              onClick={() => void togglePause()}
              variant="secondary"
            >
              {isChinese ? "暂停" : "Pause"}
            </Button>
          </div>
        ) : null}
        {playback === "paused" ? (
          <div
            aria-label={isChinese ? "暂停与舒适度设置" : "Pause and comfort settings"}
            aria-modal="true"
            className="pause-overlay"
            onKeyDown={trapPauseDialogFocus}
            ref={pauseDialogRef}
            role="dialog"
          >
            <div className="pause-overlay__heading">
              <span>{isChinese ? "休息一下" : "TAKE A BREATH"}</span>
              <strong>{isChinese ? "已暂停" : "Paused"}</strong>
            </div>
            <Button
              className="pause-overlay__resume"
              onClick={() => void togglePause()}
              variant="primary"
            >
              {isChinese ? "继续游戏" : "Resume game"}
            </Button>
            <div className="pause-overlay__comfort">
              <Button
                disabled={cueSupport === 2}
                onClick={() => {
                  setCueSupport((current) => makeCueSupportGentler(current));
                }}
                variant="quiet"
              >
                {cueSupport === 2
                  ? isChinese
                    ? "已是最温和"
                    : "Gentlest cues on"
                  : isChinese
                    ? "提示更温和"
                    : "Gentler cues"}
              </Button>
              <label className="voice-guidance-toggle">
                <input
                  checked={voiceGuidance}
                  onChange={(event) => {
                    setVoiceGuidance(event.currentTarget.checked);
                  }}
                  type="checkbox"
                />
                <span>
                  {isChinese ? "朗读固定动作提示" : "Speak fixed cue captions"}
                </span>
              </label>
              <label>
                <span>{isChinese ? "音乐音量" : "Music volume"}</span>
                <input
                  max="1"
                  min="0"
                  onChange={(event) => {
                    const value = Number(event.currentTarget.value);
                    setMusicVolume(value);
                    clock.setMusicVolume(value);
                  }}
                  step="0.1"
                  type="range"
                  value={musicVolume}
                />
              </label>
              <label>
                <span>{isChinese ? "提示音量" : "Cue volume"}</span>
                <input
                  max="1"
                  min="0"
                  onChange={(event) => {
                    const value = Number(event.currentTarget.value);
                    setCueVolume(value);
                    clock.setCueVolume(value);
                  }}
                  step="0.1"
                  type="range"
                  value={cueVolume}
                />
              </label>
            </div>
          </div>
        ) : null}
        {debugEnabled ? (
          <dl className="debug-panel" data-testid="local-debug-panel">
            <div>
              <dt>render</dt>
              <dd>{debugMetrics.renderRate.toFixed(1)} fps</dd>
            </div>
            <div>
              <dt>inference</dt>
              <dd>{debugMetrics.inferenceRate.toFixed(1)} fps</dd>
            </div>
            <div>
              <dt>audio offset</dt>
              <dd>{debugMetrics.audioOffsetMs.toFixed(0)} ms</dd>
            </div>
            <div>
              <dt>landmark confidence</dt>
              <dd>{Math.round(debugMetrics.confidence * 100)}%</dd>
            </div>
            <div>
              <dt>quality gate</dt>
              <dd>{trackingIssue ?? "scoreable"}</dd>
            </div>
            <div>
              <dt>cue / detected</dt>
              <dd>
                {visibleCue?.expected ?? "hold"} /{" "}
                {detectedAction}
              </dd>
            </div>
            <div>
              <dt>provisional validity</dt>
              <dd>{provisionalValid ? "valid" : "insufficient"}</dd>
            </div>
            <div>
              <dt>versions</dt>
              <dd>
                classifier {MOVEMENT_CLASSIFIER_VERSION} · score 1 · quality 1
                · chart {chart.version}
              </dd>
            </div>
          </dl>
        ) : null}
        {clockError ? (
          <div className="status-message status-message--error" role="alert">
            {isChinese
              ? "音频时钟没有启动，本局不会写入个人趋势。"
              : "The audio clock did not start. This session will not enter a personal trend."}
          </div>
        ) : null}
      </section>
    </main>
  );
}
