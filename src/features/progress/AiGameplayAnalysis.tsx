import type { Language } from "../../content/copy";
import type {
  MetricFamily,
  TrendReport,
} from "../../domain/trend/personal-trend";

interface AiGameplayAnalysisProps {
  readonly language: Language;
  readonly report: TrendReport;
}

const FAMILY_LABELS: Record<MetricFamily, readonly [string, string]> = {
  beat: ["节拍", "Beat"],
  shape: ["动作方向", "Shape"],
  flow: ["接续动作", "Flow"],
  memory: ["顺序与停住", "Memory"],
};

function familyList(
  families: readonly MetricFamily[],
  language: Language,
): string {
  const labels = families.map(
    (family) => FAMILY_LABELS[family][language === "zh" ? 0 : 1],
  );
  if (language === "zh") {
    return labels.join("和");
  }
  if (labels.length <= 1) {
    return labels[0] ?? "";
  }
  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}

export function AiGameplayAnalysis({
  language,
  report,
}: AiGameplayAnalysisProps) {
  const isChinese = language === "zh";
  const result =
    report.performanceTrend === "declined"
      ? isChinese
        ? "下降"
        : "Declined"
      : report.performanceTrend === "improving"
        ? isChinese
          ? "改善"
          : "Improving"
        : isChinese
          ? "稳定"
          : "Stable";
  const description =
    report.performanceTrend === "declined"
      ? isChinese
        ? `${familyList(report.sustainedFamilies, language)}在最近的清晰游戏中重复低于平常范围。`
        : `${familyList(report.sustainedFamilies, language)} repeatedly moved below your usual range in recent clear sessions.`
      : report.performanceTrend === "improving"
        ? isChinese
          ? `${familyList(report.improvingFamilies, language)}在最近的清晰游戏中重复高于平常范围。`
          : `${familyList(report.improvingFamilies, language)} repeatedly moved above your usual range in recent clear sessions.`
        : isChinese
          ? "现有游戏记录没有显示重复的整体变化。"
          : "Your available gameplay history does not show a repeated overall change.";
  const sessionCount = isChinese
    ? `已在本机分析 ${report.validSessionCount} 次清晰游戏`
    : `${report.validSessionCount} clear session${report.validSessionCount === 1 ? "" : "s"} analyzed locally`;

  return (
    <section
      aria-labelledby="ai-gameplay-result"
      className="ai-gameplay-analysis"
      data-trend={report.performanceTrend}
    >
      <header className="ai-gameplay-analysis__header">
        <div className="ai-gameplay-analysis__label">
          {report.simulated ? (
            <span className="ai-gameplay-analysis__simulation">
              {isChinese ? "模拟" : "SIMULATED"}
            </span>
          ) : null}
          <span>{isChinese ? "AI 辅助游戏历史" : "AI-ASSISTED GAMEPLAY HISTORY"}</span>
        </div>
        <p className="ai-gameplay-analysis__process">
          <span aria-hidden="true" />
          {isChinese
            ? "正在使用本机 AI 分析你的表现"
            : "Using on-device AI to analyze your performance"}
        </p>
      </header>

      <div
        aria-atomic="true"
        aria-live="polite"
        className="ai-gameplay-analysis__result"
        role="status"
      >
        <span>{isChinese ? "游戏趋势" : "GAMEPLAY TREND"}</span>
        <strong id="ai-gameplay-result">{result}</strong>
        <p>{description}</p>
      </div>

      <footer className="ai-gameplay-analysis__footer">
        <strong>{sessionCount}</strong>
        <span>
          {isChinese
            ? "关键点 AI + 本机趋势规则"
            : "Landmark AI + local trend rule"}
        </span>
      </footer>
    </section>
  );
}
