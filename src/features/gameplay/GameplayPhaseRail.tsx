import type { Language } from "../../content/copy";
import type { CueSection } from "../../domain/chart/session-chart";
import { GAMEPLAY_PHASES } from "./gameplay-cue-view";

interface GameplayPhaseRailProps {
  readonly language: Language;
  readonly currentSection: CueSection;
  readonly progress: number;
  readonly remainingSeconds: number;
}

const PHASE_LABELS: Readonly<
  Record<CueSection, readonly [chinese: string, english: string]>
> = {
  warmup: ["热身", "Warm up"],
  follow: ["跟随", "Follow"],
  rhythm: ["节拍", "Rhythm"],
  memory: ["记忆", "Memory"],
};

function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function GameplayPhaseRail({
  language,
  currentSection,
  progress,
  remainingSeconds,
}: GameplayPhaseRailProps) {
  const isChinese = language === "zh";
  const currentIndex = GAMEPLAY_PHASES.indexOf(currentSection);
  const safeProgress = Math.max(0, Math.min(1, progress));

  return (
    <section
      aria-label={isChinese ? "本局进度" : "Session progress"}
      className="gameplay-phase-rail"
    >
      <ol aria-label={isChinese ? "游戏阶段" : "Game phases"}>
        {GAMEPLAY_PHASES.map((phase, index) => {
          const phaseLabel = PHASE_LABELS[phase][isChinese ? 0 : 1];
          const isCurrent = index === currentIndex;
          return (
            <li
              aria-current={isCurrent ? "step" : undefined}
              aria-label={
                isCurrent
                  ? isChinese
                    ? `${phaseLabel}，当前阶段`
                    : `${phaseLabel}, current phase`
                  : phaseLabel
              }
              data-state={
                index < currentIndex
                  ? "complete"
                  : isCurrent
                    ? "current"
                    : "upcoming"
              }
              data-testid={isCurrent ? `phase-dot-${phase}` : undefined}
              key={phase}
            >
              <span aria-hidden="true" data-testid="phase-dot" />
            </li>
          );
        })}
      </ol>
      <strong
        aria-label={
          isChinese
            ? `剩余 ${formatTime(remainingSeconds)}`
            : `${formatTime(remainingSeconds)} remaining`
        }
      >
        {formatTime(remainingSeconds)}
      </strong>
      <progress
        aria-label={isChinese ? "本局进度" : "Session progress"}
        max={1}
        value={safeProgress}
      />
    </section>
  );
}
