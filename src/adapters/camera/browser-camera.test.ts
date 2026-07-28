/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from "vitest";

import { BrowserCamera } from "./browser-camera";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BrowserCamera", () => {
  it("does not request the camera before disclosure", async () => {
    const getUserMedia = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });

    const camera = new BrowserCamera();

    await expect(camera.request(false)).resolves.toEqual({
      kind: "error",
      failure: "not-disclosed",
    });
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("requests video only and stops every acquired track", async () => {
    const stop = vi.fn();
    const stream = {
      active: true,
      getTracks: () => [{ stop }],
    } as unknown as MediaStream;
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });

    const camera = new BrowserCamera();

    await expect(camera.request(true)).resolves.toEqual({ kind: "ready" });
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30, max: 30 },
        facingMode: "user",
      },
    });

    camera.stop();
    expect(stop).toHaveBeenCalledOnce();
    expect(camera.isActive()).toBe(false);
  });
});
