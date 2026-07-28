import type { CheckInNotification } from "../ports/check-in-notification";
import type {
  CheckInAuditResult,
  SharingRepository,
} from "../ports/sharing-repository";
import { authoriseCheckIn } from "../../domain/sharing/check-in";
import type { TrendReport } from "../../domain/trend/personal-trend";

export type SendCheckInResult =
  | { readonly kind: "blocked"; readonly reason: string }
  | { readonly kind: "sent"; readonly duplicate: boolean }
  | { readonly kind: "unavailable"; readonly duplicate: boolean }
  | { readonly kind: "failed"; readonly duplicate: boolean };

function resultFromAudit(
  result: CheckInAuditResult,
  duplicate: boolean,
): SendCheckInResult {
  return { kind: result, duplicate };
}

export async function sendCheckIn(input: {
  readonly report: TrendReport;
  readonly editedMessage: string;
  readonly repository: SharingRepository;
  readonly notification: CheckInNotification;
  readonly attemptedAt: string;
}): Promise<SendCheckInResult> {
  const grant = await input.repository.latestGrant();
  const authorisation = authoriseCheckIn(
    input.report,
    grant,
    input.editedMessage,
  );
  if (authorisation.kind === "blocked") {
    return authorisation;
  }

  const existing = await input.repository.findAudit(
    authorisation.command.commandId,
  );
  if (existing !== null) {
    return resultFromAudit(existing.result, true);
  }

  const confirmedAuthorisation = authoriseCheckIn(
    input.report,
    await input.repository.latestGrant(),
    input.editedMessage,
  );
  if (confirmedAuthorisation.kind === "blocked") {
    return confirmedAuthorisation;
  }
  if (
    confirmedAuthorisation.command.commandId !==
      authorisation.command.commandId ||
    confirmedAuthorisation.command.supporterBindingId !==
      authorisation.command.supporterBindingId
  ) {
    return { kind: "blocked", reason: "sharing-changed" };
  }

  const providerResult = await input.notification.send(
    confirmedAuthorisation.command,
  );
  await input.repository.saveAudit({
    schemaVersion: 1,
    commandId: confirmedAuthorisation.command.commandId,
    grantId: confirmedAuthorisation.command.grantId,
    trendEventId: confirmedAuthorisation.command.trendEventId,
    attemptedAt: input.attemptedAt,
    result: providerResult.kind,
  });
  return resultFromAudit(providerResult.kind, false);
}
