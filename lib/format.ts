export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// "2013" from "2013-02-10". Read straight from the string so a date-only value
// can never roll back to the previous year in a negative-UTC-offset timezone.
export function formatYear(iso: string): string {
  return iso.slice(0, 4);
}

// For multi-day events: "Jul 29 – Aug 5, 2026". Falls back to formatDate
// when there's no end date or it's the same day as the start.
function formatDateRange(startIso: string, endIso: string | null): string {
  if (!endIso || endIso === startIso) return formatDate(startIso);
  const start = new Date(startIso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const end = new Date(endIso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${start} – ${end}`;
}

// An event's date for display: "2013" when only the year is known, the full
// date (or range, when `withRange`) otherwise, and null when the date is unknown.
export function formatEventDate(
  event: { date: string | null; endDate: string | null; yearOnly: boolean },
  { withRange = false } = {},
): string | null {
  if (!event.date) return null;
  if (event.yearOnly) return formatYear(event.date);
  return withRange ? formatDateRange(event.date, event.endDate) : formatDate(event.date);
}
