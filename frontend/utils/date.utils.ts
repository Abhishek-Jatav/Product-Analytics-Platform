/** Formats a Date as YYYY-MM-DD (what the API expects for date query params). */
export function toDateParam(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Formats a duration in seconds as e.g. "45s", "12m", "3h 20m", "2d 4h". */
export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours < 24) return remMinutes > 0 ? `${hours}h ${remMinutes}m` : `${hours}h`;

  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
}
