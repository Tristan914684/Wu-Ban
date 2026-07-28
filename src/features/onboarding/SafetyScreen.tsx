import type { SessionMode } from "../../domain/chart/session-chart";
import type { Language } from "../../content/copy";
import { Button } from "../../ui/primitives/Button";
import { StepLayout } from "../../ui/components/StepLayout";

interface SafetyScreenProps {
  readonly language: Language;
  readonly mode: SessionMode;
  readonly onAccept: () => void;
}

export function SafetyScreen({
  language,
  mode,
  onAccept,
}: SafetyScreenProps) {
  const isChinese = language === "zh";
  const standing = mode === "standing";

  return (
    <StepLayout
      description={
        <p>
          {standing
            ? isChinese
              ? "清出一步空间，穿稳固的鞋；需要时让家人在旁边。"
              : "Clear one step of space, wear stable shoes, and keep a companion nearby if useful."
            : isChinese
              ? "坐在稳固、不会滑动的椅子上，双脚自然着地。"
              : "Use a stable chair that will not slide, with both feet resting naturally."}
        </p>
      }
      eyebrow={isChinese ? "§ 04 — 安全准备" : "§ 04 — SAFETY CHECK"}
      title={isChinese ? "舒服比标准更重要。" : "Comfort comes before precision."}
    >
      <ul className="safety-list">
        <li>
          {isChinese
            ? "不需要跳跃、快速转身或单脚站立。"
            : "No jumping, fast turns, or one-leg balance."}
        </li>
        <li>
          {isChinese
            ? "感觉不适时，马上停止。"
            : "Stop immediately if anything feels uncomfortable."}
        </li>
        <li>
          {isChinese
            ? "看不清动作时，舞伴会暂停计分，不会算错。"
            : "When tracking is unclear, Wǔbàn pauses scoring instead of marking a miss."}
        </li>
      </ul>
      <Button onClick={onAccept}>
        {isChinese ? "空间准备好了" : "My space is ready"}
      </Button>
    </StepLayout>
  );
}

