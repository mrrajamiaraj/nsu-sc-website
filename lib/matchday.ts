import { eventResults, registrationState, todayInDhaka } from "@/lib/events";
import { oneLine } from "@/lib/home";
import { eventSlug } from "@/lib/events-hub";
import type { Event, EventStatus } from "@/lib/types";

// Plain data for the homepage "Matchday board" (a client component), built on the server.

export type BoardStatus = "live" | "upcoming" | "finished";

export interface BoardChampion {
  category: string; // sentence case: "Male doubles"
  names: string; // "Shadow Hunters"
}

export interface BoardEvent {
  id: string;
  name: string;
  status: BoardStatus;
  /** What the board's date column shows: "06 OCT", "2026" when only the year is known, or "TBA". */
  dateLabel: string;
  /** Start of the event day in Dhaka, for the countdown; null when the exact day isn't known. */
  startsAt: string | null;
  venue: string | null;
  poster: string | null;
  champions: BoardChampion[];
  registerUrl: string | null;
  /** Live events: one line on where things stand. */
  stage: string | null;
  href: string;
}

const STATUS: Record<EventStatus, BoardStatus> = { Running: "live", Upcoming: "upcoming", Finished: "finished" };

// Results and venues are often typed in capitals; show them as names ("Shadow Hunters").
const ACRONYMS = new Set(["NSU", "NSUSC", "SC", "BD", "ULAB", "BUET", "IUB", "DU", "AIUB", "BRAC", "NBL", "BBA", "CSE", "EEE", "ECE", "MBA"]);
export function titleCase(text: string): string {
  if (/[a-z]/.test(text)) return text;
  return text
    .split(/(\s+)/)
    .map((word) => (ACRONYMS.has(word) ? word : word.charAt(0) + word.slice(1).toLowerCase()))
    .join("");
}
function sentenceCase(text: string): string {
  const lower = text.toLowerCase().replace(/^mix\b/, "mixed");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function dateLabel(event: Event): string {
  if (!event.date) return "TBA";
  if (event.yearOnly) return event.date.slice(0, 4);
  return new Date(`${event.date}T00:00:00+06:00`)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "Asia/Dhaka" })
    .toUpperCase();
}

function toBoard(event: Event, today: string): BoardEvent {
  const status = STATUS[event.status];
  const champions = eventResults(event)
    .map((row) => ({
      category: row.category ? sentenceCase(row.category) : "Champion",
      names: row.places.winners.map(titleCase).join(", "),
    }))
    .filter((row) => row.names);
  const stage =
    status === "live"
      ? [event.matchCount ? `${event.matchCount} matches on the card` : null, oneLine(event.description, 90) || null]
          .filter(Boolean)
          .join(" · ") || "Matches under way"
      : null;

  return {
    id: event.id,
    name: event.name,
    status,
    dateLabel: dateLabel(event),
    startsAt: status === "upcoming" && event.date && !event.yearOnly ? `${event.date}T00:00:00+06:00` : null,
    venue: event.venue ? titleCase(event.venue) : null,
    poster: event.bannerImage ?? event.gallery[0] ?? null,
    champions,
    registerUrl: registrationState(event, today) === "open" ? event.registrationUrl : null,
    stage,
    href: `/events/${eventSlug(event)}`,
  };
}

// Live first, then upcoming (soonest first), then the latest finished events, up to `limit`.
// The admin's featured event opens the board when it's on it.
export function boardEvents(
  grouped: Record<EventStatus, Event[]>,
  featured: Event | null,
  limit = 5,
): { events: BoardEvent[]; initial: number } {
  const today = todayInDhaka();
  const picked = [...grouped.Running, ...grouped.Upcoming, ...grouped.Finished].slice(0, limit);
  const events = picked.map((event) => toBoard(event, today));
  const initial = featured ? Math.max(0, events.findIndex((event) => event.id === featured.id)) : 0;
  return { events, initial };
}
