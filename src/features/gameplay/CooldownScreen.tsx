import type { Language } from "../../content/copy";
import { Button } from "../../ui/primitives/Button";
import { StepLayout } from "../../ui/components/StepLayout";

interface CooldownScreenProps {
  readonly language: Language;
  readonly onContinue: (contextConfounder: boolean) => void;
}

export function CooldownScreen({
  language,
  onContinue,
}: CooldownScreenProps) {
  const isChinese = language === "zh";
  return (
    <StepLayout
      description={
        <p>
          {isChinese
            ? "双脚站稳或双手放松。慢慢呼吸，准备好再看结果。"
            : "Settle both feet or relax both hands. Breathe slowly before viewing the result."}
        </p>
      }
      eyebrow={isChinese ? "§ 09 — 放松" : "§ 09 — COOL DOWN"}
      title={isChinese ? "这一局完成了。" : "Session complete."}
    >
      <div className="context-check">
        <strong>
          {isChinese ? "今天有什么不一样吗？" : "Was today unusual?"}
        </strong>
        <p>
          {isChinese
            ? "如果今天有疼痛、生病、特别疲劳或摄像头问题，这一局仍会保留欢乐分，但不会进入个人平常范围。"
            : "If there was pain, illness, unusual fatigue, or a camera problem, the game result still counts but will not shape your personal usual range."}
        </p>
      </div>
      <Button
        onClick={() => {
          onContinue(false);
        }}
      >
        {isChinese
          ? "和平常差不多，查看结果"
          : "About usual — view result"}
      </Button>
      <Button
        onClick={() => {
          onContinue(true);
        }}
        variant="secondary"
      >
        {isChinese
          ? "今天有些不同，也查看结果"
          : "Something was different — view result"}
      </Button>
    </StepLayout>
  );
}
