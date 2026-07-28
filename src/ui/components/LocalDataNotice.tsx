import type { Language } from "../../content/copy";
import { Button } from "../primitives/Button";

export type LocalDataStatus = "loading" | "ready" | "unavailable";

interface LocalDataNoticeProps {
  readonly language: Language;
  readonly status: LocalDataStatus;
  readonly onRetry: () => void;
}

export function LocalDataNotice({
  language,
  status,
  onRetry,
}: LocalDataNoticeProps) {
  if (status === "ready") {
    return null;
  }

  const isChinese = language === "zh";
  if (status === "loading") {
    return (
      <div className="status-message" role="status">
        {isChinese
          ? "正在读取或更新本机数据…"
          : "Reading or updating local data…"}
      </div>
    );
  }

  return (
    <div className="status-message status-message--error" role="alert">
      <strong>
        {isChinese
          ? "本机数据暂时无法读取。"
          : "Local data is temporarily unavailable."}
      </strong>
      <p>
        {isChinese
          ? "你仍可开始一局；只有成功保存的结果才会加入记录。重试后再查看个人节奏或更改分享。"
          : "You can still play. Only a successfully saved result joins your history. Retry before viewing your rhythm or changing sharing."}
      </p>
      <Button onClick={onRetry}>
        {isChinese ? "重试本机数据" : "Retry local data"}
      </Button>
    </div>
  );
}
