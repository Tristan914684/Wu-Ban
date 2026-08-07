import type { SessionChart } from "../../domain/chart/session-chart";

export interface SessionClock {
  prepare(): Promise<void>;
  start(chart: SessionChart): Promise<void>;
  elapsedMs(): number;
  setMusicVolume(value: number): void;
  setCueVolume(value: number): void;
  playCorrectCue(): void;
  playIncorrectCue(): void;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  dispose(): Promise<void>;
}
