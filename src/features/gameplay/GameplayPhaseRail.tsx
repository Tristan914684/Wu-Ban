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
  warmup: ["热身准备", "Settle in"],
  follow: ["跟随引导", "Follow the guide"],
  rhythm: ["跟着节拍", "Move to the beat"],
  memory: ["记住灯笼", "Remember the lanterns"],
};

export function GameplayPhaseRail({
  language,
  currentSection,
  progress,
  remainingSeconds,
}: GameplayPhaseRailProps) {
  const isChinese = language === "zh";
  const currentIndex = GAMEPLAY_PHASES.indexOf(currentSection);
  const safeProgress = Math.max(0, Math.min(1, progress));
  const remainingMinutes = Math.max(0, Math.ceil(remainingSeconds / 60));

  return (
    <section
      aria-label={isChinese ? "本局进度" : "Session progress"}
      className="gameplay-phase-rail"
    >
      <div className="gameplay-phase-rail__summary">
        <span>{isChinese ? "本局进度" : "YOUR SESSION"}</span>
        <strong>
          {isChinese
            ? `约剩 ${remainingMinutes} 分钟`
            : `${remainingMinutes} min remaining`}
        </strong>
      </div>
      <ol className="gameplay-phase-rail__steps">
        {GAMEPLAY_PHASES.map((phase, index) => (
          <li
            data-state={
              index < currentIndex
                ? "complete"
                : index === currentIndex
                  ? "current"
                  : "upcoming"
            }
            key={phase}
          >
            <span aria-hidden="true">{index < currentIndex ? "✓" : index + 1}</span>
            <strong
              aria-current={index === currentIndex ? "step" : undefined}
            >
              {PHASE_LABELS[phase][isChinese ? 0 : 1]}
            </strong>
          </li>
        ))}
      </ol>
      <progress
        aria-label={isChinese ? "本局进度" : "Session progress"}
        max={1}
        value={safeProgress}
      />
    </section>
  );
}
