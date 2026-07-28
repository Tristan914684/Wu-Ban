export const REQUIRED_STABLE_TRACKING_MS = 3_000;

export interface TrackingStability {
  readonly stableSinceMs: number | null;
  readonly progress: number;
  readonly ready: boolean;
}

export function updateTrackingStability(
  previous: TrackingStability,
  timestampMs: number,
  scoreable: boolean,
): TrackingStability {
  if (!scoreable) {
    return {
      stableSinceMs: null,
      progress: 0,
      ready: false,
    };
  }

  const stableSinceMs = previous.stableSinceMs ?? timestampMs;
  const stableForMs = Math.max(0, timestampMs - stableSinceMs);
  return {
    stableSinceMs,
    progress: Math.min(1, stableForMs / REQUIRED_STABLE_TRACKING_MS),
    ready: stableForMs >= REQUIRED_STABLE_TRACKING_MS,
  };
}

export const INITIAL_TRACKING_STABILITY: TrackingStability = {
  stableSinceMs: null,
  progress: 0,
  ready: false,
};
