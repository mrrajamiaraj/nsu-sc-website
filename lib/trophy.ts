import type { Achievement } from "@/lib/types";

// "The trophy room": every achievement classified by weight, built on the server.

export type EntryType = "title" | "podium" | "individual" | "milestone" | "moment";

export interface TrophyEntry {
  id: string;
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
}

export const TYPE_ORDER: EntryType[] = ["title", "podium", "individual", "milestone", "moment"];

export const TYPE_LABEL: Record<EntryType, { tab: string; tag: string; tally: string }> = {
  title: { tab: "Titles", tag: "Champions", tally: "Titles" },
  podium: { tab: "Podiums", tag: "Runners-up", tally: "Podiums" },
  individual: { tab: "Individual", tag: "Best player", tally: "Individual awards" },
  milestone: { tab: "Milestones", tag: "Milestone", tally: "Club milestones" },
  moment: { tab: "Moments", tag: "Moment", tally: "Moments" },
};

type Record_ = Pick<TrophyEntry, "type" | "sport" | "title" | "summary"> & { competition?: string; people?: string[] };

// Record-book lines for the entries on file, by achievement id. Summaries are rewritten as
// facts from each write-up; the write-up itself is kept as the full story.
const RECORDS: Record<string, Record_> = {
  "382c49a4-67c5-4ae2-9453-2503a29aa1a2": {
    type: "individual",
    sport: "Futsal",
    title: "Champion & Best Player, Futsal League Bangladesh 2026",
    competition: "Futsal League Bangladesh 2026",
    summary: "Kazi Ibrahim Ahamed Mridul captained IM10 FC to the Futsal League Bangladesh 2026 title and was named Best Player of the Tournament.",
    people: ["Kazi Ibrahim Ahamed Mridul"],
  },
  "d09cef27-371e-4b86-a6a5-d493b57891db": {
    type: "milestone",
    sport: "Club",
    title: "Appreciation Partner, PUNAB July Uprising Memorial Award 2026",
    competition: "PUNAB July Uprising Memorial Award 2026",
    summary: "NSU Games & Sports Club was named an Appreciation Partner of the PUNAB July Uprising Memorial Award 2026.",
  },
  "fc9eca9d-18c0-4ad0-b2e3-77af14242174": {
    type: "podium",
    sport: "Football (Male)",
    title: "Runners-up, BSL Inter-University Futsal Tournament 2024",
    competition: "BSL Inter-University Futsal Tournament 2024",
    summary: "NSU's men's football team finished runners-up at the BSL Inter-University Futsal Tournament 2024.",
  },
  "d6894604-5021-4719-a27d-8ab74b469c55": {
    type: "milestone",
    sport: "Club",
    title: "Honoured at BIUSC 2022 Prize Giving Ceremony",
    competition: "Bangabandhu Inter University Sports Championship 2022",
    summary: "NSU's athletes were honoured at the Bangabandhu Inter University Sports Championship 2022 prize giving ceremony.",
  },
  "1dc83284-da5f-4474-8e19-38f6c052db89": {
    type: "moment",
    sport: "Football (Male)",
    title: "NFL 2022 trophy unveiling & media coverage",
    competition: "NSU Football League 2022",
    summary: "The NSU Football League 2022 trophy was unveiled at a ceremony covered by the media.",
  },
  "d66e0ea9-6e28-40e8-b1cc-72a34707abf4": {
    type: "title",
    sport: "Cricket",
    title: "Champions, 6th ULAB Fair Play Cup",
    competition: "Inter-Private University Cricket Tournament 2013",
    summary: "NSU won the 6th ULAB Fair Play Cup, an inter-private university cricket tournament, in 2013.",
  },
  "a981c625-feaa-49e9-8d1d-c340678efcd3": {
    type: "moment",
    sport: "Club",
    title: "NSUers meet Dhaka Gladiators",
    summary: "The club brought NSU students together with the Dhaka Gladiators for a meet-up in February 2013.",
  },
  "f7611e8d-6850-4319-897d-2b10ce9c60bf": {
    type: "title",
    sport: "Football (Male)",
    title: "Hat-trick champions, Intra NSU Football Tournament",
    competition: "Intra NSU Football Tournament 1997",
    summary: "Batch '96 won the Intra NSU Football Tournament in 1997, completing a hat-trick of titles.",
    people: ["Batch '96"],
  },
  "8fb0adcb-07d2-475b-96eb-9b864ca30a18": {
    type: "moment",
    sport: "Club",
    title: "NSU Sports Carnival prize giving",
    competition: "NSU Sports Carnival",
    summary: "Prizes were presented to the winners of the NSU Sports Carnival.",
  },
  "d654acd3-e047-4eb5-9a66-bfd5eeb51a71": {
    type: "milestone",
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

// Anything not classified above reads as a moment, with a plain first sentence as its summary.
function fallback(item: Achievement): Record_ {
  const first = (item.description.split(/(?<=[.!?])\s/)[0] ?? "").replace(/!+/g, ".").slice(0, 160);
  return { type: "moment", sport: item.teamName || "Club", title: item.title.replace(/!+$/, ""), summary: first || item.title };
}

export function trophyEntries(items: Achievement[]): TrophyEntry[] {
  return items.map((item) => {
    const record = RECORDS[item.id] ?? fallback(item);
    return {
      id: item.id,
      type: record.type,
      sport: record.sport,
      year: item.date ? Number(item.date.slice(0, 4)) : null,
      title: record.title,
      competition: record.competition ?? null,
      summary: record.summary,
      story: paragraphs(item.description),
      photos: [item.photo, ...item.gallery].filter(Boolean) as string[],
      people: record.people ?? [],
      originalTitle: item.title,
    };
  });
}

// Sport filter key: "Football (Male)" and "Football" both filter as "football".
export const sportKey = (sport: string) => sport.replace(/\s*\(.*\)$/, "").trim().toLowerCase();
