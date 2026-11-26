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
// A name that is already a single acronym ("NPL 2024") keeps it whole instead of "N".
function initialsOf(name: string): string {
  const words = name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word) && !/^(of|and|the|&)$/i.test(word));
  if (words.length === 1 && /^[A-Z]{2,6}$/.test(words[0])) return words[0];
  return words
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
  return year ?? "Undated";
}

// A results field ("winners", "runnersUp", …) holds one category per line, e.g.
// "MALE DOUBLES (SHADOW HUNTERS)". Returns the non-empty lines, whitespace tidied.
export function resultLines(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export const RESULT_PLACES = ["winners", "runnersUp", "secondRunnerUp"] as const;
export type ResultPlace = (typeof RESULT_PLACES)[number];

// One category of a published result. `category` is null when the lines can't be
// matched to categories, and then each place holds its lines exactly as entered.
export interface ResultRow {
  category: string | null;
  places: Record<ResultPlace, string[]>;
}

const BRACKETED = /^(.+?)\s*\(([^()]+)\)$/;
const categoryKey = (text: string) => text.toUpperCase();

// Results are typed as "CATEGORY (Team)" in most events and "Team (Category)" in a
// few. Rather than guess from the words, a side counts as the category only when
// the same values recur across places (MALE is both champion and runner-up). If
// neither side lines up, or a line has no brackets, the lines are shown as written.
export function eventResults(event: Event): ResultRow[] {
  const lines = Object.fromEntries(RESULT_PLACES.map((place) => [place, resultLines(event[place])])) as Record<
    ResultPlace,
    string[]
  >;
  const filled = RESULT_PLACES.filter((place) => lines[place].length > 0);
  if (filled.length === 0) return [];

  const split = Object.fromEntries(
    RESULT_PLACES.map((place) => [place, lines[place].map((line) => line.match(BRACKETED))]),
  ) as Record<ResultPlace, (RegExpMatchArray | null)[]>;
  const allBracketed = filled.every((place) => split[place].every(Boolean));

  // How many category values appear in at least two places, reading side 1 (outside) or 2 (inside).
  const recurring = (side: 1 | 2) => {
    const seen = new Map<string, number>();
    for (const place of filled) {
      const keys = Array.from(new Set(split[place].map((m) => categoryKey(m![side]))));
      for (const key of keys) seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    return Array.from(seen.values()).filter((count) => count > 1).length;
  };
  const outer = allBracketed && filled.length > 1 ? recurring(1) : 0;
  const inner = allBracketed && filled.length > 1 ? recurring(2) : 0;
  const side: 1 | 2 | null = outer > 0 && outer >= inner ? 1 : inner > 0 ? 2 : null;

  if (side === null) return [{ category: null, places: lines }];

  const rows = new Map<string, ResultRow>();
  for (const place of RESULT_PLACES) {
    for (const match of split[place]) {
      const category = match![side].trim();
      const entry = match![side === 1 ? 2 : 1].trim();
      const key = categoryKey(category);
      const row = rows.get(key) ?? { category, places: { winners: [], runnersUp: [], secondRunnerUp: [] } };
      row.places[place].push(entry);
      rows.set(key, row);
    }
  }
  return Array.from(rows.values());
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
