import { slugify } from "@/lib/squads";
import { normaliseName, titleCase, type CutoutFrame } from "@/lib/team-sheet";
import { entryPath, trophyEntries } from "@/lib/trophy";
import type { Achievement, AlumniClassYear, AlumniProfile } from "@/lib/types";

// "The relay": past panels as legs of a relay, newest first. Built on the server from the
// alumni list; names and roles are normalised for display only (the records are untouched).

export interface RelayPerson {
  id: string;
  slug: string;
  name: string;
  role: string; // "President", "Sub-Executive"
  committee: "Executive" | "Sub-Executive";
  panel: string; // panel slug, "2022-25"
  photo: string | null;
  frame: CutoutFrame | null;
  now: string | null; // "Product Manager at bKash, Dhaka"
  quote: string | null;
  facebook: string | null;
}

export interface RelayPanel {
  slug: string; // "2022-25"
  label: string; // "2022–25"
  start: number;
  end: number;
  executives: RelayPerson[]; // line-up order: president centre, then outward by rank
  subExecutives: RelayPerson[];
  president: RelayPerson | null;
  wins: { id: string; title: string; href: string }[]; // titles, podiums and awards during the term
}

// "Md", "MD.", "Md." -> "Md."; capitals-only names to Title Case.
export function alumniName(raw: string): string {
  return normaliseName(raw)
    .replace(/^m\.?d\.?\s+/i, "Md. ")
    .replace(/^md\.(?=\S)/i, "Md. ")
    .replace(/\s+/g, " ")
    .trim();
}

// Role vocabulary: "Sub-Executive Member" and "Sub-Executive" are the same seat.
function roleOf(raw: string | null, tier: AlumniProfile["tier"]): string {
  const text = (raw ?? "").trim();
  if (!text || /^sub[\s-]*executive( member)?$/i.test(text)) return tier === "Executive" ? "Executive" : "Sub-Executive";
  return titleCase(text.toLowerCase()).replace(/Sub Executive/gi, "Sub-Executive");
}

const RANK: [RegExp, number][] = [
  [/^president$/i, 0],
  [/general secretary/i, 1],
  [/vice president/i, 2],
  [/treasurer/i, 3],
  [/joint secretary/i, 4],
  [/head of sub/i, 5],
];
const rank = (role: string) => RANK.find(([re]) => re.test(role))?.[1] ?? 9;

/** Centre-out order: the top rank in the middle, the next either side, and so on. */
function lineup(people: RelayPerson[]): RelayPerson[] {
  const ranked = [...people].sort((a, b) => rank(a.role) - rank(b.role));
  const left: RelayPerson[] = [];
  const right: RelayPerson[] = [];
  ranked.slice(1).forEach((p, i) => (i % 2 === 0 ? right : left).push(p));
  return ranked.length ? [...left.reverse(), ranked[0], ...right] : [];
}

// "2022-2025" -> 2022, 2025.
function term(label: string): { start: number; end: number } | null {
  const m = label.match(/(\d{4})\s*[-–]\s*(\d{2,4})/);
  if (!m) return null;
  const start = Number(m[1]);
  const end = m[2].length === 2 ? Math.floor(start / 100) * 100 + Number(m[2]) : Number(m[2]);
  return { start, end };
}
const short = (start: number, end: number) => `${start}–${String(end).slice(-2)}`;

export function buildRelay(
  classYears: AlumniClassYear[],
  alumni: AlumniProfile[],
  frames: Record<string, CutoutFrame>,
  achievements: Achievement[],
): RelayPanel[] {
  const used = new Set<string>();
  const slugOf = (name: string) => {
    let slug = slugify(name) || "alumnus";
    for (let n = 2; used.has(slug); n++) slug = `${slugify(name)}-${n}`;
    used.add(slug);
    return slug;
  };
  const wins = trophyEntries(achievements).filter((e) => e.year && (e.type === "title" || e.type === "podium" || e.type === "individual"));

  const panels: RelayPanel[] = [];
  for (const year of classYears) {
    const t = term(year.label);
    const members = alumni.filter((a) => a.classYearId === year.id).sort((a, b) => a.sortOrder - b.sortOrder);
    // Only panels with people on record (empty years stay out of the relay).
    if (!t || members.length === 0) continue;
    const slug = `${t.start}-${String(t.end).slice(-2)}`;
    const people = members.map((a): RelayPerson => {
      const name = alumniName(a.name);
      return {
        id: a.id,
        slug: slugOf(name),
        name,
        role: roleOf(a.team, a.tier),
        committee: a.tier,
        panel: slug,
        photo: a.photo,
        frame: a.photo ? (frames[a.photo] ?? null) : null,
        now: a.currentRole?.trim() || null,
        quote: a.quote?.trim() || null,
        facebook: a.facebook,
      };
    });
    const executives = people.filter((p) => p.committee === "Executive");
    panels.push({
      slug,
      label: short(t.start, t.end),
      start: t.start,
      end: t.end,
      executives: lineup(executives),
      subExecutives: people.filter((p) => p.committee === "Sub-Executive"),
      president: executives.find((p) => rank(p.role) === 0) ?? null,
      wins: wins
        .filter((e) => (e.year ?? 0) >= t.start && (e.year ?? 0) <= t.end)
        .map((e) => ({ id: e.id, title: e.title, href: entryPath(e) })),
    });
  }
  return panels.sort((a, b) => b.start - a.start);
}

/** People, not seats: someone who served on two panels counts once. */
export function uniquePeople(panels: RelayPanel[]): number {
  const names = new Set(panels.flatMap((p) => [...p.executives, ...p.subExecutives]).map((p) => p.name.toLowerCase().replace(/[^a-z]/g, "")));
  return names.size;
}
