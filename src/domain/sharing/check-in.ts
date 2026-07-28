import type { Language } from "../../content/copy";
import type {
  MetricFamily,
  TrendReport,
} from "../trend/personal-trend";
import type { SupporterGrant } from "./supporter-grant";
import { isGrantActive } from "./supporter-grant";

export const CHECK_IN_TEMPLATE_VERSION = 1 as const;

export interface CheckInPreview {
  readonly templateVersion: typeof CHECK_IN_TEMPLATE_VERSION;
  readonly trendEventId: string;
  readonly simulated: boolean;
  readonly title: string;
  readonly message: string;
}

export interface AuthorisedCheckIn {
  readonly commandId: string;
  readonly grantId: string;
  readonly supporterBindingId: string;
  readonly trendEventId: string;
  readonly templateVersion: typeof CHECK_IN_TEMPLATE_VERSION;
  readonly simulated: boolean;
  readonly message: string;
}

export type CheckInAuthorisation =
  | { readonly kind: "authorised"; readonly command: AuthorisedCheckIn }
  | {
      readonly kind: "blocked";
      readonly reason:
        | "sharing-inactive"
        | "simulated-preview-only"
        | "no-sustained-shift";
    };

function familiesCopy(
  families: readonly MetricFamily[],
  language: Language,
): string {
  const names: Record<MetricFamily, readonly [string, string]> = {
    beat: ["节拍", "timing"],
    shape: ["动作方向", "movement direction"],
    flow: ["接续动作", "movement flow"],
    memory: ["顺序与停住", "sequence and holds"],
  };
  return families
    .map((family) => names[family][language === "zh" ? 0 : 1])
    .join(language === "zh" ? "和" : " and ");
}

export function createCheckInPreview(
  report: TrendReport,
  language: Language,
): CheckInPreview {
  const changed =
    report.sustainedFamilies.length === 0
      ? language === "zh"
        ? "最近的清晰游戏记录还没有形成持续变化。"
        : "Recent clear game sessions do not yet show a sustained change."
      : language === "zh"
        ? `最近三次清晰游戏中，${familiesCopy(report.sustainedFamilies, language)}有两次低于平常范围。`
        : `In two of the last three clear sessions, ${familiesCopy(report.sustainedFamilies, language)} were outside the usual range.`;
  const uncertainty =
    language === "zh"
      ? "疲劳、不适、光线或对游戏不熟悉等很多原因都可能影响结果。"
      : "Tiredness, discomfort, lighting, or unfamiliarity with the game can all affect the result.";
  const action =
    language === "zh"
      ? "可以找个轻松的时间友好地问候一下。舞伴不会诊断健康状况。"
      : "Consider a friendly check-in at a comfortable time. Wǔbàn does not diagnose a health condition.";

  return {
    templateVersion: CHECK_IN_TEMPLATE_VERSION,
    trendEventId: report.eventId,
    simulated: report.simulated,
    title:
      language === "zh"
        ? "来自舞伴的一次友好问候"
        : "A friendly check-in from Wǔbàn",
    message: `${changed} ${uncertainty} ${action}`,
  };
}

export function authoriseCheckIn(
  report: TrendReport,
  grant: SupporterGrant | null,
  editedMessage: string,
): CheckInAuthorisation {
  if (!isGrantActive(grant)) {
    return { kind: "blocked", reason: "sharing-inactive" };
  }
  if (report.simulated) {
    return { kind: "blocked", reason: "simulated-preview-only" };
  }
  if (report.status !== "sustained-shift") {
    return { kind: "blocked", reason: "no-sustained-shift" };
  }
  return {
    kind: "authorised",
    command: {
      commandId: `check-in-v1:${report.eventId}:${grant.grantId}`,
      grantId: grant.grantId,
      supporterBindingId: grant.supporterBindingId,
      trendEventId: report.eventId,
      templateVersion: CHECK_IN_TEMPLATE_VERSION,
      simulated: false,
      message: editedMessage,
    },
  };
}
