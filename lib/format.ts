export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// For multi-day events: "Jul 29 – Aug 5, 2026". Falls back to formatDate
// when there's no end date or it's the same day as the start.
export function formatDateRange(startIso: string, endIso: string | null): string {
  if (!endIso || endIso === startIso) return formatDate(startIso);
  const start = new Date(startIso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const end = new Date(endIso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${start} – ${end}`;
}
