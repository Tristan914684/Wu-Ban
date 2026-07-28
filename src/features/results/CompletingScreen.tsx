import { useEffect, useState } from "react";

import type { Language } from "../../content/copy";
import type { SessionSummary } from "../../domain/session/session-summary";
import { Button } from "../../ui/primitives/Button";

interface CompletingScreenProps {
  readonly language: Language;
  readonly commit: () => Promise<SessionSummary>;
  readonly onCommitted: (summary: SessionSummary) => void;
}

export function CompletingScreen({
  language,
  commit,
  onCommitted,
}: CompletingScreenProps) {
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState(false);
  const isChinese = language === "zh";

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setError(false);
      try {
        const summary = await commit();
        if (!cancelled) {
          onCommitted(summary);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [attempt, commit, onCommitted]);

  return (
    <main className="completion-screen" aria-live="polite">
      <span className="completion-screen__mark" aria-hidden="true">
        完
      </span>
      <p className="eyebrow">
        {isChinese ? "正在整理本局结果" : "PREPARING YOUR RESULT"}
      </p>
      <h1>{isChinese ? "只保存动作摘要。" : "Saving the summary only."}</h1>
      <p>
        {isChinese
          ? "没有视频、照片或关键点帧会写入记录。"
          : "No video, photos, or landmark frames are written to history."}
      </p>
      {error ? (
        <div className="status-message status-message--error" role="alert">
          <p>
            {isChinese
              ? "本机记录没有保存。结果还没有被当作已完成。"
              : "The local record was not saved. The session is not marked complete yet."}
          </p>
          <Button
            onClick={() => {
              setAttempt((current) => current + 1);
            }}
          >
            {isChinese ? "重试保存" : "Retry save"}
          </Button>
        </div>
      ) : null}
    </main>
  );
}

