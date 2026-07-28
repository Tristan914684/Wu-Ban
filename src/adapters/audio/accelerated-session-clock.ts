import type { SessionClock } from "../../application/ports/session-clock";

export class AcceleratedSessionClock implements SessionClock {
  private startedAt = 0;
  private pausedAt = 0;
  private totalPausedMs = 0;

  constructor(private readonly speed = 8) {}

  prepare(): Promise<void> {
    return Promise.resolve();
  }

  start(): Promise<void> {
    this.startedAt = performance.now();
    this.pausedAt = 0;
    this.totalPausedMs = 0;
    return Promise.resolve();
  }

  elapsedMs(): number {
    if (this.startedAt === 0) {
      return 0;
    }
    const now = this.pausedAt === 0 ? performance.now() : this.pausedAt;
    return Math.max(0, (now - this.startedAt - this.totalPausedMs) * this.speed);
  }

  setMusicVolume(value: number): void {
    void value;
  }

  setCueVolume(value: number): void {
    void value;
  }

  pause(): Promise<void> {
    if (this.pausedAt === 0) {
      this.pausedAt = performance.now();
    }
    return Promise.resolve();
  }

  resume(): Promise<void> {
    if (this.pausedAt !== 0) {
      this.totalPausedMs += performance.now() - this.pausedAt;
      this.pausedAt = 0;
    }
    return Promise.resolve();
  }

  stop(): Promise<void> {
    this.startedAt = 0;
    this.pausedAt = 0;
    this.totalPausedMs = 0;
    return Promise.resolve();
  }

  dispose(): Promise<void> {
    return this.stop();
  }
}
