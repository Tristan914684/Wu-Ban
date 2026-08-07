import type { SessionClock } from "../../application/ports/session-clock";
import type { SessionChart } from "../../domain/chart/session-chart";

export const MO_LI_HUA_SCORE_SOURCE =
  "https://commons.wikimedia.org/wiki/File:Jasmine_barrow.svg";

interface MelodyNote {
  readonly midi: number | null;
  readonly beats: number;
}

const MO_LI_HUA_MELODY: readonly MelodyNote[] = [
  { midi: 64, beats: 1 },
  { midi: 64, beats: 0.5 },
  { midi: 67, beats: 0.5 },
  { midi: 69, beats: 0.5 },
  { midi: 72, beats: 0.5 },
  { midi: 72, beats: 0.5 },
  { midi: 69, beats: 0.5 },
  { midi: 67, beats: 1 },
  { midi: 67, beats: 0.5 },
  { midi: 69, beats: 0.5 },
  { midi: 67, beats: 1 },
  { midi: null, beats: 1 },
  { midi: 64, beats: 1 },
  { midi: 64, beats: 0.5 },
  { midi: 67, beats: 0.5 },
  { midi: 69, beats: 0.5 },
  { midi: 72, beats: 0.5 },
  { midi: 72, beats: 0.5 },
  { midi: 69, beats: 0.5 },
  { midi: 67, beats: 1 },
  { midi: 67, beats: 0.5 },
  { midi: 69, beats: 0.5 },
  { midi: 67, beats: 1 },
  { midi: null, beats: 1 },
  { midi: 67, beats: 1 },
  { midi: 67, beats: 1 },
  { midi: 67, beats: 1 },
  { midi: 64, beats: 0.5 },
  { midi: 67, beats: 0.5 },
  { midi: 69, beats: 1 },
  { midi: 69, beats: 1 },
  { midi: 67, beats: 2 },
  { midi: 64, beats: 1 },
  { midi: 62, beats: 0.5 },
  { midi: 64, beats: 0.5 },
  { midi: 67, beats: 1 },
  { midi: 64, beats: 0.5 },
  { midi: 62, beats: 0.5 },
  { midi: 60, beats: 1 },
  { midi: 60, beats: 0.5 },
  { midi: 62, beats: 0.5 },
  { midi: 60, beats: 2 },
  { midi: 64, beats: 0.5 },
  { midi: 62, beats: 0.5 },
  { midi: 60, beats: 0.5 },
  { midi: 64, beats: 0.5 },
  { midi: 62, beats: 1.5 },
  { midi: 64, beats: 0.5 },
  { midi: 67, beats: 1 },
  { midi: 69, beats: 0.5 },
  { midi: 72, beats: 0.5 },
  { midi: 67, beats: 2 },
  { midi: 62, beats: 1 },
  { midi: 64, beats: 0.5 },
  { midi: 67, beats: 0.5 },
  { midi: 62, beats: 0.5 },
  { midi: 64, beats: 0.5 },
  { midi: 60, beats: 0.5 },
  { midi: 57, beats: 0.5 },
  { midi: 67, beats: 2 },
  { midi: 69, beats: 1 },
  { midi: 72, beats: 1 },
  { midi: 62, beats: 1.5 },
  { midi: 64, beats: 0.5 },
  { midi: 60, beats: 0.5 },
  { midi: 62, beats: 0.5 },
  { midi: 60, beats: 0.5 },
  { midi: 57, beats: 0.5 },
  { midi: 67, beats: 2 },
  { midi: null, beats: 2 },
];

export const MO_LI_HUA_PATTERN_BEATS = MO_LI_HUA_MELODY.reduce(
  (total, note) => total + note.beats,
  0,
);

function midiFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export class BrowserSessionClock implements SessionClock {
  private context: AudioContext | null = null;
  private startedAtSeconds = 0;
  private activeNodes: AudioScheduledSourceNode[] = [];
  private musicBus: GainNode | null = null;
  private cueBus: GainNode | null = null;
  private musicVolume = 0.75;
  private cueVolume = 0.9;

  async prepare(): Promise<void> {
    this.context ??= new AudioContext({ latencyHint: "interactive" });
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  async start(chart: SessionChart): Promise<void> {
    await this.stop();
    await this.prepare();
    const context = this.context;
    if (context === null) {
      throw new Error("Audio context was not prepared.");
    }

    const startedAt = context.currentTime + 0.08;
    this.startedAtSeconds = startedAt;
    const master = context.createGain();
    master.gain.value = 0.42;
    master.connect(context.destination);
    this.musicBus = context.createGain();
    this.musicBus.gain.value = this.musicVolume;
    this.musicBus.connect(master);
    this.cueBus = context.createGain();
    this.cueBus.gain.value = this.cueVolume;
    this.cueBus.connect(master);

    const melody = context.createOscillator();
    const melodyGain = context.createGain();
    melody.type = "triangle";
    melodyGain.gain.setValueAtTime(0.0001, startedAt);
    melody.connect(melodyGain).connect(this.musicBus);

    const beatSeconds = 60 / chart.bpm;
    const sessionEnd = startedAt + chart.durationMs / 1000;
    let melodyAt = startedAt;
    while (melodyAt < sessionEnd) {
      for (const note of MO_LI_HUA_MELODY) {
        const durationSeconds = note.beats * beatSeconds;
        if (melodyAt >= sessionEnd) {
          break;
        }
        const noteEnd = Math.min(
          melodyAt + durationSeconds * 0.9,
          sessionEnd,
        );
        melodyGain.gain.setValueAtTime(0.0001, melodyAt);
        if (note.midi !== null) {
          melody.frequency.setValueAtTime(
            midiFrequency(note.midi),
            melodyAt,
          );
          melodyGain.gain.linearRampToValueAtTime(
            0.075,
            Math.min(melodyAt + 0.025, noteEnd),
          );
          melodyGain.gain.setValueAtTime(
            0.055,
            Math.max(melodyAt + 0.025, noteEnd - 0.04),
          );
          melodyGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
        }
        melodyAt += durationSeconds;
      }
    }

    melody.start(startedAt);
    melody.stop(sessionEnd + 0.1);
    this.activeNodes.push(melody);
  }

  /**
   * Plays a short one-shot tone on the cue bus, starting immediately.
   * Used for reactive per-attempt feedback rather than the pre-scheduled
   * background melody, since correctness is only known once a move has
   * actually been observed.
   */
  private playOneShot(
    type: OscillatorType,
    startFrequency: number,
    peakGain: number,
    durationSeconds: number,
    endFrequency?: number,
  ): void {
    const context = this.context;
    if (context === null || this.cueBus === null) {
      return;
    }
    const now = context.currentTime;
    const tone = context.createOscillator();
    const gain = context.createGain();
    tone.type = type;
    tone.frequency.setValueAtTime(startFrequency, now);
    if (endFrequency !== undefined) {
      tone.frequency.exponentialRampToValueAtTime(
        endFrequency,
        now + durationSeconds,
      );
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);
    tone.connect(gain).connect(this.cueBus);
    tone.start(now);
    tone.stop(now + durationSeconds + 0.02);
    this.activeNodes.push(tone);
  }

  /** The rhythm "ding" — played when a move matches the expected cue. */
  playCorrectCue(): void {
    this.playOneShot("sine", 783.99, 0.12, 0.16);
  }

  /** A short, low "DEHHHH" buzz — played when a move is wrong. */
  playIncorrectCue(): void {
    this.playOneShot("sawtooth", 180, 0.18, 0.22, 90);
  }

  elapsedMs(): number {
    if (this.context === null || this.startedAtSeconds === 0) {
      return 0;
    }
    return Math.max(
      0,
      (this.context.currentTime - this.startedAtSeconds) * 1000,
    );
  }

  setMusicVolume(value: number): void {
    this.musicVolume = Math.max(0, Math.min(1, value));
    if (this.musicBus !== null) {
      this.musicBus.gain.value = this.musicVolume;
    }
  }

  setCueVolume(value: number): void {
    this.cueVolume = Math.max(0, Math.min(1, value));
    if (this.cueBus !== null) {
      this.cueBus.gain.value = this.cueVolume;
    }
  }

  async pause(): Promise<void> {
    if (this.context?.state === "running") {
      await this.context.suspend();
    }
  }

  async resume(): Promise<void> {
    if (this.context?.state === "suspended") {
      await this.context.resume();
    }
  }

  stop(): Promise<void> {
    for (const node of this.activeNodes) {
      try {
        node.stop();
      } catch {
        // A node that naturally ended is already stopped.
      }
    }
    this.activeNodes = [];
    this.musicBus = null;
    this.cueBus = null;
    this.startedAtSeconds = 0;
    return Promise.resolve();
  }

  async dispose(): Promise<void> {
    await this.stop();
    const context = this.context;
    this.context = null;
    if (context !== null && context.state !== "closed") {
      await context.close();
    }
  }
}
