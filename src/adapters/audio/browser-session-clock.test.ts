import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BrowserSessionClock,
  MO_LI_HUA_PATTERN_BEATS,
  MO_LI_HUA_SCORE_SOURCE,
} from "./browser-session-clock";

class FakeAudioParam {
  private lastTime = Number.NEGATIVE_INFINITY;

  private record(time: number): void {
    if (time < this.lastTime) {
      throw new Error("Audio automation must be scheduled monotonically.");
    }
    this.lastTime = time;
  }

  setValueAtTime(_value: number, time: number): void {
    this.record(time);
  }

  linearRampToValueAtTime(_value: number, time: number): void {
    this.record(time);
  }

  exponentialRampToValueAtTime(_value: number, time: number): void {
    this.record(time);
  }
}

class FakeSource {
  readonly frequency = new FakeAudioParam();
  type = "sine";
  starts: number[] = [];
  stops: number[] = [];

  connect(): this {
    return this;
  }

  start(time: number): void {
    this.starts.push(time);
  }

  stop(time?: number): void {
    this.stops.push(time ?? 0);
  }
}

class FakeGain {
  readonly gain = Object.assign(new FakeAudioParam(), { value: 1 });

  connect(): this {
    return this;
  }
}

class FakeAudioContext {
  static latest: FakeAudioContext | null = null;

  currentTime = 1;
  state: AudioContextState = "running";
  destination = {};
  readonly sources: FakeSource[] = [];

  constructor() {
    FakeAudioContext.latest = this;
  }

  createGain(): FakeGain {
    return new FakeGain();
  }

  createOscillator(): FakeSource {
    const source = new FakeSource();
    this.sources.push(source);
    return source;
  }

  resume(): Promise<void> {
    this.state = "running";
    return Promise.resolve();
  }

  suspend(): Promise<void> {
    this.state = "suspended";
    return Promise.resolve();
  }

  close(): Promise<void> {
    this.state = "closed";
    return Promise.resolve();
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  FakeAudioContext.latest = null;
});

describe("project-owned Mo Li Hua arrangement", () => {
  it("retains the public-domain score source and complete 56-beat form (BR-017)", () => {
    expect(MO_LI_HUA_SCORE_SOURCE).toBe(
      "https://commons.wikimedia.org/wiki/File:Jasmine_barrow.svg",
    );
    expect(MO_LI_HUA_PATTERN_BEATS).toBe(56);
  });

  it("schedules melody and reactive cue feedback against one audio clock", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const clock = new BrowserSessionClock();

    await clock.start({
      id: "audio-test",
      version: 1,
      mode: "standing",
      bpm: 90,
      durationMs: 1_000,
      cues: [
        {
          id: "cue-1",
          atMs: 200,
          section: "follow",
          action: "move",
          expected: "step-left",
        },
      ],
    });

    expect(FakeAudioContext.latest?.sources).toHaveLength(1);

    clock.playCorrectCue();

    expect(FakeAudioContext.latest?.sources).toHaveLength(2);
    expect(
      FakeAudioContext.latest?.sources.every(
        (source) => source.starts.length === 1 && source.stops.length === 1,
      ),
    ).toBe(true);
  });

  it("releases an abandoned audio context before a fresh retry", async () => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
    const clock = new BrowserSessionClock();

    await clock.prepare();
    const context = FakeAudioContext.latest;
    await clock.dispose();

    expect(context?.state).toBe("closed");
  });
});
