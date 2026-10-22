import { formatYear } from "@/lib/format";
import type { Event, EventSeries, EventStatus } from "@/lib/types";

// A series with its seasons. Events without a series stand alone as a one-season group.
export interface EventGroup {
  key: string;
  series: EventSeries | null;
  name: string;
  abbreviation: string;
  sport: string | null;
  seasons: Event[]; // oldest first
  latest: Event;
}

// "NSU World Cup Fiesta 2026" -> "NWCF": initials, skipping years and connecting words.
function initialsOf(name: string): string {
  return name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word) && !/^(of|and|the|&)$/i.test(word))
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 5);
}

function sortKey(event: Event): number {
  return event.date ? new Date(event.date).getTime() : Number.NEGATIVE_INFINITY;
}

function bySeason(a: Event, b: Event): number {
  if (a.seasonNumber && b.seasonNumber && a.seasonNumber !== b.seasonNumber) return a.seasonNumber - b.seasonNumber;
  return sortKey(a) - sortKey(b);
}

export function groupEvents(events: Event[], series: EventSeries[]): EventGroup[] {
  const seriesById = new Map(series.map((s) => [s.id, s]));
  const groups = new Map<string, EventGroup>();

  for (const event of events) {
    const s = event.seriesId ? seriesById.get(event.seriesId) ?? null : null;
    const key = s ? s.id : event.id;
    const group = groups.get(key);
    if (group) {
      group.seasons.push(event);
    } else {
      groups.set(key, {
        key,
        series: s,
        name: s?.name ?? event.name,
        abbreviation: s?.abbreviation ?? initialsOf(event.name),
        sport: s?.sport ?? null,
        seasons: [event],
        latest: event,
      });
    }
  }

  return Array.from(groups.values()).map((group) => {
    const seasons = [...group.seasons].sort(bySeason);
    return { ...group, seasons, latest: seasons[seasons.length - 1] };
  });
}

export function eventYear(event: Event): string | null {
  return event.date ? formatYear(event.date) : null;
}

// "S1 · 2026", "S1", "2026", or null when neither is known.
export function seasonLabel(event: Event): string | null {
  const parts = [event.seasonNumber ? `S${event.seasonNumber}` : null, eventYear(event)].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

// "Season 1 (2026)" for breadcrumbs and switchers.
export function seasonTitle(event: Event): string {
  const year = eventYear(event);
  if (event.seasonNumber) return year ? `Season ${event.seasonNumber} (${year})` : `Season ${event.seasonNumber}`;
  return year ?? "Season";
}

export type RegistrationState = "open" | "not-open" | "closed";

// Compares ISO dates as strings (YYYY-MM-DD) against today's date in Dhaka.
export function registrationState(event: Event, today: string): RegistrationState {
  if (event.status === "Finished") return "closed";
  if (event.registrationDeadline && today > event.registrationDeadline) return "closed";
  if (event.registrationOpens && today < event.registrationOpens) return "not-open";
  return event.registrationUrl ? "open" : "not-open";
}

export function todayInDhaka(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

const STATUS_ORDER: Record<EventStatus, number> = { Running: 0, Upcoming: 1, Finished: 2 };

// Live first, then upcoming (soonest first), then everything else newest first.
export function compareForCarousel(a: Event, b: Event): number {
  if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  return sortKey(a) - sortKey(b);
}
