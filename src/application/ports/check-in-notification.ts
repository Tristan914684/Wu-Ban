import type { AuthorisedCheckIn } from "../../domain/sharing/check-in";

export type NotificationResult =
  | { readonly kind: "sent" }
  | { readonly kind: "unavailable" }
  | { readonly kind: "failed" };

export interface CheckInNotification {
  send(command: AuthorisedCheckIn): Promise<NotificationResult>;
}

