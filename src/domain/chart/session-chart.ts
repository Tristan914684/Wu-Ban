import type {
  MovementCue,
  SeatedCue,
  StandingCue,
} from "../movement/landmarks";

export type SessionMode = "standing" | "seated";
export type CueSection = "warmup" | "follow" | "rhythm" | "memory";

export interface SessionCue {
  readonly id: string;
  readonly atMs: number;
  readonly section: CueSection;
  readonly action: "move" | "hold";
  readonly expected: MovementCue | null;
}

export interface SessionChart {
  readonly id: string;
  readonly version: 1;
  readonly mode: SessionMode;
  readonly bpm: number;
  readonly durationMs: number;
  readonly cues: readonly SessionCue[];
}

const standingSequence: readonly StandingCue[] = [
  "step-left",
  "step-right",
  "step-forward",
  "step-back",
];
const seatedSequence: readonly SeatedCue[] = [
  "left-palm",
  "right-palm",
  "both-palms",
  "index-hold",
];

function sectionAt(atMs: number): CueSection {
  if (atMs < 30_000) {
    return "warmup";
  }
  if (atMs < 90_000) {
    return "follow";
  }
  if (atMs < 165_000) {
    return "rhythm";
  }
  return "memory";
}

export function createSessionChart(
  mode: SessionMode,
  options: { readonly accelerated?: boolean } = {},
): SessionChart {
  const durationMs = options.accelerated === true ? 8_000 : 240_000;
  const intervalMs = options.accelerated === true ? 500 : 2_000;
  const sequence = mode === "standing" ? standingSequence : seatedSequence;
  const cues: SessionCue[] = [];

  for (
    let atMs = options.accelerated === true ? 250 : 4_000, index = 0;
    atMs < durationMs - intervalMs;
    atMs += intervalMs, index += 1
  ) {
    const section = sectionAt(
      options.accelerated === true
        ? (atMs / durationMs) * 240_000
        : atMs,
    );
    const isNoGoCue = section === "memory" && index % 5 === 4;
    cues.push({
      id: `${mode}-${index + 1}`,
      atMs,
      section,
      action: isNoGoCue ? "hold" : "move",
      expected: isNoGoCue ? null : sequence[index % sequence.length] ?? null,
    });
  }

  return {
    id: options.accelerated === true ? `${mode}-demo-fast` : `${mode}-mvp`,
    version: 1,
    mode,
    bpm: 90,
    durationMs,
    cues,
  };
}

export function cueAt(
  chart: SessionChart,
  elapsedMs: number,
  windowMs = 750,
): SessionCue | undefined {
  return chart.cues.find(
    (cue) => Math.abs(cue.atMs - elapsedMs) <= windowMs,
  );
}
