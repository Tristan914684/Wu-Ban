import type { SessionMode } from "../../domain/chart/session-chart";
import type { Language } from "../../content/copy";
import { Button } from "../../ui/primitives/Button";
import { StepLayout } from "../../ui/components/StepLayout";

interface ModeScreenProps {
  readonly language: Language;
  readonly onChoose: (mode: SessionMode) => void;
}

export function ModeScreen({ language, onChoose }: ModeScreenProps) {
  const isChinese = language === "zh";

  return (
    <StepLayout
      description={
        <p>
          {isChinese
            ? "两种方式使用同一段节奏，但校准和动作不同。"
            : "Both routes use the same rhythm, with different calibration and movement."}
        </p>
      }
      title={isChinese ? "今天怎么动？" : "How would you like to move?"}
    >
      <div className="choice-list">
        <Button
          className="mode-choice"
          onClick={() => {
            onChoose("standing");
          }}
          variant="secondary"
        >
          <span className="mode-choice__number">01</span>
          <span>
            <strong>{isChinese ? "站立舞步" : "Standing steps"}</strong>
            <small>
              {isChinese
                ? "左右与轻缓前后移动，不跳跃。"
                : "Gentle side and bounded forward/back steps. No jumps."}
            </small>
          </span>
        </Button>
        <Button
          className="mode-choice"
          onClick={() => {
            onChoose("seated");
          }}
          variant="secondary"
        >
          <span className="mode-choice__number">02</span>
          <span>
            <strong>{isChinese ? "坐姿手势" : "Seated hand gestures"}</strong>
            <small>
              {isChinese
                ? "用左右手掌与食指完成节奏。"
                : "Use left/right palms and an index-finger hold."}
            </small>
          </span>
        </Button>
      </div>
    </StepLayout>
  );
}

