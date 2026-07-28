/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from "vitest";

import { BrowserCueNarrator } from "./browser-cue-narrator";

class FakeUtterance {
  lang = "";
  rate = 1;
  pitch = 1;
  volume = 1;

  constructor(readonly text: string) {}
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("browser cue narrator", () => {
  it("speaks only supplied cue copy with bounded volume", () => {
    const cancel = vi.fn();
    const speak = vi.fn();
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: { cancel, speak },
    });

    const narrator = new BrowserCueNarrator();
    expect(narrator.speak("向左一步", "zh", 2)).toBe(true);

    expect(cancel).toHaveBeenCalledOnce();
    expect(speak).toHaveBeenCalledOnce();
    const utterance = speak.mock.calls[0]?.[0] as FakeUtterance;
    expect(utterance).toMatchObject({
      text: "向左一步",
      lang: "zh-CN",
      rate: 0.82,
      volume: 1,
    });
  });
});
