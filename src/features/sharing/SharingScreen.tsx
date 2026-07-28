import { useMemo, useState } from "react";

import type { SendCheckInResult } from "../../application/sharing/send-check-in";
import type { Language } from "../../content/copy";
import {
  createCheckInPreview,
} from "../../domain/sharing/check-in";
import {
  isGrantActive,
  type SupporterGrant,
} from "../../domain/sharing/supporter-grant";
import type { SessionSummary } from "../../domain/session/session-summary";
import type { TrendReport } from "../../domain/trend/personal-trend";
import {
  LocalDataNotice,
  type LocalDataStatus,
} from "../../ui/components/LocalDataNotice";
import { StepLayout } from "../../ui/components/StepLayout";
import { Button } from "../../ui/primitives/Button";

interface SharingScreenProps {
  readonly grant: SupporterGrant | null;
  readonly language: Language;
  readonly localDataStatus: LocalDataStatus;
  readonly report: TrendReport;
  readonly storedSummaries: readonly SessionSummary[];
  readonly onBack: () => void;
  readonly onDeleteHistory: () => Promise<void>;
  readonly onGrant: () => Promise<void>;
  readonly onRetryLocalData: () => void;
  readonly onRevoke: () => Promise<void>;
  readonly onSend: (message: string) => Promise<SendCheckInResult>;
}

export function SharingScreen({
  grant,
  language,
  localDataStatus,
  report,
  storedSummaries,
  onBack,
  onDeleteHistory,
  onGrant,
  onRetryLocalData,
  onRevoke,
  onSend,
}: SharingScreenProps) {
  const isChinese = language === "zh";
  const preview = useMemo(
    () => createCheckInPreview(report, language),
    [language, report],
  );
  const [editedMessage, setEditedMessage] = useState<string | null>(null);
  const [confirmingGrant, setConfirmingGrant] = useState(false);
  const [pending, setPending] = useState(false);
  const [sendResult, setSendResult] = useState<SendCheckInResult | null>(
    null,
  );
  const localDataReady = localDataStatus === "ready";
  const active = isGrantActive(grant);
  const message = editedMessage ?? preview.message;

  const send = async () => {
    setPending(true);
    setSendResult(null);
    const result = await onSend(message);
    setSendResult(result);
    setPending(false);
  };

  return (
    <StepLayout
      aside={
        <div className="sharing-status">
          <small>{isChinese ? "分享状态" : "SHARING STATUS"}</small>
          <strong>
            {!localDataReady
              ? localDataStatus === "loading"
                ? isChinese
                  ? "正在读取"
                  : "Reading"
                : isChinese
                  ? "暂时不可用"
                  : "Temporarily unavailable"
              : active
                ? isChinese
                  ? "已允许预览"
                  : "Preview grant active"
                : isChinese
                  ? "默认关闭"
                  : "Off by default"}
          </strong>
          <p>
            {!localDataReady
              ? isChinese
                ? "读取成功前不会更改许可或发送消息。"
                : "No grant changes or messages are allowed until the read succeeds."
              : isChinese
                ? "尚未连接微信收件人，因此任何按钮都不会发送外部消息。"
                : "No WeChat recipient is connected, so no action can send an external message."}
          </p>
        </div>
      }
      description={
        <p>
          {isChinese
            ? "摄像头处理与家人分享是两件不同的事。你可以单独允许，也可以随时撤销。"
            : "Camera processing and family sharing are separate. You can grant this purpose on its own and revoke it at any time."}
        </p>
      }
      eyebrow={isChinese ? "§ 隐私与分享" : "§ PRIVACY AND SHARING"}
      title={isChinese ? "由你决定谁能看到。" : "You decide who can see."}
    >
      {report.simulated ? (
        <div className="simulation-notice" role="status">
          <strong>{isChinese ? "模拟数据" : "SIMULATED DATA"}</strong>
          <span>
            {isChinese
              ? "这份消息只能预览，不能发送。"
              : "This message can be previewed only and cannot be sent."}
          </span>
        </div>
      ) : null}
      <LocalDataNotice
        language={language}
        onRetry={onRetryLocalData}
        status={localDataStatus}
      />
      <section className="sharing-scope" aria-labelledby="sharing-scope-title">
        <h2 id="sharing-scope-title">
          {isChinese ? "允许查看的内容" : "What this grant covers"}
        </h2>
        <ul>
          <li>
            {isChinese
              ? "同一种游戏方式的平常范围与近期变化"
              : "Usual range and recent change for the same play mode"}
          </li>
          <li>
            {isChinese
              ? "数据是否清晰，以及可能影响结果的原因"
              : "Whether data was clear and what else may affect it"}
          </li>
          <li>
            {isChinese
              ? "一段友好问候的预览"
              : "A preview of a friendly check-in"}
          </li>
        </ul>
        <p>
          {isChinese
            ? "不会分享视频、照片、关键点、欢乐分、疾病风险或紧急程度。"
            : "Video, photos, landmarks, fun score, disease risk, and urgency are never shared."}
        </p>
      </section>
      {localDataReady ? (
        <details className="local-record-inspector">
          <summary>
            {isChinese
              ? `查看本机保存的字段与记录（${storedSummaries.length}）`
              : `View exact local fields and records (${storedSummaries.length})`}
          </summary>
          <p>
            {isChinese
              ? "每条记录只包含游戏摘要：时间、方式、版本、欢乐分、四类汇总指标、清晰度、参与状态、排除原因和模拟标记。"
              : "Each record contains only a gameplay summary: time, mode, versions, fun score, four aggregate measures, validity, participation, exclusion reasons, and the simulation flag."}
          </p>
          {storedSummaries.length === 0 ? (
            <p>
              {isChinese
                ? "本机还没有游戏记录。"
                : "No local gameplay records yet."}
            </p>
          ) : (
            storedSummaries.map((summary) => (
              <article key={summary.sessionId}>
                <h3>
                  {summary.mode === "standing"
                    ? isChinese
                      ? "站立舞步"
                      : "Standing"
                    : isChinese
                      ? "坐姿手势"
                      : "Seated"}{" "}
                  · {new Date(summary.completedAt).toLocaleString(language)}
                </h3>
                <pre>{JSON.stringify(summary, null, 2)}</pre>
              </article>
            ))
          )}
          <strong>
            {isChinese
              ? "这里不会出现视频、照片、声音或关键点帧。"
              : "Video, photos, audio, and landmark frames never appear here."}
          </strong>
        </details>
      ) : null}
      {!localDataReady ? null : active ? (
        <div className="grant-actions">
          <div className="status-message" role="status">
            {isChinese
              ? "你已允许“趋势摘要与友好问候”用途。"
              : "You granted the trend-summary and friendly-check-in purpose."}
          </div>
          <Button
            onClick={() => {
              void onRevoke();
            }}
            variant="secondary"
          >
            {isChinese ? "撤销未来分享" : "Revoke future sharing"}
          </Button>
        </div>
      ) : confirmingGrant ? (
        <div className="grant-confirmation">
          <strong>
            {isChinese
              ? "这是独立的分享许可。"
              : "This is a separate sharing permission."}
          </strong>
          <p>
            {isChinese
              ? "当前只建立本机预览许可。连接真实收件人仍需要你之后在微信测试环境再次确认。"
              : "This creates a local preview grant only. Connecting a real recipient will require another confirmation in the WeChat test environment."}
          </p>
          <div className="action-row">
            <Button
              onClick={() => {
                void onGrant();
                setConfirmingGrant(false);
              }}
            >
              {isChinese ? "我允许这个用途" : "Grant this purpose"}
            </Button>
            <Button
              onClick={() => {
                setConfirmingGrant(false);
              }}
              variant="quiet"
            >
              {isChinese ? "暂不允许" : "Not now"}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => {
            setConfirmingGrant(true);
          }}
        >
          {isChinese ? "选择一位信任的人" : "Choose someone I trust"}
        </Button>
      )}
      {localDataReady ? (
        <section
          className="message-preview"
          aria-labelledby="message-preview-title"
        >
          <p className="eyebrow">
            {isChinese
              ? "消息预览 · 尚未发送"
              : "MESSAGE PREVIEW · NOT SENT"}
          </p>
          <h2 id="message-preview-title">{preview.title}</h2>
          <label htmlFor="check-in-message">
            {isChinese ? "可编辑文字" : "Editable message"}
          </label>
          <textarea
            id="check-in-message"
            onChange={(event) => {
              setEditedMessage(event.currentTarget.value);
            }}
            rows={6}
            value={message}
          />
          <Button
            disabled={
              !active ||
              pending ||
              report.simulated ||
              report.status !== "sustained-shift"
            }
            onClick={() => {
              void send();
            }}
          >
            {pending
              ? isChinese
                ? "正在检查许可…"
                : "Checking permission…"
              : isChinese
                ? "在微信测试通道发送"
                : "Send through WeChat test channel"}
          </Button>
          <p className="supporting-copy">
            {report.status !== "sustained-shift"
              ? isChinese
                ? "只有原型规则出现重复变化时，发送操作才会启用。消息仍可预览。"
                : "Sending is enabled only after the prototype rule finds a repeated change. The message remains previewable."
              : isChinese
                ? "当前未配置测试通道；尝试发送会安全地显示“不可用”，不会联系任何人。"
                : "No test transport is configured. A send attempt safely reports unavailable and contacts nobody."}
          </p>
          {sendResult === null ? null : (
            <div className="status-message" role="status">
              {sendResult.kind === "unavailable"
                ? isChinese
                  ? "没有发送：微信测试通道尚未配置。"
                  : "Not sent: the WeChat test channel is not configured."
                : sendResult.kind === "blocked"
                  ? isChinese
                    ? "没有发送：分享许可或数据来源不允许。"
                    : "Not sent: the grant or data source does not allow it."
                  : sendResult.kind === "sent"
                    ? isChinese
                      ? "测试消息已发送。"
                      : "Test message sent."
                    : isChinese
                      ? "没有发送：测试通道返回失败。"
                      : "Not sent: the test channel failed."}
            </div>
          )}
        </section>
      ) : null}
      {localDataReady ? (
        <div className="privacy-actions">
          <Button
            onClick={() => {
              void onDeleteHistory();
            }}
            variant="secondary"
          >
            {isChinese ? "删除本机游戏记录" : "Delete local game history"}
          </Button>
          <p>
            {isChinese
              ? "删除游戏记录与撤销分享是两个独立操作。"
              : "Deleting game history and revoking sharing are separate actions."}
          </p>
        </div>
      ) : null}
      <Button onClick={onBack} variant="quiet">
        {isChinese ? "返回我的节奏" : "Back to My rhythm"}
      </Button>
      <div className="claim-boundary">
        <strong>
          {isChinese ? "这不是健康警报。" : "This is not a health alert."}
        </strong>
        <span>
          {isChinese
            ? "舞伴不会判断疾病或紧急程度。"
            : "Wǔbàn does not determine disease or urgency."}
        </span>
      </div>
    </StepLayout>
  );
}
