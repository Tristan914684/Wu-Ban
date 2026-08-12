import type { Language } from "../../content/copy";
import type {
  MetricFamily,
  MetricTrendEvidence,
  TrendReport,
} from "../../domain/trend/personal-trend";

interface PersonalPatternReportProps {
  readonly language: Language;
  readonly report: TrendReport;
  readonly weeklyParticipation: number;
}

const FAMILY_LABELS: Record<MetricFamily, readonly [string, string]> = {
  beat: ["节拍", "Beat"],
  shape: ["动作方向", "Shape"],
  flow: ["接续动作", "Flow"],
  memory: ["顺序与停住", "Memory"],
};

const FAMILY_EXPLANATIONS: Record<MetricFamily, readonly [string, string]> = {
  beat: ["动作与节拍的配合", "movement timing"],
  shape: ["动作方向的辨认", "movement direction"],
  flow: ["错过后接续动作", "recovery after a missed cue"],
  memory: ["顺序与停住提示", "sequence and hold cues"],
};

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatDate(value: string, language: Language): string {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

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

function changeCopy(
  evidence: MetricTrendEvidence,
  language: Language,
): string {
  if (evidence.changeFromBaseline === null) {
    return language === "zh" ? "正在收集近期记录" : "Collecting recent sessions";
  }
  const points = Math.abs(Math.round(evidence.changeFromBaseline * 100));
  if (points === 0) {
    return language === "zh" ? "与平常相同" : "Same as usual";
  }
  const lower = evidence.changeFromBaseline < 0;
  if (language === "zh") {
    return `${lower ? "低于" : "高于"}平常 ${points} 个百分点`;
  }
  return `${points} points ${lower ? "below" : "above"} usual`;
}

function evidenceStatusCopy(
  evidence: MetricTrendEvidence,
  language: Language,
): string {
  switch (evidence.status) {
    case "collecting":
      return language === "zh" ? "近期记录仍不足" : "More recent sessions needed";
    case "within-usual-range":
      return language === "zh" ? "没有重复变化" : "No repeated change";
    case "repeated-change":
      return language === "zh" ? "已标记重复变化" : "Repeated recent change flagged";
  }
}

export function PersonalPatternReport({
  language,
  report,
  weeklyParticipation,
}: PersonalPatternReportProps) {
  const isChinese = language === "zh";
  const evidence = report.metricEvidence;
  const window = report.analysisWindow;
  const recentSessionCount = report.recentSessions.length;
  const weeksCovered =
    window === null ? 0 : Math.max(1, Math.ceil(window.dayCount / 7));
  const reportTitle = report.simulated
    ? isChinese
      ? "模拟个人模式报告"
      : "Simulated pattern report"
    : isChinese
      ? "个人模式报告"
      : "Personal pattern report";
  const flagTitle =
    report.status === "sustained-shift"
      ? isChinese
        ? "建议友好关心"
        : "Check-in suggested"
      : report.status === "usual-range"
        ? isChinese
          ? "没有标记重复模式"
          : "No repeated pattern flagged"
        : report.status === "baseline-ready"
          ? isChinese
            ? "正在观察近期模式"
            : "Monitoring the recent pattern"
          : isChinese
            ? "正在建立平常模式"
            : "Building the usual pattern";
  const flagDescription =
    report.status === "sustained-shift"
      ? isChinese
        ? `${familyList(report.sustainedFamilies, language)}在最近三次清晰游戏中至少两次出现重复变化。`
        : `${familyList(report.sustainedFamilies, language)} changed repeatedly in at least 2 of 3 recent clear sessions.`
      : report.status === "usual-range"
        ? isChinese
          ? "最近三次清晰游戏没有在两个或以上方面出现重复变化。"
          : "The last three clear sessions did not show repeated change across two or more areas."
        : report.status === "baseline-ready"
          ? isChinese
            ? `平常范围已形成；还需要 ${Math.max(0, 3 - recentSessionCount)} 次近期清晰游戏，才会标记重复模式。`
            : `The usual range is ready; ${Math.max(0, 3 - recentSessionCount)} more recent clear session${Math.max(0, 3 - recentSessionCount) === 1 ? " is" : "s are"} needed before a repeated pattern can be flagged.`
          : isChinese
            ? `还需要 ${report.sessionsNeeded} 次同一方式的清晰游戏，才会建立平常范围。`
            : `${report.sessionsNeeded} more clear session${report.sessionsNeeded === 1 ? " is" : "s are"} needed in this mode to establish a usual range.`;

  return (
    <section className="personal-pattern-report" aria-labelledby="pattern-report-title">
      <header className="personal-pattern-report__header">
        <div>
          <span>
            {report.simulated
              ? isChinese
                ? "模拟数据 · AI 辅助模式分析"
                : "SIMULATED · AI-ASSISTED PATTERN ANALYSIS"
              : isChinese
                ? "AI 辅助模式分析 · 研究原型"
                : "AI-ASSISTED PATTERN ANALYSIS · RESEARCH PROTOTYPE"}
          </span>
          <h2 id="pattern-report-title">{reportTitle}</h2>
        </div>
        <div className="personal-pattern-report__meta">
          {window === null ? null : (
            <p>
              {isChinese
                ? `${formatDate(window.startedAt, language)}至${formatDate(window.endedAt, language)} · 约 ${weeksCovered} 周`
                : `${formatDate(window.startedAt, language)} to ${formatDate(window.endedAt, language)} · about ${weeksCovered} week${weeksCovered === 1 ? "" : "s"}`}
            </p>
          )}
          <p>
            <strong data-valid-session-count>{report.validSessionCount}</strong>
            {isChinese
              ? " 次同一方式的清晰游戏进入报告"
              : ` clear session${report.validSessionCount === 1 ? "" : "s"} in this mode entered the report`}
          </p>
          <p>
            {report.simulated
              ? isChinese
                ? `真实记录本周参与 ${weeklyParticipation} 次`
                : `Real-history participation this week: ${weeklyParticipation}`
              : isChinese
                ? `本周参与 ${weeklyParticipation} 次`
                : `${weeklyParticipation} dance${weeklyParticipation === 1 ? "" : "s"} this week`}
          </p>
        </div>
      </header>

      <div
        className="pattern-flag"
        data-state={report.status}
        role="status"
      >
        <span>{isChinese ? "模式标记" : "PATTERN FLAG"}</span>
        <strong>{flagTitle}</strong>
        <p>{flagDescription}</p>
      </div>

      {evidence === null ? null : (
        <div className="pattern-evidence">
          <h3>{isChinese ? "报告观察到什么" : "What the report observed"}</h3>
          <dl>
            {(Object.keys(FAMILY_LABELS) as MetricFamily[]).map((family) => {
              const item = evidence[family];
              return (
                <div data-status={item.status} key={family}>
                  <dt>
                    <strong>{FAMILY_LABELS[family][isChinese ? 0 : 1]}</strong>
                    <span>{FAMILY_EXPLANATIONS[family][isChinese ? 0 : 1]}</span>
                  </dt>
                  <dd>
                    <span>{isChinese ? "平常中位数" : "Usual median"}</span>
                    <strong>{percent(item.baselineMedian)}</strong>
                  </dd>
                  <dd>
                    <span>
                      {isChinese
                        ? `最近 ${recentSessionCount} 次中位数`
                        : `Recent ${recentSessionCount} median`}
                    </span>
                    <strong>
                      {item.recentMedian === null ? "—" : percent(item.recentMedian)}
                    </strong>
                  </dd>
                  <dd className="pattern-evidence__finding">
                    <span>{changeCopy(item, language)}</span>
                    <strong>{evidenceStatusCopy(item, language)}</strong>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}

      <details className="pattern-method">
        <summary>{isChinese ? "这个报告如何生成？" : "How was this report generated?"}</summary>
        <p>
          {isChinese
            ? "本机 AI 先估计身体或手部关键点，透明的动作规则再形成四类游戏指标。原型把最初五次清晰游戏作为个人平常范围，并只比较同一游戏方式最近三次清晰记录。某一方面必须在三次中至少两次越过个人门槛，才会被标记；两个或以上方面被标记，才会建议关心。"
            : "On-device AI first estimates body or hand landmarks. Transparent movement rules then produce four gameplay measures. The prototype uses the first five clear sessions as the personal usual range and compares only the latest three clear sessions in the same mode. An area is flagged only when it crosses its personal threshold in at least 2 of 3 recent sessions; two or more flagged areas produce a check-in suggestion."}
        </p>
      </details>

      <div className="pattern-interpretation">
        <h3>{isChinese ? "这个标记意味着什么" : "What this flag means"}</h3>
        <p>
          {isChinese
            ? "这是游戏模式的观察，不会识别疾病，也无法解释变化原因。睡眠、情绪、不适、光线、摄像头位置和对游戏的熟悉程度都可能影响结果。"
            : "This is an observation about a gameplay pattern. It does not identify a condition or explain its cause. Sleep, mood, discomfort, lighting, camera position, and familiarity with the game can all affect the result."}
        </p>
        {report.status === "sustained-shift" ? (
          <p>
            <strong>{isChinese ? "建议下一步：" : "Suggested next step: "}</strong>
            {isChinese
              ? "先友好关心近况；如果本人或家人仍然担心，请咨询合适的专业人士。"
              : "Start with a friendly check-in. If the player or family remains concerned, speak with an appropriate qualified professional."}
          </p>
        ) : null}
      </div>
    </section>
  );
}
