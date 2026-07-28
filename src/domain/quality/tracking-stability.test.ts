import { describe, expect, it } from "vitest";

import {
  INITIAL_TRACKING_STABILITY,
  updateTrackingStability,
} from "./tracking-stability";

describe("tracking stability", () => {
  it("requires three uninterrupted seconds of scoreable tracking", () => {
    const started = updateTrackingStability(
      INITIAL_TRACKING_STABILITY,
      1_000,
      true,
    );
    const almost = updateTrackingStability(started, 3_999, true);
    const ready = updateTrackingStability(almost, 4_000, true);

    expect(almost.ready).toBe(false);
    expect(ready).toMatchObject({ progress: 1, ready: true });
  });

  it("resets when tracking becomes unclear", () => {
    const started = updateTrackingStability(
      INITIAL_TRACKING_STABILITY,
      1_000,
      true,
    );

    expect(updateTrackingStability(started, 2_000, false)).toEqual(
      INITIAL_TRACKING_STABILITY,
    );
  });
});
