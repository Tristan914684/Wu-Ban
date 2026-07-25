import type { Language } from "../../content/copy";
import type { CameraEvidenceReport } from "../../application/performance/camera-evidence-report";
import type { SessionSummary } from "../../domain/session/session-summary";
import { Button } from "../../ui/primitives/Button";
import { StepLayout } from "../../ui/components/StepLayout";

interface ResultScreenProps {
  readonly language: Language;
  readonly summary: SessionSummary;
  readonly diagnosticReport?: CameraEvidenceReport | null;
  readonly onFinish: () => void;
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function ResultScreen({
  language,
  summary,
  diagnosticReport = null,
  onFinish,
}: ResultScreenProps) {
  const isChinese = language === "zh";
  const valid = summary.validity.validForTrend;
  const contextExcluded = summary.validity.exclusionReasons.includes(
    "self-reported-context",
  );

  return (
    <StepLayout
      aside={
        <div className="result-score">
          <small>{isChinese ? "欢乐分" : "FUN SCORE"}</small>
          <strong>{summary.score.funScore}</strong>
          <span>/ 1000</span>
        </div>
      }
      description={
        <p>
          {valid
            ? isChinese
              ? "这是一局清晰的动作与注意力记录，可以加入你的个人平常模式。"
              : "This was a clear movement-and-attention session and can join your personal usual pattern."
            : contextExcluded
              ? isChinese
                ? "欢乐分和参与记录已保留。因为你说今天有些不同，这一局不会加入个人平常范围。"
                : "Your game result and participation are saved. Because today felt different, this session will not shape your personal usual range."
            : isChinese
              ? "你完成了这一局，但有些片段看不清，所以不会加入个人平常模式。"
              : "You completed the session, but some input was unclear, so it will not join your usual pattern."}
        </p>
      }
      eyebrow={isChinese ? "§ 11 — 本局结果" : "§ 11 — SESSION RESULT"}
      title={
        <>
          {isChinese ? "完成比满分" : "Finishing matters"}
          <em>{isChinese ? "更重要。" : "more than perfect."}</em>
        </>
      }
    >
      {summary.simulated ? (
        <div className="simulation-notice" role="status">
          <strong>{isChinese ? "模拟演示" : "SIMULATED"}</strong>
          <span>
            {isChinese
              ? "此结果来自预制关键点，只用于演示，不是个人表现。"
              : "This result uses authored landmarks for demonstration and is not personal performance."}
          </span>
        </div>
      ) : null}
      <dl className="result-measures">
        <div>
          <dt>{isChinese ? "跟上节拍" : "Beat"}</dt>
          <dd>{percent(summary.score.measures.beatAccuracy)}</dd>
        </div>
        <div>
          <dt>{isChinese ? "动作方向" : "Shape"}</dt>
          <dd>{percent(summary.score.measures.shapeAccuracy)}</dd>
        </div>
        <div>
          <dt>{isChinese ? "继续下一步" : "Flow"}</dt>
          <dd>{percent(summary.score.measures.flowRecovery)}</dd>
        </div>
        <div>
          <dt>{isChinese ? "记住停住" : "Memory"}</dt>
          <dd>{percent(summary.score.measures.memoryControl)}</dd>
        </div>
      </dl>
      <div className="claim-boundary">
        <strong>
          {isChinese ? "这不是诊断。" : "This is not a diagnosis."}
        </strong>
        <span>
          {isChinese
            ? "睡眠、光线、心情和熟悉程度都会影响一局表现。"
            : "Sleep, lighting, mood, and familiarity can all affect one session."}
        </span>
      </div>
      {diagnosticReport === null ? null : (
        <details className="local-record-inspector" open>
          <summary>DEV-ONLY CAMERA EVIDENCE — NOT YET HUMAN-VALIDATED</summary>
          <p>
            Aggregate cue outcomes and session performance only. This report
            contains no video, photos, audio, cue IDs, per-frame timings,
            landmarks, or saved trace. Record the device, browser,
            environment, and tester count separately before adding this JSON
            to M1 evidence.
          </p>
          <pre data-testid="camera-evidence-json">
            {JSON.stringify(diagnosticReport, null, 2)}
          </pre>
        </details>
      )}
      <Button onClick={onFinish}>
        {isChinese ? "回到首页" : "Return home"}
      </Button>
    </StepLayout>
  );
}
