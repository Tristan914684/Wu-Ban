import type {
  CheckInNotification,
  NotificationResult,
} from "../../application/ports/check-in-notification";

export class UnavailableCheckInNotification implements CheckInNotification {
  send(): Promise<NotificationResult> {
    return Promise.resolve({ kind: "unavailable" });
  }
}

