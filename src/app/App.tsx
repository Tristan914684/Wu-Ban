import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { AcceleratedSessionClock } from "../adapters/audio/accelerated-session-clock";
import { BrowserSessionClock } from "../adapters/audio/browser-session-clock";
import { BrowserCamera, type CameraFailure } from "../adapters/camera/browser-camera";
import { UnavailableCheckInNotification } from "../adapters/notifications/unavailable-check-in-notification";
import { MediaPipeLandmarkDetector } from "../adapters/pose/mediapipe-landmark-detector";
import { IndexedDbSessionRepository } from "../adapters/storage/indexeddb-session-repository";
import { IndexedDbSharingRepository } from "../adapters/storage/indexeddb-sharing-repository";
import { createCameraEvidenceReport } from "../application/performance/camera-evidence-report";
import type { DevicePerformanceEvidenceReport } from "../application/performance/device-performance-evidence";
import type { SessionClock } from "../application/ports/session-clock";
import { createSessionSummary } from "../application/session/create-session-summary";
import { sendCheckIn } from "../application/sharing/send-check-in";
import {
  initialSessionState,
  reduceSession,
} from "../application/session/session-machine";
import type { Language } from "../content/copy";
import { createSessionChart } from "../domain/chart/session-chart";
import type { CueAttempt } from "../domain/scoring/session-score";
import type { SessionSummary } from "../domain/session/session-summary";
import { sessionsThisWeek } from "../domain/session/weekly-participation";
import type { StandingCalibration } from "../domain/movement/standing-classifier";
import type { SyntheticTrackingScenario } from "../domain/movement/synthetic-trace";
import {
  createSupporterGrant,
  revokeSupporterGrant,
  type SupporterGrant,
} from "../domain/sharing/supporter-grant";
import { createSimulatedTrendHistory } from "../domain/trend/simulated-history";
import { evaluatePersonalTrend } from "../domain/trend/personal-trend";
import { CalibrationScreen } from "../features/calibration/CalibrationScreen";
import { CooldownScreen } from "../features/gameplay/CooldownScreen";
import { CountdownScreen } from "../features/gameplay/CountdownScreen";
import { AudioRecoveryScreen } from "../features/gameplay/AudioRecoveryScreen";
import { GameplayScreen } from "../features/gameplay/GameplayScreen";
import { TutorialScreen } from "../features/gameplay/TutorialScreen";
import { DisclosureScreen } from "../features/onboarding/DisclosureScreen";
import { ModeScreen } from "../features/onboarding/ModeScreen";
import { PermissionScreen } from "../features/onboarding/PermissionScreen";
import { SafetyScreen } from "../features/onboarding/SafetyScreen";
import { WelcomeScreen } from "../features/onboarding/WelcomeScreen";
import { ProgressScreen } from "../features/progress/ProgressScreen";
import { CompletingScreen } from "../features/results/CompletingScreen";
import { ResultScreen } from "../features/results/ResultScreen";
import { SharingScreen } from "../features/sharing/SharingScreen";
import { AppChrome } from "../ui/components/AppChrome";
import type { LocalDataStatus } from "../ui/components/LocalDataNotice";

type IdleView = "home" | "progress" | "sharing";
type ClockRecoveryPoint =
  | "TUTORIAL_COMPLETE"
  | "RETURNING_CALIBRATED"
  | "PLAY_START";
const REDUCED_MOTION_KEY = "wuban-reduced-motion";
const LANGUAGE_KEY = "wuban-language";

function createSessionId(): string {
  return globalThis.crypto.randomUUID();
}

function combineLocalDataStatus(
  ...statuses: readonly LocalDataStatus[]
): LocalDataStatus {
  if (statuses.includes("unavailable")) {
    return "unavailable";
  }
  return statuses.includes("loading") ? "loading" : "ready";
}

function initialReducedMotion(): boolean {
  try {
    const stored = window.localStorage.getItem(REDUCED_MOTION_KEY);
    if (stored === "true" || stored === "false") {
      return stored === "true";
    }
  } catch {
    // Storage can be unavailable in hardened/private contexts.
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initialLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_KEY);
    if (stored === "zh" || stored === "en") {
      return stored;
    }
  } catch {
    // Storage can be unavailable in hardened/private contexts.
  }
  return "zh";
}

export function App() {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [reducedMotion, setReducedMotion] = useState(initialReducedMotion);
  const [state, dispatch] = useReducer(
    reduceSession,
    undefined,
    () => initialSessionState(createSessionId()),
  );
  const [idleView, setIdleView] = useState<IdleView>("home");
  const [history, setHistory] = useState<readonly SessionSummary[]>([]);
  const [historyStatus, setHistoryStatus] =
    useState<LocalDataStatus>("loading");
  const [trendMode, setTrendMode] = useState<"standing" | "seated">(
    "standing",
  );
  const [showSimulatedTrend, setShowSimulatedTrend] = useState(false);
  const [grant, setGrant] = useState<SupporterGrant | null>(null);
  const [sharingStatus, setSharingStatus] =
    useState<LocalDataStatus>("loading");
  const [calibration, setCalibration] = useState<StandingCalibration | null>(
    null,
  );
  const [attempts, setAttempts] = useState<readonly CueAttempt[]>([]);
  const [performanceEvidence, setPerformanceEvidence] =
    useState<DevicePerformanceEvidenceReport | null>(null);
  const [clockHealthy, setClockHealthy] = useState(true);
  const [contextConfounder, setContextConfounder] = useState(false);
  const [camera] = useState(() => new BrowserCamera());
  const [detector] = useState(() => new MediaPipeLandmarkDetector());
  const [repository] = useState(() => new IndexedDbSessionRepository());
  const [sharingRepository] = useState(
    () => new IndexedDbSharingRepository(),
  );
  const [notification] = useState(
    () => new UnavailableCheckInNotification(),
  );
  const [clock, setClock] = useState<SessionClock | null>(null);
  const [clockRecovery, setClockRecovery] =
    useState<ClockRecoveryPoint | null>(null);
  const [audioPreparing, setAudioPreparing] = useState(false);
  const [silentPractice, setSilentPractice] = useState(false);
  const clockPreparationAttempt = useRef(0);
  const query = new URLSearchParams(window.location.search);
  const fastSynthetic = query.get("fast") === "1";
  const syntheticTrackingScenario: SyntheticTrackingScenario =
    fastSynthetic && query.get("scenario") === "tracking-loss"
      ? "tracking-loss"
      : "standard";
  const compactGameplayBlocked = [
    "safety",
    "calibrating",
    "tutorial",
    "countdown",
    "playing",
    "cooldown",
    "completing",
  ].includes(state.phase);

  const changeReducedMotion = useCallback((enabled: boolean) => {
    setReducedMotion(enabled);
    try {
      window.localStorage.setItem(REDUCED_MOTION_KEY, String(enabled));
    } catch {
      // The current view still honors the choice when storage is unavailable.
    }
  }, []);

  const changeLanguage = useCallback((nextLanguage: Language) => {
    setLanguage(nextLanguage);
    try {
      window.localStorage.setItem(LANGUAGE_KEY, nextLanguage);
    } catch {
      // The current view still honors the choice when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const chart = useMemo(
    () =>
      state.mode === null
        ? null
        : createSessionChart(state.mode, {
            accelerated: state.source === "synthetic" && fastSynthetic,
          }),
    [fastSynthetic, state.mode, state.source],
  );

  const trendReport = useMemo(
    () =>
      evaluatePersonalTrend(
        showSimulatedTrend
          ? createSimulatedTrendHistory(trendMode)
          : history,
        {
          mode: trendMode,
          simulated: showSimulatedTrend,
        },
      ),
    [history, showSimulatedTrend, trendMode],
  );
  const weeklyParticipation = useMemo(
    () => sessionsThisWeek(history),
    [history],
  );
  const capturedHistory = useMemo(
    () => history.filter((summary) => !summary.simulated),
    [history],
  );
  const returningPlayer = capturedHistory.length > 0;
  const preferredMode = capturedHistory[0]?.mode ?? "standing";
  const debugCameraEvidenceEnabled =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get("debug") === "1";

  const refreshHistory = useCallback(async () => {
    setHistoryStatus("loading");
    try {
      const summaries = await repository.list();
      setHistory(summaries);
      setHistoryStatus("ready");
    } catch {
      setHistoryStatus("unavailable");
    }
  }, [repository]);

  const refreshSharing = useCallback(async () => {
    setSharingStatus("loading");
    try {
      setGrant(await sharingRepository.latestGrant());
      setSharingStatus("ready");
    } catch {
      setSharingStatus("unavailable");
    }
  }, [sharingRepository]);

  useEffect(() => {
    // IndexedDB is an external store; hydrate its count after the first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    // IndexedDB is an external store; hydrate the latest sharing grant.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshSharing();
  }, [refreshSharing]);

  useEffect(() => {
    return () => {
      camera.stop();
      detector.close();
    };
  }, [camera, detector]);

  useEffect(() => {
    return () => {
      void clock?.dispose();
    };
  }, [clock]);

  const stopSession = useCallback(() => {
    const shouldPersistInterrupted =
      state.phase === "playing" || state.phase === "cooldown";
    const interruptedSummary =
      shouldPersistInterrupted &&
      state.mode !== null &&
      state.source !== null &&
      chart !== null
        ? createSessionSummary({
            sessionId: state.sessionId,
            endedAt: new Date().toISOString(),
            mode: state.mode,
            chart,
            source: state.source,
            attempts,
            completed: false,
            clockHealthy,
            contextConfounder,
          })
        : null;

    camera.stop();
    detector.close();
    clockPreparationAttempt.current += 1;
    void clock?.dispose();
    setClock(null);
    setClockRecovery(null);
    setAudioPreparing(false);
    setSilentPractice(false);
    setAttempts([]);
    setPerformanceEvidence(null);
    setCalibration(null);
    setClockHealthy(true);
    setContextConfounder(false);
    setIdleView("home");
    dispatch({ type: "STOP", nextSessionId: createSessionId() });
    if (interruptedSummary !== null) {
      void repository
        .save(interruptedSummary)
        .then(refreshHistory)
        .catch(() => {
          setHistoryStatus("unavailable");
        });
    }
  }, [
    attempts,
    camera,
    chart,
    clock,
    clockHealthy,
    contextConfounder,
    detector,
    refreshHistory,
    repository,
    state.mode,
    state.phase,
    state.sessionId,
    state.source,
  ]);

  const requestCamera = useCallback(async (): Promise<CameraFailure | null> => {
    const result = await camera.request(true);
    if (result.kind === "ready") {
      dispatch({ type: "CAMERA_READY" });
      return null;
    }
    return result.failure;
  }, [camera]);

  const prepareClock = useCallback(
    async (nextEvent: ClockRecoveryPoint) => {
      if (audioPreparing) {
        return;
      }
      const preparationAttempt = clockPreparationAttempt.current + 1;
      clockPreparationAttempt.current = preparationAttempt;
      setAudioPreparing(true);
      const accelerated = state.source === "synthetic" && fastSynthetic;
      const nextClock: SessionClock = accelerated
        ? new AcceleratedSessionClock(
            syntheticTrackingScenario === "tracking-loss" ? 2 : 12,
          )
        : new BrowserSessionClock();
      try {
        await nextClock.prepare();
        if (clockPreparationAttempt.current !== preparationAttempt) {
          await nextClock.dispose();
          return;
        }
        setClock(nextClock);
        setClockHealthy(true);
        setSilentPractice(false);
        setClockRecovery(null);
        if (nextEvent !== "PLAY_START") {
          dispatch({ type: nextEvent });
        }
      } catch {
        await nextClock.dispose();
        if (clockPreparationAttempt.current === preparationAttempt) {
          setClock(null);
          setClockRecovery(nextEvent);
        }
      } finally {
        if (clockPreparationAttempt.current === preparationAttempt) {
          setAudioPreparing(false);
        }
      }
    },
    [
      audioPreparing,
      fastSynthetic,
      state.source,
      syntheticTrackingScenario,
    ],
  );

  const continueWithoutAudio = useCallback(async () => {
    if (clockRecovery === null || audioPreparing) {
      return;
    }
    clockPreparationAttempt.current += 1;
    setAudioPreparing(true);
    const fallback = new AcceleratedSessionClock(1);
    await fallback.prepare();
    setClock(fallback);
    setClockHealthy(false);
    setSilentPractice(true);
    const nextEvent = clockRecovery;
    setClockRecovery(null);
    setAudioPreparing(false);
    if (nextEvent !== "PLAY_START") {
      dispatch({ type: nextEvent });
    }
  }, [audioPreparing, clockRecovery]);

  const commitSummary = useCallback(async (): Promise<SessionSummary> => {
    if (state.mode === null || chart === null || state.source === null) {
      throw new Error("Cannot complete a session without mode, chart, and source.");
    }
    const summary = createSessionSummary({
      sessionId: state.sessionId,
      endedAt: new Date().toISOString(),
      mode: state.mode,
      chart,
      source: state.source,
      attempts,
      completed: true,
      clockHealthy,
      contextConfounder,
    });
    await repository.save(summary);
    return summary;
  }, [
    attempts,
    chart,
    clockHealthy,
    contextConfounder,
    repository,
    state.mode,
    state.sessionId,
    state.source,
  ]);

  const completeGameplay = useCallback(
    (
      completedAttempts: readonly CueAttempt[],
      completedPerformanceEvidence: DevicePerformanceEvidenceReport | null,
    ) => {
      setAttempts(completedAttempts);
      setPerformanceEvidence(completedPerformanceEvidence);
      dispatch({ type: "PLAY_COMPLETE" });
    },
    [],
  );
  const handleCommitted = useCallback(
    (summary: SessionSummary) => {
      camera.stop();
      detector.close();
      dispatch({ type: "SESSION_COMMITTED", summary });
      void refreshHistory();
    },
    [camera, detector, refreshHistory],
  );
  const markTrackingLost = useCallback(() => {
    dispatch({ type: "TRACKING_LOST" });
  }, []);
  const markTrackingRecovered = useCallback(() => {
    dispatch({ type: "TRACKING_RECOVERED" });
  }, []);
  const handleClockFailure = useCallback((point: "start" | "runtime") => {
    clockPreparationAttempt.current += 1;
    void clock?.dispose();
    setClock(null);
    if (point === "start") {
      setClockRecovery("PLAY_START");
      return;
    }
    setClockHealthy(false);
    dispatch({ type: "PLAY_COMPLETE" });
  }, [clock]);
  const clearHistory = useCallback(async () => {
    setHistoryStatus("loading");
    try {
      await repository.clear();
      setHistory([]);
      setHistoryStatus("ready");
    } catch {
      setHistoryStatus("unavailable");
    }
  }, [repository]);
  const grantSharing = useCallback(async () => {
    const next = createSupporterGrant({
      grantId: createSessionId(),
      supporterBindingId: "local-preview-supporter",
      grantedAt: new Date().toISOString(),
    });
    setSharingStatus("loading");
    try {
      await sharingRepository.saveGrant(next);
      setGrant(next);
      setSharingStatus("ready");
    } catch {
      setSharingStatus("unavailable");
    }
  }, [sharingRepository]);
  const revokeSharing = useCallback(async () => {
    if (grant === null) {
      return;
    }
    const revoked = revokeSupporterGrant(grant, new Date().toISOString());
    setSharingStatus("loading");
    try {
      await sharingRepository.saveGrant(revoked);
      setGrant(revoked);
      setSharingStatus("ready");
    } catch {
      setSharingStatus("unavailable");
    }
  }, [grant, sharingRepository]);
  const handleSendCheckIn = useCallback(
    async (message: string) => {
      try {
        return await sendCheckIn({
          report: trendReport,
          editedMessage: message,
          repository: sharingRepository,
          notification,
          attemptedAt: new Date().toISOString(),
        });
      } catch {
        setSharingStatus("unavailable");
        return { kind: "failed" as const, duplicate: false };
      }
    },
    [notification, sharingRepository, trendReport],
  );
  const visibleLocalDataStatus =
    idleView === "sharing"
      ? combineLocalDataStatus(historyStatus, sharingStatus)
      : historyStatus;
  const retryVisibleLocalData = useCallback(() => {
    if (idleView === "sharing") {
      void Promise.all([refreshHistory(), refreshSharing()]);
      return;
    }
    void refreshHistory();
  }, [idleView, refreshHistory, refreshSharing]);

  let screen;
  switch (state.phase) {
    case "idle":
      if (idleView === "progress") {
        screen = (
          <ProgressScreen
            excludedSimulatedCount={
              history.filter((summary) => summary.simulated).length
            }
            language={language}
            localDataStatus={visibleLocalDataStatus}
            weeklyParticipation={weeklyParticipation}
            onBack={() => {
              setIdleView("home");
            }}
            onModeChange={setTrendMode}
            onOpenSharing={() => {
              setIdleView("sharing");
            }}
            onRetryLocalData={retryVisibleLocalData}
            onToggleSimulation={() => {
              setShowSimulatedTrend((current) => !current);
            }}
            report={trendReport}
          />
        );
      } else if (idleView === "sharing") {
        screen = (
          <SharingScreen
            grant={grant}
            key={`${trendReport.eventId}:${language}`}
            language={language}
            localDataStatus={visibleLocalDataStatus}
            onBack={() => {
              setIdleView("progress");
            }}
            onDeleteHistory={clearHistory}
            onGrant={grantSharing}
            onRetryLocalData={retryVisibleLocalData}
            onRevoke={revokeSharing}
            onSend={handleSendCheckIn}
            report={trendReport}
            storedSummaries={history}
          />
        );
      } else {
        screen = (
          <WelcomeScreen
            historyCount={history.length}
            language={language}
            localDataStatus={visibleLocalDataStatus}
            onBegin={() => {
              dispatch(
                returningPlayer
                  ? {
                      type: "BEGIN_RETURNING",
                      mode: preferredMode,
                    }
                  : { type: "BEGIN" },
              );
            }}
            onClearHistory={clearHistory}
            onRetryLocalData={retryVisibleLocalData}
            onReviewProgress={() => {
              setIdleView("progress");
            }}
            preferredMode={preferredMode}
            returning={returningPlayer}
            weeklyParticipation={weeklyParticipation}
          />
        );
      }
      break;
    case "disclosure":
      screen = (
        <DisclosureScreen
          language={language}
          onAccept={() => {
            dispatch({ type: "DISCLOSURE_ACCEPTED" });
          }}
        />
      );
      break;
    case "permission":
      screen = (
        <PermissionScreen
          language={language}
          onRequestCamera={requestCamera}
          onUseSynthetic={() => {
            dispatch({ type: "USE_SYNTHETIC" });
          }}
          permissionError={state.permissionError}
        />
      );
      break;
    case "mode":
      screen = (
        <ModeScreen
          language={language}
          onChoose={(mode) => {
            dispatch({ type: "CHOOSE_MODE", mode });
          }}
        />
      );
      break;
    case "safety":
      screen =
        state.mode === null ? null : (
          <SafetyScreen
            language={language}
            mode={state.mode}
            onAccept={() => {
              dispatch({ type: "SAFETY_ACCEPTED" });
            }}
          />
        );
      break;
    case "calibrating":
      screen =
        state.mode === null || state.source === null ? null : (
          <CalibrationScreen
            camera={camera}
            detector={detector}
            language={language}
            mode={state.mode}
            onComplete={(nextCalibration) => {
              setCalibration(nextCalibration);
              if (state.returning) {
                void prepareClock("RETURNING_CALIBRATED");
              } else {
                dispatch({ type: "CALIBRATED" });
              }
            }}
            onUseSyntheticFallback={() => {
              camera.stop();
              detector.close();
              dispatch({ type: "USE_SYNTHETIC_FALLBACK" });
            }}
            source={state.source}
          />
        );
      break;
    case "tutorial":
      screen =
        state.mode === null || state.source === null ? null : (
          <TutorialScreen
            audioPreparing={audioPreparing}
            calibration={calibration}
            camera={camera}
            detector={detector}
            language={language}
            mode={state.mode}
            onStart={() => prepareClock("TUTORIAL_COMPLETE")}
            onSwitchToSeated={() => {
              setCalibration(null);
              detector.close();
              dispatch({ type: "SWITCH_MODE", mode: "seated" });
            }}
            source={state.source}
          />
        );
      break;
    case "countdown":
      screen = (
        <CountdownScreen
          language={language}
          onComplete={() => {
            dispatch({ type: "COUNTDOWN_COMPLETE" });
          }}
          reducedMotion={reducedMotion}
        />
      );
      break;
    case "playing":
      screen =
        state.mode === null ||
        state.source === null ||
        chart === null ||
        clock === null ? null : (
          <GameplayScreen
            calibration={calibration}
            camera={camera}
            chart={chart}
            clock={clock}
            detector={detector}
            language={language}
            mode={state.mode}
            onClockFailure={handleClockFailure}
            onComplete={completeGameplay}
            onAttemptsChange={setAttempts}
            onPause={() => {
              dispatch({ type: "PAUSE" });
            }}
            onResume={() => {
              dispatch({ type: "RESUME" });
            }}
            onTrackingLost={markTrackingLost}
            onTrackingRecovered={markTrackingRecovered}
            playback={state.playback}
            reducedMotion={reducedMotion}
            source={state.source}
            syntheticTrackingScenario={syntheticTrackingScenario}
          />
        );
      break;
    case "cooldown":
      screen = (
        <CooldownScreen
          language={language}
          onContinue={(reportedContextConfounder) => {
            setContextConfounder(reportedContextConfounder);
            dispatch({ type: "COOLDOWN_COMPLETE" });
          }}
        />
      );
      break;
    case "completing":
      screen = (
        <CompletingScreen
          commit={commitSummary}
          language={language}
          onCommitted={handleCommitted}
        />
      );
      break;
    case "result":
      screen =
        state.summary === null ? null : (
          <ResultScreen
            diagnosticReport={
              debugCameraEvidenceEnabled &&
              state.source === "camera" &&
              chart !== null &&
              performanceEvidence !== null
                ? createCameraEvidenceReport({
                    chart,
                    attempts,
                    performance: performanceEvidence,
                  })
                : null
            }
            language={language}
            onFinish={stopSession}
            summary={state.summary}
          />
        );
      break;
  }

  if (clockRecovery !== null) {
    screen = (
      <AudioRecoveryScreen
        busy={audioPreparing}
        language={language}
        onContinueSilently={() => {
          void continueWithoutAudio();
        }}
        onRetry={() => {
          void prepareClock(clockRecovery);
        }}
      />
    );
  }

  return (
    <AppChrome
      cameraActive={
        state.source === "camera" &&
        !["idle", "disclosure", "permission"].includes(state.phase)
      }
      language={language}
      onLanguageChange={changeLanguage}
      onReducedMotionChange={changeReducedMotion}
      onStop={stopSession}
      phase={state.phase}
      reducedMotion={reducedMotion}
      silentPractice={silentPractice}
      simulated={
        state.source === "synthetic" ||
        (idleView !== "home" && showSimulatedTrend)
      }
    >
      <div
        aria-hidden={!compactGameplayBlocked}
        className="compact-blocker"
        data-active={compactGameplayBlocked ? "true" : "false"}
      >
        <strong>{language === "zh" ? "请使用笔记本电脑" : "Use a laptop to play"}</strong>
        <span>
          {language === "zh"
            ? "手机上可以阅读说明，但舞蹈游戏需要更大的画面。"
            : "You can read this page on a phone, but the dance game needs a larger view."}
        </span>
      </div>
      <div
        className="app-content"
        data-compact-blocked={compactGameplayBlocked ? "true" : "false"}
      >
        {screen}
      </div>
    </AppChrome>
  );
}
