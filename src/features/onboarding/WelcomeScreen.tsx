import type { Language } from "../../content/copy";
import { copyFor } from "../../content/copy";
import type { SessionMode } from "../../domain/chart/session-chart";
import { Button } from "../../ui/primitives/Button";
import {
  LocalDataNotice,
  type LocalDataStatus,
} from "../../ui/components/LocalDataNotice";
import { StepLayout } from "../../ui/components/StepLayout";

interface WelcomeScreenProps {
  readonly language: Language;
  readonly historyCount: number;
  readonly localDataStatus: LocalDataStatus;
  readonly weeklyParticipation: number;
  readonly returning: boolean;
  readonly preferredMode: SessionMode;
  readonly onBegin: () => void;
  readonly onClearHistory: () => Promise<void>;
  readonly onRetryLocalData: () => void;
  readonly onReviewProgress: () => void;
}

export function WelcomeScreen({
  language,
  historyCount,
  localDataStatus,
  weeklyParticipation,
  returning,
  preferredMode,
  onBegin,
  onClearHistory,
  onRetryLocalData,
  onReviewProgress,
}: WelcomeScreenProps) {
  const copy = copyFor(language);
  const isChinese = language === "zh";

  return (
    <StepLayout
      aside={
        <div className="dusk-art" aria-hidden="true">
          <span className="dusk-art__wash" />
          <span className="dusk-art__sun" />
          <span className="dusk-art__ground" />
          <span className="dusk-art__dancer dusk-art__dancer--one" />
          <span className="dusk-art__dancer dusk-art__dancer--two" />
          <span className="dusk-art__lantern dusk-art__lantern--one" />
          <span className="dusk-art__lantern dusk-art__lantern--two" />
          <small>{copy.visualDraft}</small>
        </div>
      }
      description={
        <p>
          {isChinese
            ? "跟着熟悉的节拍动一动。舞伴会在本机记录动作与注意力的变化，帮助家人更早开始一次关心的对话。"
            : "Move to a familiar beat. Wǔbàn keeps a local movement-and-attention pattern so a family check-in can start with context."}
        </p>
      }
      eyebrow={isChinese ? "社区广场 · 金色黄昏" : "COMMUNITY SQUARE · GOLDEN DUSK"}
      title={
        <>
          {isChinese ? "一起跳，" : "Dance together."}
          <em>{isChinese ? "慢慢来。" : "Take your time."}</em>
        </>
      }
    >
      <LocalDataNotice
        language={language}
        onRetry={onRetryLocalData}
        status={localDataStatus}
      />
      {returning ? (
        <div className="returning-session-plan">
          <strong>{isChinese ? "今天的一局" : "TODAY'S DANCE"}</strong>
          <span>
            {preferredMode === "standing"
              ? isChinese
                ? "站立舞步"
                : "Standing"
              : isChinese
                ? "坐姿手势"
                : "Seated"}{" "}
            · {isChinese ? "约 4 分钟" : "about 4 minutes"}
          </span>
        </div>
      ) : null}
      <Button
        disabled={localDataStatus === "loading"}
        onClick={onBegin}
      >
        {localDataStatus === "loading"
          ? isChinese
            ? "正在准备本局…"
            : "Preparing your session…"
          : returning
            ? isChinese
              ? "开始今天的一局"
              : "Play today's dance"
            : isChinese
              ? "开始一局"
              : "Start a session"}
      </Button>
      <Button onClick={onReviewProgress} variant="secondary">
        {isChinese ? "查看我的节奏" : "View My rhythm"}
      </Button>
      <p className="supporting-copy">
        {isChinese
          ? "无需账号。摄像头画面不会保存或上传。"
          : "No account. Camera images are not saved or uploaded."}
      </p>
      {historyCount === 0 ? null : (
        <div className="local-history">
          <span>
            {isChinese
              ? `本周已跳 ${weeklyParticipation} 次 · 本机共 ${historyCount} 次记录`
              : `${weeklyParticipation} dance${weeklyParticipation === 1 ? "" : "s"} this week · ${historyCount} local session${historyCount === 1 ? "" : "s"}`}
          </span>
          <Button
            onClick={() => {
              void onClearHistory();
            }}
            variant="quiet"
          >
            {isChinese ? "清除本机记录" : "Clear local history"}
          </Button>
        </div>
      )}
    </StepLayout>
  );
}
