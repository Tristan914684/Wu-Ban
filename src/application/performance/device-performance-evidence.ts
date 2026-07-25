import type { SessionChart } from "../../domain/chart/session-chart";
import type { MovementObservation } from "../../domain/movement/landmarks";

type UnscoreableReason = Extract<
  MovementObservation,
  { readonly kind: "unscoreable" }
>["reason"];

interface DevicePerformanceEvidenceConfig {
  readonly mode: SessionChart["mode"];
  readonly chartId: string;
  readonly chartVersion: SessionChart["version"];
}

interface RenderSample {
  readonly timestampMs: number;
  readonly audioElapsedMs: number;
  readonly active: boolean;
}

interface InferenceSample {
  readonly durationMs: number;
  readonly confidence: number;
  readonly observation: MovementObservation;
}

export interface DevicePerformanceEvidenceReport {
  readonly schemaVersion: 1;
  readonly mode: SessionChart["mode"];
  readonly chartId: string;
  readonly chartVersion: SessionChart["version"];
  readonly measurementWindowMs: number;
  readonly renderFrameCount: number;
  readonly renderRateFps: number;
  readonly inferenceCount: number;
  readonly inferenceRateFps: number;
  readonly inferenceDurationMedianMs: number | null;
  readonly inferenceDurationP95Ms: number | null;
  readonly meanLandmarkConfidence: number | null;
  readonly scoreableFrameCount: number;
  readonly unscoreableFrameCount: number;
  readonly unscoreableEpisodeCount: number;
  readonly unscoreableReasons: Readonly<
    Partial<Record<UnscoreableReason, number>>
  >;
  readonly absoluteAudioClockDriftEndMs: number | null;
  readonly absoluteAudioClockDriftP95Ms: number | null;
  readonly pauseCount: number;
  readonly debugOverlayEnabled: true;
  readonly privacyBoundary: "aggregate-performance-only";
}

function percentile(
  values: readonly number[],
  percentileValue: number,
): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.max(
    0,
    Math.ceil(sorted.length * percentileValue) - 1,
  );
  return sorted[index] ?? null;
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle];
  if (upper === undefined) {
    return null;
  }
  if (sorted.length % 2 === 1) {
    return upper;
  }
  return ((sorted[middle - 1] ?? upper) + upper) / 2;
}

function rate(count: number, durationMs: number): number {
  return durationMs <= 0 ? 0 : (count * 1_000) / durationMs;
}

export class DevicePerformanceEvidenceCollector {
  readonly #config: DevicePerformanceEvidenceConfig;
  readonly #inferenceDurationsMs: number[] = [];
  readonly #confidenceSamples: number[] = [];
  readonly #absoluteClockDriftSamplesMs: number[] = [];
  readonly #unscoreableReasons: Partial<
    Record<UnscoreableReason, number>
  > = {};
  #activeDurationMs = 0;
  #renderFrameCount = 0;
  #inferenceCount = 0;
  #scoreableFrameCount = 0;
  #unscoreableFrameCount = 0;
  #unscoreableEpisodeCount = 0;
  #pauseCount = 0;
  #lastTimestampMs: number | null = null;
  #lastActive = false;
  #lastObservationWasUnscoreable = false;
  #clockOffsetBaselineMs: number | null = null;

  constructor(config: DevicePerformanceEvidenceConfig) {
    this.#config = config;
  }

  recordRender(sample: RenderSample): void {
    if (
      !Number.isFinite(sample.timestampMs) ||
      !Number.isFinite(sample.audioElapsedMs)
    ) {
      return;
    }
    if (this.#lastTimestampMs !== null) {
      const elapsedWallMs = Math.max(
        0,
        sample.timestampMs - this.#lastTimestampMs,
      );
      if (this.#lastActive) {
        this.#activeDurationMs += elapsedWallMs;
      }
      if (this.#lastActive && !sample.active) {
        this.#pauseCount += 1;
      }
    }
    this.#lastTimestampMs = sample.timestampMs;
    this.#lastActive = sample.active;

    if (!sample.active) {
      return;
    }
    this.#renderFrameCount += 1;
    const clockOffsetMs =
      sample.audioElapsedMs - this.#activeDurationMs;
    this.#clockOffsetBaselineMs ??= clockOffsetMs;
    this.#absoluteClockDriftSamplesMs.push(
      Math.abs(clockOffsetMs - this.#clockOffsetBaselineMs),
    );
  }

  recordInference(sample: InferenceSample): void {
    if (
      !Number.isFinite(sample.durationMs) ||
      sample.durationMs < 0
    ) {
      return;
    }
    this.#inferenceCount += 1;
    this.#inferenceDurationsMs.push(sample.durationMs);
    if (
      Number.isFinite(sample.confidence) &&
      sample.confidence >= 0 &&
      sample.confidence <= 1
    ) {
      this.#confidenceSamples.push(sample.confidence);
    }

    if (sample.observation.kind === "unscoreable") {
      this.#unscoreableFrameCount += 1;
      this.#unscoreableReasons[sample.observation.reason] =
        (this.#unscoreableReasons[sample.observation.reason] ?? 0) + 1;
      if (!this.#lastObservationWasUnscoreable) {
        this.#unscoreableEpisodeCount += 1;
      }
      this.#lastObservationWasUnscoreable = true;
      return;
    }

    this.#scoreableFrameCount += 1;
    this.#lastObservationWasUnscoreable = false;
  }

  finish(): DevicePerformanceEvidenceReport {
    const finalAbsoluteDrift =
      this.#absoluteClockDriftSamplesMs.at(-1) ?? null;
    return {
      schemaVersion: 1,
      mode: this.#config.mode,
      chartId: this.#config.chartId,
      chartVersion: this.#config.chartVersion,
      measurementWindowMs: this.#activeDurationMs,
      renderFrameCount: this.#renderFrameCount,
      renderRateFps: rate(
        this.#renderFrameCount,
        this.#activeDurationMs,
      ),
      inferenceCount: this.#inferenceCount,
      inferenceRateFps: rate(
        this.#inferenceCount,
        this.#activeDurationMs,
      ),
      inferenceDurationMedianMs: median(
        this.#inferenceDurationsMs,
      ),
      inferenceDurationP95Ms: percentile(
        this.#inferenceDurationsMs,
        0.95,
      ),
      meanLandmarkConfidence:
        this.#confidenceSamples.length === 0
          ? null
          : this.#confidenceSamples.reduce(
              (total, value) => total + value,
              0,
            ) / this.#confidenceSamples.length,
      scoreableFrameCount: this.#scoreableFrameCount,
      unscoreableFrameCount: this.#unscoreableFrameCount,
      unscoreableEpisodeCount: this.#unscoreableEpisodeCount,
      unscoreableReasons: { ...this.#unscoreableReasons },
      absoluteAudioClockDriftEndMs: finalAbsoluteDrift,
      absoluteAudioClockDriftP95Ms: percentile(
        this.#absoluteClockDriftSamplesMs,
        0.95,
      ),
      pauseCount: this.#pauseCount,
      debugOverlayEnabled: true,
      privacyBoundary: "aggregate-performance-only",
    };
  }
}
