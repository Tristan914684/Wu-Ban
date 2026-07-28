import type { Language } from "../../content/copy";
import { StepLayout } from "../../ui/components/StepLayout";
import { Button } from "../../ui/primitives/Button";

interface AudioRecoveryScreenProps {
  readonly busy: boolean;
  readonly language: Language;
  readonly onContinueSilently: () => void;
  readonly onRetry: () => void;
}

export function AudioRecoveryScreen({
  busy,
  language,
  onContinueSilently,
  onRetry,
}: AudioRecoveryScreenProps) {
  const isChinese = language === "zh";

  return (
    <StepLayout
      description={
        <p>
          {isChinese
            ? "计分提示还没有开始。请重试声音；如果设备仍然没有声音，也可以继续一局明确标注的静音练习。"
            : "Scored cues have not started. Retry the sound, or continue with a clearly labelled silent practice if this device still has no audio."}
        </p>
      }
      eyebrow={isChinese ? "声音检查" : "SOUND CHECK"}
      title={isChinese ? "节拍还没有准备好。" : "The beat is not ready yet."}
    >
      <div className="status-message status-message--error" role="alert">
        <strong>{isChinese ? "声音没有启动。" : "Sound did not start."}</strong>
        <p>
          {isChinese
            ? "我们停在倒数前，所以计分提示还没有开始，也没有任何内容进入个人平常范围。"
            : "We stopped before the countdown, so scored cues have not begun and nothing from this attempt can enter the personal usual range."}
        </p>
      </div>
      <div className="action-row">
        <Button disabled={busy} onClick={onRetry}>
          {busy
            ? isChinese
              ? "正在准备声音…"
              : "Preparing sound…"
            : isChinese
              ? "重试声音"
              : "Retry sound"}
        </Button>
        <Button
          disabled={busy}
          onClick={onContinueSilently}
          variant="secondary"
        >
          {isChinese
            ? "继续静音练习"
            : "Continue as silent practice"}
        </Button>
      </div>
      <p className="supporting-copy">
        {isChinese
          ? "完成的静音练习会保留欢乐分和参与记录，但绝不会进入个人平常范围。"
          : "A completed silent practice keeps the fun result and participation, but never shapes the personal usual range."}
      </p>
    </StepLayout>
  );
}
