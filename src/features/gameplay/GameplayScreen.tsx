import { useEffect, useMemo, useRef, useState } from "react";

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
import { frameConfidence } from "../../domain/movement/landmarks";
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
  type CueAttempt,
} from "../../domain/scoring/session-score";
import {
  adaptCueSupport,
  CUE_PREVIEW_MS,
  makeCueSupportGentler,
  type CueSupportLevel,
} from "../../domain/gameplay/adaptive-support";
import { Button } from "../../ui/primitives/Button";

type TrackingIssue = Extract<
  MovementObservation,
  { readonly kind: "unscoreable" }
>["reason"];

interface GameplayScreenProps {
  readonly language: Language;
  readonly mode: SessionMode;
  readonly source: InputSource;
  readonly chart: SessionChart;
  readonly camera: BrowserCamera;
  readonly detector: MediaPipeLandmarkDetector;
  readonly calibration: StandingCalibration | null;
  readonly clock: SessionClock;
  readonly playback: "running" | "paused" | "tracking-lost";
  readonly syntheticTrackingScenario: SyntheticTrackingScenario;
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

const SECTION_LABELS = {
  warmup: ["热身与画面检查", "WARM-UP & QUALITY"],
  follow: ["跟随引导", "FOLLOW THE GUIDE"],
  rhythm: ["跟着节拍", "MOVE TO THE BEAT"],
  memory: ["灯笼记忆", "LANTERN MEMORY"],
} as const;

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
  camera,
  detector,
  calibration,
  clock,
  playback,
  syntheticTrackingScenario,
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
  const lastDetectedMovementRef = useRef<{
    readonly cue: MovementCue;
    readonly atMs: number;
  } | null>(null);
  const lastAdaptationAtRef = useRef(0);
  const completedRef = useRef(false);
  const trackingLostAtRef = useRef<number | null>(null);
  const lastInferenceAtRef = useRef<number | null>(null);
  const syntheticTrackingFaultRef = useRef(false);
  const playbackRef = useRef(playback);
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
  const [provisionalValid, setProvisionalValid] = useState(false);
  const [feedback, setFeedback] = useState(
    language === "zh" ? "跟着灯笼来" : "Follow the lantern",
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

  useEffect(() => {
    playbackRef.current = playback;
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
        const previousObservation = lastObservationRef.current;
        lastObservationRef.current = observation;
        if (debugEnabled) {
          setDetectedAction(
            observation.kind === "movement"
              ? observation.cue
              : observation.kind,
          );
        }
        if (
          observation.kind === "movement" &&
          (previousObservation.kind !== "movement" ||
            previousObservation.cue !== observation.cue)
        ) {
          lastDetectedMovementRef.current = {
            cue: observation.cue,
            atMs: elapsed,
          };
        }

        if (observation.kind === "unscoreable") {
          setTrackingIssue(observation.reason);
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
                : lastObservationRef.current;
            const syntheticOffsets = [120, 340, -180, 520] as const;
            const detectedMovement = lastDetectedMovementRef.current;
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
            attemptedIdsRef.current.add(cue.id);
            if (cue.section === "warmup") {
              setFeedback(
                !attempt.scoreable
                  ? isChinese
                    ? "热身画面暂时不清楚，不计分"
                    : "Warm-up tracking is unclear — not scored"
                  : isChinese
                    ? "画面清楚，继续热身"
                    : "Tracking looks clear — keep warming up",
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
            setFeedback(
              outcome === "unscoreable"
                ? isChinese
                  ? "暂时看不清，这一下不计分"
                  : "Tracking unclear — this cue will not score"
                : outcome === "good"
                  ? isChinese
                    ? "很好"
                    : "Good"
                  : outcome === "nearly"
                    ? isChinese
                      ? "差一点，很接近"
                      : "Nearly — very close"
                  : isChinese
                    ? "没关系，看下一个"
                    : "Try the next one",
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

  const progress = Math.min(1, elapsedMs / chart.durationMs);
  const currentSection = visibleCue?.section ?? "warmup";
  return (
    <main className="gameplay-screen">
      <section
        className="gameplay-stage"
        aria-label="Dance playfield"
        data-gameplay-stage
      >
        {source === "camera" ? (
          <video
            aria-label={isChinese ? "当前摄像头画面" : "Current camera view"}
            autoPlay
            data-camera-preview
            muted
            playsInline
            ref={videoRef}
          />
        ) : (
          <div className="gameplay-stage__paper" aria-hidden="true" />
        )}
        <div className="gameplay-stage__shade" aria-hidden="true" />
        <div className="lantern-target" aria-hidden="true">
          <span />
        </div>
        {visibleCue === undefined ? (
          <p className="cue-title">{isChinese ? "准备下一个" : "Next cue"}</p>
        ) : (
          <div
            className={`approaching-cue approaching-cue--${visibleCue.expected ?? "hold"}`}
            key={visibleCue.id}
            style={{ animationDuration: `${cuePreviewMs}ms` }}
          >
            <span aria-hidden="true" />
            <strong>{cueLabel(language, visibleCue.expected)}</strong>
          </div>
        )}
        <div className="gameplay-feedback" aria-live="polite">
          {feedback}
        </div>
        {playback === "tracking-lost" ? (
          <div className="tracking-overlay" role="status">
            <strong>
              {isChinese ? "暂时看不清动作" : "Tracking is unclear"}
            </strong>
            <span>
              {isChinese
                ? trackingIssue === "multiple-people"
                  ? "请让主要玩家留在轮廓内，朋友站到边界外；这段不计分。"
                  : "回到轮廓里、增加正面光线；这段不会算错。"
                : trackingIssue === "multiple-people"
                  ? "Keep the primary player inside and friends outside the boundary. This segment is not scored."
                  : "Return to the outline and add front light. This part will not count as a miss."}
            </span>
          </div>
        ) : null}
        {playback === "paused" ? (
          <div className="tracking-overlay" role="status">
            <strong>{isChinese ? "已暂停" : "Paused"}</strong>
            <span>
              {isChinese
                ? "准备好后继续。"
                : "Continue when you are ready."}
            </span>
          </div>
        ) : null}
      </section>
      <aside className="gameplay-hud" data-gameplay-hud>
        <p className="eyebrow">
          {SECTION_LABELS[currentSection][isChinese ? 0 : 1]}
        </p>
        <h1>{visibleCue === undefined ? "—" : cueLabel(language, visibleCue.expected)}</h1>
        <label>
          <span>{isChinese ? "本局进度" : "Session progress"}</span>
          <progress max={1} value={progress} />
        </label>
        <dl>
          <div>
            <dt>{isChinese ? "模式" : "MODE"}</dt>
            <dd>
              {mode === "standing"
                ? isChinese
                  ? "站立舞步"
                  : "STANDING"
                : isChinese
                  ? "坐姿手势"
                  : "SEATED"}
            </dd>
          </div>
          <div>
            <dt>{isChinese ? "输入" : "INPUT"}</dt>
            <dd>
              {source === "synthetic"
                ? isChinese
                  ? "模拟演示"
                  : "SIMULATED"
                : isChinese
                  ? "本机摄像头"
                  : "ON-DEVICE CAMERA"}
            </dd>
          </div>
          <div>
            <dt>{isChinese ? "时间" : "TIME"}</dt>
            <dd>
              {Math.ceil(Math.max(0, chart.durationMs - elapsedMs) / 1000)} s
            </dd>
          </div>
        </dl>
        <Button onClick={() => void togglePause()} variant="secondary">
          {playback === "paused"
            ? isChinese
              ? "继续"
              : "Resume"
            : isChinese
              ? "暂停"
              : "Pause"}
        </Button>
        <Button
          onClick={() => {
            setCueSupport((current) => makeCueSupportGentler(current));
          }}
          variant="quiet"
        >
          {isChinese ? "让提示更温和" : "Make it gentler"}
        </Button>
        <div className="volume-controls">
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
              <dd>pose 1 · score 1 · quality 1 · chart {chart.version}</dd>
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
      </aside>
    </main>
  );
}
