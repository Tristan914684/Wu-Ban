import type { Language } from "../../content/copy";
import type { SessionMode } from "../../domain/chart/session-chart";
import type { TrendReport } from "../../domain/trend/personal-trend";
import {
  LocalDataNotice,
  type LocalDataStatus,
} from "../../ui/components/LocalDataNotice";
import { Button } from "../../ui/primitives/Button";
import { StepLayout } from "../../ui/components/StepLayout";
import { PersonalPatternReport } from "./PersonalPatternReport";

interface ProgressScreenProps {
  readonly language: Language;
  readonly report: TrendReport;
  readonly localDataStatus: LocalDataStatus;
  readonly excludedSimulatedCount: number;
  readonly weeklyParticipation: number;
  readonly onBack: () => void;
  readonly onModeChange: (mode: SessionMode) => void;
  readonly onOpenSharing: () => void;
  readonly onRetryLocalData: () => void;
  readonly onToggleSimulation: () => void;
}

function statusCopy(
  report: TrendReport,
  language: Language,
): { readonly title: string; readonly description: string } {
  const isChinese = language === "zh";
  switch (report.performanceTrend) {
    case "stable":
      return {
        title: isChinese ? "你的游戏趋势稳定。" : "Your gameplay trend is stable.",
        description: isChinese
          ? "现有游戏记录没有显示重复的整体变化。"
          : "The available gameplay history does not show a repeated overall change.",
      };
    case "declined":
      return {
        title: isChinese ? "你的游戏趋势有所下降。" : "Your gameplay trend declined.",
        description: isChinese
          ? "两个或以上方面重复低于个人平常范围；疲劳、光线和熟悉程度都可能影响结果。"
          : "Two or more areas repeatedly moved below the personal usual range; tiredness, lighting, and familiarity can affect the result.",
      };
    case "improving":
      return {
        title: isChinese ? "你的游戏趋势正在改善。" : "Your gameplay trend is improving.",
        description: isChinese
          ? "两个或以上方面重复高于个人平常范围。"
          : "Two or more areas repeatedly moved above the personal usual range.",
      };
  }
}

export function ProgressScreen({
  language,
  report,
  localDataStatus,
  excludedSimulatedCount,
  weeklyParticipation,
  onBack,
  onModeChange,
  onOpenSharing,
  onRetryLocalData,
  onToggleSimulation,
}: ProgressScreenProps) {
  const isChinese = language === "zh";
  const personalDataUnavailable =
    localDataStatus !== "ready" && !report.simulated;
  const status = personalDataUnavailable
    ? {
        title:
          localDataStatus === "loading"
            ? isChinese
              ? "正在读取本机节奏。"
              : "Reading your local rhythm."
            : isChinese
              ? "本机节奏暂时无法显示。"
              : "Your local rhythm is temporarily unavailable.",
        description: isChinese
          ? "读取成功后才会显示个人记录；舞伴不会把暂时的空白当作没有记录。"
          : "Personal records appear only after a successful read. Wǔbàn does not treat a temporary blank as no history.",
      }
    : statusCopy(report, language);

  return (
    <StepLayout
      description={<p>{status.description}</p>}
      eyebrow={isChinese ? "§ 我的节奏" : "§ MY RHYTHM"}
      title={status.title}
    >
      <LocalDataNotice
        language={language}
        onRetry={onRetryLocalData}
        status={localDataStatus}
      />
      {report.simulated ? (
        <div className="simulation-notice" role="status">
          <strong>{isChinese ? "模拟数据" : "SIMULATED DATA"}</strong>
          <span>
            {isChinese
              ? "这些固定示例只说明产品如何工作，不是你的表现，也没有加入本机历史。"
              : "These fixed examples explain the product. They are not your performance and were not added to local history."}
          </span>
        </div>
      ) : null}
      {personalDataUnavailable ? null : (
        <div
          className="segmented-control"
          aria-label={isChinese ? "游戏方式" : "Play mode"}
        >
          <Button
            aria-pressed={report.mode === "standing"}
            onClick={() => {
              onModeChange("standing");
            }}
            variant={report.mode === "standing" ? "primary" : "quiet"}
          >
            {isChinese ? "站立舞步" : "Standing"}
          </Button>
          <Button
            aria-pressed={report.mode === "seated"}
            onClick={() => {
              onModeChange("seated");
            }}
            variant={report.mode === "seated" ? "primary" : "quiet"}
          >
            {isChinese ? "坐姿手势" : "Seated"}
          </Button>
        </div>
      )}
      {personalDataUnavailable ? null : (
        <PersonalPatternReport
          language={language}
          report={report}
          weeklyParticipation={weeklyParticipation}
        />
      )}
      {!personalDataUnavailable &&
      !report.simulated &&
      excludedSimulatedCount > 0 ? (
        <p className="supporting-copy">
          {isChinese
            ? `${excludedSimulatedCount} 次模拟游戏已排除，不会进入你的平常范围。`
            : `${excludedSimulatedCount} simulated session${excludedSimulatedCount === 1 ? "" : "s"} excluded from your usual range.`}
        </p>
      ) : null}
      <div className="action-row">
        <Button onClick={onOpenSharing}>
          {isChinese ? "隐私与分享" : "Privacy and sharing"}
        </Button>
        <Button onClick={onToggleSimulation} variant="secondary">
          {report.simulated
            ? isChinese
              ? "返回我的真实记录"
              : "Return to my real history"
            : isChinese
              ? "查看模拟趋势演示"
              : "View simulated trend demo"}
        </Button>
        <Button onClick={onBack} variant="quiet">
          {isChinese ? "返回首页" : "Back home"}
        </Button>
      </div>
    </StepLayout>
  );
}
