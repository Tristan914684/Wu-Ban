import type { SessionMeasures } from "../scoring/session-score";

export type SessionExclusionReason =
  | "insufficient-scoreable-input"
  | "interrupted"
  | "clock-error"
  | "self-reported-context";

export interface SessionValidity {
  readonly validForTrend: boolean;
  readonly participationCredit: boolean;
  readonly exclusionReasons: readonly SessionExclusionReason[];
}

export function evaluateSessionValidity(input: {
  readonly measures: SessionMeasures;
  readonly completed: boolean;
  readonly clockHealthy: boolean;
  readonly contextConfounder: boolean;
  readonly participated?: boolean;
}): SessionValidity {
  const exclusionReasons: SessionExclusionReason[] = [];
  if (input.measures.scoreableRatio < 0.8) {
    exclusionReasons.push("insufficient-scoreable-input");
  }
  if (!input.completed) {
    exclusionReasons.push("interrupted");
  }
  if (!input.clockHealthy) {
    exclusionReasons.push("clock-error");
  }
  if (input.contextConfounder) {
    exclusionReasons.push("self-reported-context");
  }

  return {
    validForTrend: exclusionReasons.length === 0,
    participationCredit: input.participated ?? true,
    exclusionReasons,
  };
}
