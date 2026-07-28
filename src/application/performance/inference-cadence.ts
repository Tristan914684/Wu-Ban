export const CAMERA_INFERENCE_INTERVAL_MS = 30;

export function shouldRunCameraInference(
  timestampMs: number,
  lastInferenceAtMs: number | null,
): boolean {
  return (
    lastInferenceAtMs === null ||
    timestampMs - lastInferenceAtMs >= CAMERA_INFERENCE_INTERVAL_MS
  );
}
