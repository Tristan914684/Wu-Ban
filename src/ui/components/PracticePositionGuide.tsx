import type { Language } from "../../content/copy";
import type { SessionMode } from "../../domain/chart/session-chart";

interface PracticePositionGuideProps {
  readonly centred: boolean;
  readonly language: Language;
  readonly mode: SessionMode;
}

export function PracticePositionGuide({
  centred,
  language,
  mode,
}: PracticePositionGuideProps) {
  return (
    <div
      aria-hidden="true"
      className="practice-position-guide"
      data-centred={centred ? "true" : "false"}
      data-mode={mode}
    >
      <span className="practice-position-guide__axis" />
      <span className="practice-position-guide__ground" />
      {mode === "standing" ? (
        <>
          <span className="practice-position-guide__foot practice-position-guide__foot--left" />
          <span className="practice-position-guide__foot practice-position-guide__foot--right" />
        </>
      ) : (
        <span className="practice-position-guide__seat" />
      )}
      <span className="practice-position-guide__label">
        {language === "zh" ? "中央起点" : "CENTRE / HOME"}
      </span>
    </div>
  );
}
