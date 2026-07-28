import type { SessionSummary } from "./session-summary";

function startOfLocalWeek(now: Date): Date {
  const start = new Date(now);
  const dayFromMonday = (start.getDay() + 6) % 7;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - dayFromMonday);
  return start;
}

export function sessionsThisWeek(
  summaries: readonly SessionSummary[],
  now = new Date(),
): number {
  const weekStart = startOfLocalWeek(now).getTime();
  const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1_000;

  return summaries.filter((summary) => {
    const completedAt = new Date(summary.completedAt).getTime();
    return (
      !summary.simulated &&
      summary.validity.participationCredit &&
      Number.isFinite(completedAt) &&
      completedAt >= weekStart &&
      completedAt < weekEnd
    );
  }).length;
}
