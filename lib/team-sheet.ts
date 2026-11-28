import { slugify } from "@/lib/squads";
import type { Member, Player } from "@/lib/types";

// "Team announcement": one squad as a role-grouped team sheet. Built on the server from the
// roster; role text is normalised to one Title Case vocabulary and staff are kept apart
// from the players (and from the athlete count).

/** Where the person sits inside a transparent cut-out, as fractions of the image. */
export interface CutoutFrame {
  ratio: number; // image width / height
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SheetLink {
  key: "facebook" | "email" | "phone";
  href: string;
}

export interface SheetPerson {
  id: string;
  slug: string;
  name: string;
  role: string | null; // "Right-Arm Batter"; null when not on record
  mark: string; // short code behind the card when there's no number: "RAB", "AR", "L"
  number: string | null;
  group: string; // "Batters"
  captain: "C" | "VC" | null;
  photo: string | null;
  frame: CutoutFrame | null;
  bio: string | null;
  links: SheetLink[];
}

export interface SheetGroup {
  key: string; // "batters"
  label: string;
  people: SheetPerson[];
}

// ---- Vocabulary

const WORD_FIX: [RegExp, string][] = [
  [/\bbats(wo)?man\b/gi, "Batter"],
  [/\b(right|left)[\s-]*arm\b/gi, "$1-Arm"],
  [/\ball[\s-]*round(er)?\b(\s+player)?/gi, "All-Rounder"],
  [/\bwicket[\s-]*keeper\b/gi, "Wicket-Keeper"],
  [/\bcounter[\s-]*attacker\b/gi, "Counter-Attacker"],
  [/\bsingles player\b/gi, "Singles"],
  [/\bdoubles player\b/gi, "Doubles"],
];

const SMALL = new Set(["of", "and", "the"]);
const titleWord = (word: string, i: number) =>
  word
    .split("-")
    .map((part) => (/^\(?[A-Z]{1,3}\)?$/.test(part) ? part : !i && SMALL.has(part.toLowerCase()) ? part : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()))
    .join("-");

export function titleCase(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((word, i) => (i > 0 && SMALL.has(word.toLowerCase()) ? word.toLowerCase() : titleWord(word, i)))
    .join(" ");
}

// "MD SAYEDUL KARIM SIKDER" -> "Md Sayedul Karim Sikder"; mixed-case names are left alone.
export function normaliseName(name: string): string {
  const clean = name.replace(/\s+/g, " ").trim();
  return /[a-z]/.test(clean) ? clean : titleCase(clean.toLowerCase());
}

const MARKS: Record<string, string> = {
  "Right-Arm Batter": "RAB",
  "Left-Arm Batter": "LAB",
  "Left-Arm Orthodox Spinner": "LOS",
  "All-Rounder": "AR",
  "Fast Bowler": "FB",
  Bowler: "B",
  "Wicket-Keeper": "WK",
};

function markFor(role: string | null, code: string | null): string {
  if (code) return code;
  if (role && MARKS[role]) return MARKS[role];
  // No position on record: nothing behind the player rather than their initials.
  if (!role) return "";
  return role
    .split(/[\s-]+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 3);
}

// ---- Role groups per sport, in team-sheet order.

type GroupRule = { key: string; label: string; match: RegExp };

const GROUPS: Record<string, GroupRule[]> = {
  cricket: [
    { key: "batters", label: "Batters", match: /batter|keeper|opener/i },
    { key: "all-rounders", label: "All-Rounders", match: /all-rounder/i },
    { key: "bowlers", label: "Bowlers", match: /bowl|spin|seam|pace/i },
  ],
  football: [
    { key: "goalkeepers", label: "Goalkeepers", match: /goal\s*keeper|keeper/i },
    { key: "defenders", label: "Defenders", match: /back|defender|sweeper/i },
    { key: "midfielders", label: "Midfielders", match: /midfield/i },
    { key: "forwards", label: "Forwards", match: /striker|forward|wing|attack/i },
  ],
  volleyball: [
    { key: "setters", label: "Setters", match: /setter/i },
    { key: "outside-hitters", label: "Outside Hitters", match: /outside/i },
    { key: "middle-blockers", label: "Middle Blockers", match: /middle/i },
    { key: "opposites", label: "Opposites", match: /opposite/i },
    { key: "liberos", label: "Liberos", match: /libero/i },
    { key: "defensive-specialists", label: "Defensive Specialists", match: /defensive/i },
  ],
};
GROUPS.futsal = GROUPS.football;

const PLAYERS: GroupRule = { key: "players", label: "Players", match: /.*/ };

const STAFF = /coach|manager|physio|trainer|analyst/i;

/** Parse the roster's free-text position: "Captain, Libero (L) · #19", "ALL ROUNDER", "Team Manager". */
export function parsePosition(position: string) {
  const numberMatch = position.match(/·\s*#\s*([0-9]+)/);
  const withoutNumber = position.replace(/\s*·\s*#.*$/, "").trim();
  const parts = withoutNumber.split(",").map((p) => p.trim()).filter(Boolean);
  const captaincy = parts.find((p) => /captain/i.test(p));
  const rest = parts.filter((p) => p !== captaincy);
  // One position per player: the first of "Attacker / Offensive Player / All-Round Player".
  const first = rest[0]?.split(/\s+\/\s+/)[0]?.trim() ?? "";
  const code = first.match(/\(([A-Za-z]{1,3})\)$/)?.[1]?.toUpperCase() ?? null;
  let role = first.replace(/\s*\([^)]*\)$/, "");
  for (const [pattern, replacement] of WORD_FIX) role = role.replace(pattern, replacement);
  role = role ? titleCase(role) : "";
  return {
    role: role || null,
    code,
    number: numberMatch ? String(Number(numberMatch[1])) : null,
    captain: captaincy ? (/vice/i.test(captaincy) ? ("VC" as const) : ("C" as const)) : null,
    staff: STAFF.test(withoutNumber),
  };
}

function linksOf(person: { facebook?: string | null; email?: string | null; phone?: string | null }): SheetLink[] {
  const links: SheetLink[] = [];
  if (person.facebook) links.push({ key: "facebook", href: person.facebook });
  if (person.email) links.push({ key: "email", href: `mailto:${person.email}` });
  if (person.phone) links.push({ key: "phone", href: `tel:${person.phone.replace(/[^\d+]/g, "")}` });
  return links;
}

// Club write-ups like "NSU MAIN CRICKET TEAM PLAYER" or "." say nothing about the player.
const usefulBio = (bio: string) => (bio.trim().length >= 30 && !/main\s+.*team\s+(player|manager)/i.test(bio) ? bio.trim() : null);

export interface TeamSheet {
  groups: SheetGroup[];
  players: SheetPerson[]; // team-sheet order
  staff: SheetPerson[];
  captain: SheetPerson | null;
}

export function buildTeamSheet(
  sportSlug: string,
  roster: Player[],
  teamStaff: { managers: Member[]; inCharges: Member[] },
  frames: Record<string, CutoutFrame>,
): TeamSheet {
  const rules = GROUPS[sportSlug] ?? [PLAYERS];
  const used = new Set<string>();
  const slugOf = (name: string) => {
    let slug = slugify(name) || "player";
    for (let n = 2; used.has(slug); n++) slug = `${slugify(name)}-${n}`;
    used.add(slug);
    return slug;
  };

  const players: SheetPerson[] = [];
  const staff: SheetPerson[] = [];

  for (const p of roster) {
    const parsed = parsePosition(p.position);
    const name = normaliseName(p.name);
    const base = {
      id: p.id,
      slug: slugOf(name),
      name,
      number: parsed.number,
      captain: parsed.staff ? null : parsed.captain,
      photo: p.photo,
      frame: p.photo ? (frames[p.photo] ?? null) : null,
      bio: usefulBio(p.bio),
      links: linksOf(p),
    };
    if (parsed.staff) {
      staff.push({ ...base, role: parsed.role, mark: markFor(parsed.role, null), group: "Staff" });
      continue;
    }
    const rule = parsed.role ? rules.find((r) => r.match.test(parsed.role ?? "")) : undefined;
    // A captain with no position on record leads the sheet on their own.
    const group = rule?.label ?? (parsed.captain ? "Captain" : rules === GROUPS[sportSlug] ? "Squad" : PLAYERS.label);
    players.push({ ...base, role: parsed.role, mark: markFor(parsed.role, parsed.code), group });
  }

  // Panel staff for the squad (club Executives manage it; Sub-Executives are its in-charges),
  // unless they're already on the roster.
  const known = new Set(staff.map((s) => s.name.toLowerCase()));
  const addMember = (m: Member, role: string) => {
    const name = normaliseName(m.name);
    if (known.has(name.toLowerCase())) return;
    known.add(name.toLowerCase());
    staff.push({
      id: m.id,
      slug: slugOf(name),
      name,
      role,
      mark: markFor(role, null),
      number: null,
      group: "Staff",
      captain: null,
      photo: m.photo,
      frame: m.photo ? (frames[m.photo] ?? null) : null,
      bio: null,
      links: linksOf(m),
    });
  };
  teamStaff.managers.forEach((m) => addMember(m, "Team Manager"));
  teamStaff.inCharges.forEach((m) => addMember(m, "Team In-Charge"));

  const order = ["Captain", ...rules.map((r) => r.label), "Squad", PLAYERS.label];
  const labels = Array.from(new Set(order)).filter((label) => players.some((p) => p.group === label));
  const groups = labels.map((label) => ({ key: slugify(label), label, people: players.filter((p) => p.group === label) }));
  const ordered = groups.flatMap((g) => g.people);

  return {
    groups,
    players: ordered,
    staff,
    captain: ordered.find((p) => p.captain === "C") ?? null,
  };
}

/** Line-up order for the hero: captain in the centre, the rest alternating outward. */
export function lineupOrder(players: SheetPerson[]): SheetPerson[] {
  const captain = players.find((p) => p.captain === "C");
  // Players without a photo stand at the ends, so the centre of the poster is all faces.
  const rest = players.filter((p) => p !== captain).sort((a, b) => Number(Boolean(b.photo)) - Number(Boolean(a.photo)));
  const left: SheetPerson[] = [];
  const right: SheetPerson[] = [];
  rest.forEach((p, i) => (i % 2 === 0 ? right : left).push(p));
  return [...left.reverse(), ...(captain ? [captain] : []), ...right];
}

/**
 * Position a cut-out inside a box so the person is bottom-aligned, centred, and fills `fill`
 * of the box height (capped so very wide poses don't overflow by more than `maxWidth`).
 * Returns the image's box as percentages of the container.
 */
export function cutoutStyle(frame: CutoutFrame | null, boxRatio: number, fill = 0.92, maxWidth = 1.25) {
  const f = frame ?? { ratio: 1.6, x: 0.25, y: 0.1, w: 0.5, h: 0.9 };
  // Image height as a fraction of box height.
  let height = fill / f.h;
  const personWidth = f.w * height * f.ratio; // in box heights
  if (personWidth > maxWidth * boxRatio) height *= (maxWidth * boxRatio) / personWidth;
  const width = (height * f.ratio) / boxRatio; // in box widths
  return {
    height: `${height * 100}%`,
    width: `${width * 100}%`,
    top: `${(1 - (f.y + f.h) * height) * 100}%`,
    left: `${(0.5 - (f.x + f.w / 2) * width) * 100}%`,
  };
}
