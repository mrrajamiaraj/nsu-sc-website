import type { Achievement } from "@/lib/types";

// "The trophy room": every achievement classified by weight, built on the server.

export type EntryType = "title" | "podium" | "individual" | "milestone" | "moment";

// Inline story text: plain strings, or a phrase that links somewhere.
export type StoryInline = string | { text: string; href: string };
export type StoryBlock = { kind: "p"; parts: StoryInline[] } | { kind: "quote"; text: string };

// One cell of the match-report fact sheet.
export interface Fact {
  label: string; // "Team"
  value: string; // "IM10 FC"
  note: string; // tooltip context: "IM10 FC: Mridul's club team."
  href?: string;
}

export interface Credit {
  name: string;
  role: string | null; // "Captain, IM10 FC"
}

export interface TrophyEntry {
  id: string;
  slug: string; // "kazi-ibrahim-mridul-futsal-league-bangladesh-2026"
  type: EntryType;
  sport: string; // "Football (Male)", "Cricket", "Club"
  year: number | null;
  title: string; // the record-book line: "Champions, 6th ULAB Fair Play Cup"
  competition: string | null;
  summary: string; // one factual sentence, no exclamation marks
  story: string[]; // the club's own write-up, as paragraphs
  photos: string[];
  people: string[];
  originalTitle: string;
  // Match-report page
  headline: string; // "Champion & Best Player"
  kicker: string | null; // second line: "Futsal League Bangladesh 2026"
  tags: { label: string; type: EntryType }[];
  facts: Fact[];
  blocks: StoryBlock[]; // the story in report style (falls back to the write-up)
  credits: Credit[];
}

export const TYPE_ORDER: EntryType[] = ["title", "podium", "individual", "milestone", "moment"];

export const TYPE_LABEL: Record<EntryType, { tab: string; tag: string; tally: string }> = {
  title: { tab: "Titles", tag: "Champions", tally: "Titles" },
  podium: { tab: "Podiums", tag: "Runners-up", tally: "Podiums" },
  individual: { tab: "Individual", tag: "Best player", tally: "Individual awards" },
  milestone: { tab: "Milestones", tag: "Milestone", tally: "Club milestones" },
  moment: { tab: "Moments", tag: "Moment", tally: "Moments" },
};

type Record_ = Pick<TrophyEntry, "type" | "sport" | "title" | "summary"> & {
  slug?: string;
  competition?: string;
  people?: string[];
  credits?: Credit[];
  tags?: { label: string; type: EntryType }[];
  facts?: Fact[];
  blocks?: StoryBlock[];
};

// Record-book lines for the entries on file, by achievement id. Summaries are rewritten as
// facts from each write-up; the write-up itself is kept as the full story.
const RECORDS: Record<string, Record_> = {
  "382c49a4-67c5-4ae2-9453-2503a29aa1a2": {
    type: "individual",
    slug: "kazi-ibrahim-mridul-futsal-league-bangladesh-2026",
    sport: "Futsal",
    title: "Champion & Best Player, Futsal League Bangladesh 2026",
    competition: "Futsal League Bangladesh 2026",
    summary: "Kazi Ibrahim Ahamed Mridul captained IM10 FC to the Futsal League Bangladesh 2026 title and was named Best Player of the Tournament.",
    people: ["Kazi Ibrahim Ahamed Mridul"],
    credits: [{ name: "Kazi Ibrahim Ahamed Mridul", role: "Captain, IM10 FC" }],
    tags: [
      { label: "Best player", type: "individual" },
      { label: "Champions", type: "title" },
    ],
    facts: [
      { label: "Result", value: "Champions", note: "IM10 FC won the Futsal League Bangladesh 2026 title." },
      { label: "Award", value: "Best Player", note: "Named Best Player of the Tournament." },
      { label: "Competition", value: "Futsal League Bangladesh", note: "Futsal League Bangladesh, 2026 edition. See more futsal.", href: "/achievements?sport=futsal" },
      // IM10 FC has no page of its own yet; add an href here once it does.
      { label: "Team", value: "IM10 FC", note: "IM10 FC: Mridul's club team." },
      { label: "Role", value: "Captain", note: "Mridul captained IM10 FC through the league." },
      { label: "Year", value: "2026", note: "Everything on record for 2026.", href: "/achievements?year=2026" },
    ],
    // The club's write-up, retold as a report: same facts, fewer exclamation marks.
    blocks: [
      {
        kind: "p",
        parts: [
          "Kazi Ibrahim Ahamed Mridul went into ",
          { text: "Futsal League Bangladesh", href: "/achievements?sport=futsal" },
          " 2026 as captain of IM10 FC and came out of it with two honours: the league title for his side, and Best Player of the Tournament for himself.",
        ],
      },
      { kind: "quote", text: "From the NAC-SAC corridors to the national stage." },
      {
        kind: "p",
        parts: [
          "He led from the front. The club's account of the season credits his relentless passion, his tactical reading of the game and the sportsmanship he showed on the court, the qualities every NSUer on a team sheet is asked to carry.",
        ],
      },
      {
        kind: "p",
        parts: [
          "For the ",
          { text: "NSU", href: "/about" },
          " community it is a win to share. The club congratulates its captain, thanks him for the example he set on the biggest stage he has played on, and looks forward to the next one.",
        ],
      },
    ],
  },
  "d09cef27-371e-4b86-a6a5-d493b57891db": {
    type: "milestone",
    slug: "appreciation-partner-punab-july-uprising-memorial-award-2026",
    sport: "Club",
    title: "Appreciation Partner, PUNAB July Uprising Memorial Award 2026",
    competition: "PUNAB July Uprising Memorial Award 2026",
    summary: "NSU Games & Sports Club was named an Appreciation Partner of the PUNAB July Uprising Memorial Award 2026.",
  },
  "fc9eca9d-18c0-4ad0-b2e3-77af14242174": {
    type: "podium",
    slug: "runners-up-bsl-inter-university-futsal-2024",
    sport: "Football (Male)",
    title: "Runners-up, BSL Inter-University Futsal Tournament 2024",
    competition: "BSL Inter-University Futsal Tournament 2024",
    summary: "NSU's men's football team finished runners-up at the BSL Inter-University Futsal Tournament 2024.",
  },
  "d6894604-5021-4719-a27d-8ab74b469c55": {
    type: "milestone",
    slug: "biusc-2022-prize-giving",
    sport: "Club",
    title: "Honoured at BIUSC 2022 Prize Giving Ceremony",
    competition: "Bangabandhu Inter University Sports Championship 2022",
    summary: "NSU's athletes were honoured at the Bangabandhu Inter University Sports Championship 2022 prize giving ceremony.",
  },
  "1dc83284-da5f-4474-8e19-38f6c052db89": {
    type: "moment",
    slug: "nfl-2022-trophy-unveiling",
    sport: "Football (Male)",
    title: "NFL 2022 trophy unveiling & media coverage",
    competition: "NSU Football League 2022",
    summary: "The NSU Football League 2022 trophy was unveiled at a ceremony covered by the media.",
  },
  "d66e0ea9-6e28-40e8-b1cc-72a34707abf4": {
    type: "title",
    slug: "champions-ulab-fair-play-cup-2013",
    sport: "Cricket",
    title: "Champions, 6th ULAB Fair Play Cup",
    competition: "Inter-Private University Cricket Tournament 2013",
    summary: "NSU won the 6th ULAB Fair Play Cup, an inter-private university cricket tournament, in 2013.",
  },
  "a981c625-feaa-49e9-8d1d-c340678efcd3": {
    type: "moment",
    slug: "nsuers-meet-dhaka-gladiators-2013",
    sport: "Club",
    title: "NSUers meet Dhaka Gladiators",
    summary: "The club brought NSU students together with the Dhaka Gladiators for a meet-up in February 2013.",
  },
  "f7611e8d-6850-4319-897d-2b10ce9c60bf": {
    type: "title",
    slug: "hat-trick-champions-intra-nsu-football-1997",
    sport: "Football (Male)",
    title: "Hat-trick champions, Intra NSU Football Tournament",
    competition: "Intra NSU Football Tournament 1997",
    summary: "Batch '96 won the Intra NSU Football Tournament in 1997, completing a hat-trick of titles.",
    people: ["Batch '96"],
    credits: [{ name: "Batch '96", role: "Intra NSU champions, three years running" }],
  },
  "8fb0adcb-07d2-475b-96eb-9b864ca30a18": {
    type: "moment",
    slug: "nsu-sports-carnival-prize-giving",
    sport: "Club",
    title: "NSU Sports Carnival prize giving",
    competition: "NSU Sports Carnival",
    summary: "Prizes were presented to the winners of the NSU Sports Carnival.",
  },
  "d654acd3-e047-4eb5-9a66-bfd5eeb51a71": {
    type: "milestone",
    slug: "new-nsu-field-inauguration",
    sport: "Club",
    title: "Inauguration of the new NSU field",
    summary: "North South University opened its new sports field.",
  },
};

const paragraphs = (text: string) =>
  text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

// Report copy reads calmer than a social caption: a sentence-ending "!" becomes ".".
const calm = (text: string) => text.replace(/!+(?=\s|$)/g, ".").replace(/!+/g, "");

const slugText = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

// Anything not classified above reads as a moment, with a plain first sentence as its summary.
function fallback(item: Achievement): Record_ {
  const first = (item.description.split(/(?<=[.!?])\s/)[0] ?? "").replace(/!+/g, ".").slice(0, 160);
  return { type: "moment", sport: item.teamName || "Club", title: item.title.replace(/!+$/, ""), summary: first || item.title };
}

// "Champion & Best Player, Futsal League Bangladesh 2026" -> headline + second line.
function splitTitle(title: string): { headline: string; kicker: string | null } {
  const at = title.indexOf(", ");
  if (at < 0) return { headline: title, kicker: null };
  return { headline: title.slice(0, at), kicker: title.slice(at + 2) };
}

const sportName = (sport: string) => sport.replace(/\s*\(.*\)$/, "").trim();

function defaultFacts(record: Record_, year: number | null): Fact[] {
  const facts: Fact[] = [
    {
      label: "Result",
      value: TYPE_LABEL[record.type].tag,
      note: `Filed under ${TYPE_LABEL[record.type].tab.toLowerCase()} in the trophy room.`,
      href: `/achievements?type=${record.type}`,
    },
  ];
  if (record.competition) facts.push({ label: "Competition", value: record.competition.replace(/\s+\d{4}$/, ""), note: record.competition });
  const club = record.sport === "Club";
  facts.push({
    label: "Sport",
    value: club ? "Club-wide" : sportName(record.sport),
    note: club ? "A club-wide entry, not one squad's." : `More ${sportName(record.sport).toLowerCase()} in the trophy room.`,
    href: club ? undefined : `/achievements?sport=${sportKey(record.sport)}`,
  });
  if (year) facts.push({ label: "Year", value: String(year), note: `Everything on record for ${year}.`, href: `/achievements?year=${year}` });
  return facts;
}

export function trophyEntries(items: Achievement[]): TrophyEntry[] {
  const used = new Set<string>();
  return items.map((item) => {
    const record = RECORDS[item.id] ?? fallback(item);
    const year = item.date ? Number(item.date.slice(0, 4)) : null;
    const story = paragraphs(item.description);
    let slug = record.slug ?? slugText(year && !record.title.includes(String(year)) ? `${record.title} ${year}` : record.title);
    if (!slug || used.has(slug)) slug = `${slug || "achievement"}-${item.id.slice(0, 6)}`;
    used.add(slug);
    const { headline, kicker } = splitTitle(record.title);
    return {
      id: item.id,
      slug,
      type: record.type,
      sport: record.sport,
      year,
      title: record.title,
      competition: record.competition ?? null,
      summary: record.summary,
      story,
      photos: [item.photo, ...item.gallery].filter(Boolean) as string[],
      people: record.people ?? [],
      originalTitle: item.title,
      headline,
      kicker: kicker ?? (record.competition && record.competition !== headline ? record.competition : null),
      tags: record.tags ?? [{ label: TYPE_LABEL[record.type].tag, type: record.type }],
      facts: record.facts ?? defaultFacts(record, year),
      blocks: record.blocks ?? story.map((p) => ({ kind: "p" as const, parts: [calm(p)] })),
      credits: record.credits ?? (record.people ?? []).map((name) => ({ name, role: null })),
    };
  });
}

// Sport filter key: "Football (Male)" and "Football" both filter as "football".
export const sportKey = (sport: string) => sport.replace(/\s*\(.*\)$/, "").trim().toLowerCase();

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID.test(value);

export const entryPath = (entry: Pick<TrophyEntry, "slug">) => `/achievements/${entry.slug}`;

// The room's reading order: newest year first, the heaviest results first within a year,
// then the undated archive.
export function ledgerOrder<T extends Pick<TrophyEntry, "year" | "type">>(entries: T[]): T[] {
  const weight = (e: T) => TYPE_ORDER.indexOf(e.type);
  const dated = entries.filter((e) => e.year).sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || weight(a) - weight(b));
  return [...dated, ...entries.filter((e) => !e.year)];
}

// Football and futsal are one family for "more like this".
const family = (sport: string) => (/football|futsal/i.test(sport) ? "football" : sportKey(sport));

// Same sport first, then the same sport family, then the same year; ties go to the bigger result.
export function relatedEntries(entry: TrophyEntry, entries: TrophyEntry[], limit = 4): TrophyEntry[] {
  const club = entry.sport === "Club";
  const score = (e: TrophyEntry) =>
    (!club && (sportKey(e.sport) === sportKey(entry.sport) || e.title.toLowerCase().includes(sportKey(entry.sport))) ? 4 : 0) +
    (!club && family(e.sport) === family(entry.sport) ? 2 : 0) +
    (e.year && e.year === entry.year ? 1.5 : 0) -
    TYPE_ORDER.indexOf(e.type) * 0.1;
  return entries
    .filter((e) => e.id !== entry.id)
    .map((e) => ({ e, s: score(e) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ e }) => e);
}
