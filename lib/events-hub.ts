import { slugify } from "@/lib/squads";
import { eventResults, resultLines, todayInDhaka } from "@/lib/events";
import type { Event } from "@/lib/types";

// "Matchday Central": every event the club has run, classified and with a status worked out
// from its dates (never the stored flag alone). Sport, type and the short code aren't stored
// yet, so they're classified here by event id from each event's own write-up; a new event
// that isn't listed falls back to reading its name.

export type SportKey = "football" | "futsal" | "cricket" | "basketball" | "badminton" | "table-tennis" | "chess-carrom" | "volleyball" | "multi-sport";
export type TypeKey = "intra" | "inter-batch" | "inter-university" | "festival";
export type HubStatus = "upcoming" | "registration-open" | "live" | "finished";

export const SPORTS: { key: SportKey; label: string; icon: string }[] = [
  { key: "football", label: "Football", icon: "Football" },
  { key: "futsal", label: "Futsal", icon: "Futsal" },
  { key: "cricket", label: "Cricket", icon: "Cricket" },
  { key: "basketball", label: "Basketball", icon: "Basketball" },
  { key: "badminton", label: "Badminton", icon: "Badminton" },
  { key: "table-tennis", label: "Table tennis", icon: "Table Tennis" },
  { key: "chess-carrom", label: "Chess & carrom", icon: "Chess" },
  { key: "volleyball", label: "Volleyball", icon: "Volleyball" },
  { key: "multi-sport", label: "Multi-sport", icon: "Trophy" },
];
export const TYPES: { key: TypeKey; label: string }[] = [
  { key: "intra", label: "Intra-NSU" },
  { key: "inter-batch", label: "Inter-batch" },
  { key: "inter-university", label: "Inter-university" },
  { key: "festival", label: "Festivals" },
];
export const sportLabel = (key: SportKey | null) => SPORTS.find((s) => s.key === key)?.label ?? null;
export const sportIcon = (key: SportKey | null) => SPORTS.find((s) => s.key === key)?.icon ?? "Trophy";
export const typeLabel = (key: TypeKey | null) => TYPES.find((t) => t.key === key)?.label ?? null;

type Class = { sport: SportKey | null; type: TypeKey | null; code: string };

// From each event's description. Where the write-up doesn't say (the two "Premier League"
// events, Khar Nights), the sport is left unset rather than guessed.
const CLASSIFIED: Record<string, Class> = {
  "a7dfeee3-fdb6-4c20-a2f1-1530aa61fe1d": { sport: "chess-carrom", type: "intra", code: "NCC'26" },
  "882397d2-9114-46da-8c66-69669e3f79d3": { sport: "basketball", type: "intra", code: "NBL'26" },
  "2e3351cf-8e53-4abb-a294-ea7b857c9d3b": { sport: "futsal", type: "festival", code: "NWCF'26" },
  "88b259f3-94e1-4c1e-9758-f2df36efa57c": { sport: null, type: "festival", code: "KHAR'26" },
  "df1cef59-2055-4aa3-8e02-167f870d3572": { sport: "cricket", type: "inter-batch", code: "NIBCT'26" },
  "89f78f92-ac32-4b12-8c9a-5066e5698643": { sport: "football", type: "inter-batch", code: "NIBFT'26" },
  "d3c8c809-a75c-45a8-b2f2-460ee269a1db": { sport: "badminton", type: "intra", code: "NSM'26" },
  "7efd149d-6590-4c0d-a982-2f920e06d8d5": { sport: "cricket", type: "inter-university", code: "CUCC'25" },
  "f9d59994-eacf-4f0a-a0c0-8a21952f9682": { sport: "football", type: "intra", code: "NIFT'25" },
  "cda575f3-ea23-444e-aaa9-c1181b0f560f": { sport: "football", type: "intra", code: "AMFT'25" },
  "2b1ab162-e004-43df-a942-09f9dec5cd13": { sport: "football", type: "intra", code: "NFL'24" },
  "e2707aed-70f3-4ad9-9af7-0f2d8db5dba5": { sport: null, type: "intra", code: "NPL'24" },
  "a139e080-6c4b-4a06-b1b5-6299a3d8a81c": { sport: "multi-sport", type: "inter-university", code: "NSC'23" },
  "1423df26-350d-490f-b02a-6e5c2b701a51": { sport: "basketball", type: "inter-university", code: "BIUSC-B'22" },
  "595e6d1c-c988-49ad-abc2-246c1c4bbf4f": { sport: "multi-sport", type: "inter-university", code: "BIUSC'22" },
  "064d3141-e7c9-41cf-8fb2-aeeeb0cb3a48": { sport: "football", type: "intra", code: "NFL'22" },
  "1962facf-ba27-44db-a05f-e9b311c7659f": { sport: "cricket", type: "intra", code: "NCL'22" },
  "ecd7189d-998f-4a55-90ca-9a4cafb28bbf": { sport: "badminton", type: "intra", code: "NSM'17" },
  "2828a1dd-aeef-43e6-ab03-d8a8a8d1488a": { sport: "football", type: "intra", code: "IFT'13" },
  "30294797-0a45-4b29-853b-32978a49a1b4": { sport: "futsal", type: "inter-university", code: "IUF'13" },
  "3578ebcf-6b5d-43af-9892-a2cbab490c52": { sport: null, type: "intra", code: "NPL'13" },
  "3d8c3770-f424-4d17-bbe8-322db778338e": { sport: "table-tennis", type: "intra", code: "ITT'12" },
  "058046df-dc69-49a5-a2c3-4306f74644b9": { sport: "cricket", type: "intra", code: "ICT'12" },
  "85503255-e1bb-4978-a536-cbde3c15fb6e": { sport: "football", type: "intra", code: "IFT'12" },
  "280d7ebe-267d-4a38-acca-1c5097d64acc": { sport: "multi-sport", type: "festival", code: "CC'12" },
  "9f31c277-df67-4236-b5a8-a6f62c335d22": { sport: "multi-sport", type: "festival", code: "NSC'S1" },
};

function guess(event: Event): Class {
  const n = event.name.toLowerCase();
  const sport: SportKey | null = /futsal/.test(n)
    ? "futsal"
    : /football|\bnfl\b/.test(n)
      ? "football"
      : /cricket|\bncl\b/.test(n)
        ? "cricket"
        : /basket|\bnbl\b/.test(n)
          ? "basketball"
          : /badminton|shuttle/.test(n)
            ? "badminton"
            : /table tennis/.test(n)
              ? "table-tennis"
              : /chess|carrom/.test(n)
                ? "chess-carrom"
                : /volley/.test(n)
                  ? "volleyball"
                  : /carnival|championship/.test(n)
                    ? "multi-sport"
                    : null;
  const type: TypeKey | null = /inter[\s-]*batch/.test(n) ? "inter-batch" : /inter[\s-]*uni|biusc/.test(n) ? "inter-university" : /carnival|fiesta|festival|night/.test(n) ? "festival" : "intra";
  const initials = event.name
    .replace(/\b(19|20)\d{2}\b/g, "")
    .split(/[\s&-]+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .map((w) => (/^[A-Z]{2,}$/.test(w) ? w : w[0].toUpperCase()))
    .join("")
    .slice(0, 6);
  const year = event.date ? `'${event.date.slice(2, 4)}` : "";
  return { sport, type, code: `${initials}${year}` };
}

export interface HubChampion {
  category: string | null; // "Male", "Female doubles"; null when there's only one
  names: string;
}

export interface HubEvent {
  id: string;
  slug: string;
  name: string;
  code: string;
  sport: SportKey | null;
  type: TypeKey | null;
  start: string | null; // ISO date
  end: string | null; // ISO date; null when one day or unknown
  yearOnly: boolean;
  year: number | null;
  status: HubStatus;
  venue: string | null;
  poster: string | null;
  gallery: string[];
  captions: Record<string, string>;
  champions: HubChampion[];
  runnersUp: HubChampion[];
  bestPlayer: string | null;
  teams: number | null;
  athletes: number | null;
  matches: number | null;
  prizes: string[];
  registration: { opens: string | null; closes: string | null; url: string | null };
  description: string;
  /** Data problems worth fixing in the admin (shown nowhere on the site). */
  dataNotes: string[];
}

// Results and venues are often typed in capitals; show them as names. Words that start with
// NSU ("NSUHRC") and known short forms stay in capitals; brackets keep their capitals too.
const KEEP = new Set(["NSU", "NSUSC", "SC", "BD", "BBA", "CSE", "EEE", "ECE", "MBA", "BIUSC", "ABG", "ULAB", "IUB", "AIUB", "BRAC", "DU", "NBL", "NFL"]);
export function nameCase(text: string): string {
  if (/[a-z]/.test(text)) return text;
  return text.replace(/[A-Z][A-Z'’.&-]*/g, (word) => (KEEP.has(word) || /^NSU/.test(word) ? word : word.charAt(0) + word.slice(1).toLowerCase()));
}

const sentence = (text: string) => {
  const lower = text.toLowerCase().replace(/^mix\b/, "mixed");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

function places(event: Event, key: "winners" | "runnersUp"): HubChampion[] {
  const rows = eventResults(event);
  if (rows.length === 0) return [];
  if (rows.length === 1 && !rows[0].category) return rows[0].places[key].map((names) => ({ category: null, names: nameCase(names) }));
  return rows
    .filter((r) => r.places[key].length)
    .map((r) => ({ category: r.category ? sentence(r.category) : null, names: r.places[key].map(nameCase).join(", ") }));
}

const days = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 86400000;

export function eventSlug(event: Pick<Event, "name" | "date">): string {
  const base = slugify(event.name.replace(/\s*['’]\d{2}/g, "").replace(/[’']/g, ""));
  const year = event.date?.slice(0, 4);
  return year && !base.includes(year) ? `${base}-${year}` : base;
}

/** Status from the dates (in Dhaka). Undated or year-only events keep the stored status. */
function statusOf(event: Event, start: string | null, end: string | null, today: string): HubStatus {
  if (!start || event.yearOnly) {
    if (event.status === "Running") return "live";
    if (event.status === "Upcoming") return event.registrationUrl ? "registration-open" : "upcoming";
    return "finished";
  }
  const last = end ?? start;
  if (today > last) return "finished";
  if (today >= start) return "live";
  const open = event.registrationUrl && (!event.registrationOpens || today >= event.registrationOpens) && (!event.registrationDeadline || today <= event.registrationDeadline);
  return open ? "registration-open" : "upcoming";
}

export function hubEvents(events: Event[], today: string = todayInDhaka()): HubEvent[] {
  const used = new Set<string>();
  const out = events.map((event): HubEvent => {
    const cls = CLASSIFIED[event.id] ?? guess(event);
    let slug = eventSlug(event);
    for (let n = 2; used.has(slug); n++) slug = `${eventSlug(event)}-${n}`;
    used.add(slug);
    const notes: string[] = [];
    const start = event.date;
    // The stored "year only" flag is set on events that do have full dates; trust the dates
    // unless they're the 1 January placeholder with no end.
    const yearOnly = Boolean(start && start.endsWith("-01-01") && !event.endDate);
    if (event.yearOnly && !yearOnly) notes.push("Marked 'year only' but has full dates; untick it.");
    let end = event.endDate && event.endDate !== event.date ? event.endDate : null;
    // A run of more than six weeks is almost certainly a typo (day and month swapped).
    if (start && end && days(start, end) > 42) {
      notes.push(`End date ${end} is ${Math.round(days(start, end))} days after the start; check it.`);
      end = null;
    }
    if (!start) notes.push("No date on record.");
    const prizes = [event.prizeFirst, event.prizeSecond, event.prizeThird, event.prizePool].filter(Boolean) as string[];
    return {
      id: event.id,
      slug,
      name: event.name,
      code: cls.code,
      sport: cls.sport,
      type: cls.type,
      start,
      end,
      yearOnly,
      year: start ? Number(start.slice(0, 4)) : null,
      status: statusOf({ ...event, yearOnly }, start, end, today),
      venue: event.venue ? nameCase(event.venue.trim()) : null,
      poster: event.bannerImage ?? event.gallery[0] ?? null,
      gallery: event.gallery,
      captions: event.galleryCaptions,
      champions: places(event, "winners"),
      runnersUp: places(event, "runnersUp"),
      bestPlayer: resultLines(event.manOfTournament).map(nameCase).join(", ") || null,
      teams: event.teamCount,
      athletes: event.participantCount,
      matches: event.matchCount,
      prizes,
      registration: { opens: event.registrationOpens, closes: event.registrationDeadline, url: event.registrationUrl },
      description: event.description,
      dataNotes: notes,
    };
  });
  // Codes must be unique per edition; a clash gets the edition's slug tail.
  const seen = new Map<string, number>();
  for (const e of out) seen.set(e.code, (seen.get(e.code) ?? 0) + 1);
  for (const e of out) if ((seen.get(e.code) ?? 0) > 1) e.code = `${e.code}·${e.slug.slice(-4)}`;
  return out.sort((a, b) => (b.start ?? "0").localeCompare(a.start ?? "0"));
}

// ---- Dates

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayMonth = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

/** "19–20 Apr 2026", "5 Jul – 22 Jul 2026", "2013", or null. */
export function dateRange(e: Pick<HubEvent, "start" | "end" | "yearOnly">): string | null {
  if (!e.start) return null;
  if (e.yearOnly) return e.start.slice(0, 4);
  const y = e.start.slice(0, 4);
  if (!e.end) return `${dayMonth(e.start)} ${y}`;
  if (e.start.slice(0, 7) === e.end.slice(0, 7)) return `${Number(e.start.slice(8, 10))}–${dayMonth(e.end)} ${y}`;
  return `${dayMonth(e.start)} – ${dayMonth(e.end)} ${e.end.slice(0, 4)}`;
}

// ---- Calendar

/** Recurring events by month, from every edition with a known day: what a typical year looks like. */
export function typicalYear(events: HubEvent[]): { month: number; code: string; name: string; slug: string }[] {
  const byPrefix = new Map<string, { month: number; code: string; name: string; slug: string }>();
  for (const e of events) {
    // Club-run sport events only: inter-university fixtures aren't ours to schedule, and
    // non-sport nights (Khar Nights) aren't something to plan training around.
    if (!e.start || e.yearOnly || e.type === "inter-university" || !e.sport) continue;
    const prefix = e.code.replace(/'.*$/, "");
    if (byPrefix.has(prefix)) continue; // newest edition wins (events are newest first)
    byPrefix.set(prefix, { month: Number(e.start.slice(5, 7)) - 1, code: prefix, name: e.name.replace(/\s*\b(19|20)\d{2}\b/, "").trim(), slug: e.slug });
  }
  return Array.from(byPrefix.values()).sort((a, b) => a.month - b.month);
}

// ---- Records

export function records(events: HubEvent[]) {
  const bySport = new Map<string, number>();
  for (const e of events) bySport.set(sportLabel(e.sport) ?? "Other", (bySport.get(sportLabel(e.sport) ?? "Other") ?? 0) + 1);
  const years = new Set(events.map((e) => e.year).filter(Boolean));
  const sum = (k: "teams" | "matches" | "athletes") => {
    const vals = events.map((e) => e[k]).filter((v): v is number => typeof v === "number");
    return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  };
  // Most titles across intra events, only when someone has more than one.
  const wins = new Map<string, number>();
  for (const e of events) {
    if (e.type === "inter-university") continue;
    // Once per event: NSUSC winning the men's and women's titles of one event is one event won.
    const names = new Set(e.champions.flatMap((c) => c.names.split(/,\s*/)).filter(Boolean));
    for (const name of Array.from(names)) wins.set(name, (wins.get(name) ?? 0) + 1);
  }
  const leaders = Array.from(wins.entries())
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const first = Math.min(...(Array.from(years) as number[]));
  return {
    tournaments: events.length,
    sports: Array.from(bySport.entries()).filter(([k]) => k !== "Other").length,
    seasons: years.size,
    since: Number.isFinite(first) ? first : null,
    bySport: Array.from(bySport.entries()).sort((a, b) => b[1] - a[1]),
    teams: sum("teams"),
    matches: sum("matches"),
    athletes: sum("athletes"),
    leaders,
  };
}

// ---- Calendar files

const icsDate = (iso: string) => iso.replace(/-/g, "");
const nextDay = (iso: string) => new Date(Date.parse(`${iso}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);

export function icsFor(e: HubEvent, url: string): string {
  if (!e.start) return "";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NSU Games & Sports Club//Events//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@nsusc`,
    `DTSTART;VALUE=DATE:${icsDate(e.start)}`,
    `DTEND;VALUE=DATE:${icsDate(nextDay(e.end ?? e.start))}`,
    `SUMMARY:${e.name}`,
    e.venue ? `LOCATION:${e.venue}` : "",
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function googleCalendarUrl(e: HubEvent, url: string): string | null {
  if (!e.start) return null;
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: e.name,
    dates: `${icsDate(e.start)}/${icsDate(nextDay(e.end ?? e.start))}`,
    details: url,
    ...(e.venue ? { location: e.venue } : {}),
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
