import type { Language } from "../../content/copy";
import type { SessionMode } from "../../domain/chart/session-chart";
import type {
  MetricFamily,
  TrendReport,
} from "../../domain/trend/personal-trend";
import {
  LocalDataNotice,
  type LocalDataStatus,
} from "../../ui/components/LocalDataNotice";
import { Button } from "../../ui/primitives/Button";
import { StepLayout } from "../../ui/components/StepLayout";

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

const FAMILY_LABELS: Record<MetricFamily, readonly [string, string]> = {
  beat: ["节拍", "Beat"],
  shape: ["动作方向", "Shape"],
  flow: ["接续动作", "Flow"],
  memory: ["顺序与停住", "Memory"],
};

function statusCopy(
  report: TrendReport,
  language: Language,
): { readonly title: string; readonly description: string } {
  const isChinese = language === "zh";
  switch (report.status) {
    case "insufficient-history":
      return {
        title: isChinese ? "正在认识你的平常节奏。" : "Learning your usual rhythm.",
        description: isChinese
          ? `还需要 ${report.sessionsNeeded} 次同一方式的清晰游戏，才能形成初步平常范围。`
          : `${report.sessionsNeeded} more clear session${report.sessionsNeeded === 1 ? "" : "s"} in this mode will form a provisional usual range.`,
      };
    case "baseline-ready":
      return {
        title: isChinese ? "初步平常范围已形成。" : "Your provisional usual range is ready.",
        description: isChinese
          ? "近期清晰记录还不足三次，所以不会判断是否有持续变化。"
          : "There are not yet three recent clear sessions, so no sustained change is inferred.",
      };
    case "usual-range":
      return {
        title: isChinese ? "最近仍在平常范围内。" : "Recent play remains in the usual range.",
        description: isChinese
          ? "这是游戏记录之间的比较，不是健康结论。"
          : "This compares gameplay sessions and is not a health conclusion.",
      };
    case "sustained-shift":
      return {
        title: isChinese ? "有两类节奏出现重复变化。" : "Two rhythm areas changed repeatedly.",
        description: isChinese
          ? "疲劳、不适、光线和熟悉程度都可能影响结果；可以先友好地关心一下。"
          : "Tiredness, discomfort, lighting, and familiarity can all affect the result; a friendly check-in may help.",
      };
  }
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
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
      aside={
        personalDataUnavailable ? undefined : (
          <div className="trend-rule-note">
            <small>
              {isChinese
                ? "原型趋势规则 · 版本 1"
                : "PROTOTYPE TREND RULE · V1"}
            </small>
            <strong>{report.validSessionCount}</strong>
            <span>{isChinese ? "次清晰记录" : "clear sessions"}</span>
            <p className="weekly-participation">
              {isChinese
                ? `本周参与 ${weeklyParticipation} 次`
                : `${weeklyParticipation} dance${weeklyParticipation === 1 ? "" : "s"} this week`}
            </p>
            <p>
              {isChinese
                ? "只与同一种游戏方式下，自己的清晰记录比较。尚未经过临床验证。"
                : "Compares only your own clear sessions in the same mode. Not clinically validated."}
            </p>
          </div>
        )
      }
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
      {personalDataUnavailable || report.baselines === null ? null : (
        <dl className="trend-measures">
          {(Object.keys(FAMILY_LABELS) as MetricFamily[]).map((family) => (
            <div key={family}>
              <dt>{FAMILY_LABELS[family][isChinese ? 0 : 1]}</dt>
              <dd>{percent(report.baselines![family].median)}</dd>
              <dd className="trend-measures__status">
                {report.sustainedFamilies.includes(family)
                  ? isChinese
                    ? "近期重复变化"
                    : "Repeated recent change"
                  : isChinese
                    ? "没有重复变化"
                    : "No repeated change"}
              </dd>
            </div>
          ))}
        </dl>
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
      <div className="claim-boundary">
        <strong>
          {isChinese ? "这不是诊断。" : "This is not a diagnosis."}
        </strong>
        <span>
          {isChinese
            ? "舞伴不会给出认知风险、疾病概率或紧急程度。"
            : "Wǔbàn does not provide cognitive risk, disease probability, or urgency."}
        </span>
      </div>
    </StepLayout>
  );
}
