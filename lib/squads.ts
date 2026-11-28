import { countAthletes } from "@/lib/roster";
import { sportKey, trophyEntries } from "@/lib/trophy";
import type { Achievement, Member, Player, Team } from "@/lib/types";

// "Squad select": the Teams page organised by sport, each with a Men / Women squad.
// Teams are stored one per side ("Football Male", "Football Female"); everything here
// is built on the server from the teams, players, team staff and achievements on record.

export type Gender = "men" | "women";
export const GENDERS: Gender[] = ["men", "women"];
export const GENDER_LABEL: Record<Gender, string> = { men: "Men", women: "Women" };

// The order of the team sheet. Sports not listed here follow, alphabetically.
const SPORT_ORDER = ["football", "cricket", "volleyball", "table-tennis", "badminton"];

// Players a squad needs before it stops showing "Looking for players". Only sports listed
// here can show the thin-squad state. Table tennis: a team event is 3 singles players plus reserves.
const ROSTER_TARGET: Record<string, number> = { "table-tennis": 5 };

const SIDE = /\s+(Male|Female)$/i;
const STAFF = /coach|manager/i;

export interface SquadFace {
  id: string;
  name: string;
  photo: string | null;
  position: string;
}

export interface SquadStaff {
  role: string; // "Head coach", "Team manager", "Team in-charge"
  names: string[];
}

export interface Squad {
  slug: string; // "football-men"
  teamId: string;
  teamName: string; // "Football Male", the value the contact form uses
  sport: string;
  sportSlug: string;
  gender: Gender;
  athletes: number;
  photo: string | null;
  captain: { name: string; photo: string | null } | null;
  staff: SquadStaff | null;
  lastResult: { title: string; href: string } | null;
  faces: SquadFace[]; // up to 12, photos first
  /** Open places while the squad is below its target size (thin squads only). */
  spotsOpen: number | null;
}

export interface SportGroup {
  slug: string;
  name: string;
  number: string; // "01"
  total: number;
  squads: Partial<Record<Gender, Squad>>;
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function teamSport(team: Pick<Team, "name">): { sport: string; gender: Gender | null } {
  const side = team.name.match(SIDE)?.[1]?.toLowerCase();
  return {
    sport: team.name.replace(SIDE, "").trim(),
    gender: side === "male" ? "men" : side === "female" ? "women" : null,
  };
}

/** Public URL slug for a team: "Football Male" -> "football-men". */
export function teamSlug(team: Pick<Team, "name">): string {
  const { sport, gender } = teamSport(team);
  return gender ? `${slugify(sport)}-${gender}` : slugify(sport);
}


// Strip the jersey number for tooltips: "Libero (L) · #19" -> "Libero (L)".
const cleanPosition = (position: string) => position.replace(/\s*·\s*#.*$/, "").trim();

function captainOf(players: Player[]) {
  const captain = players.find((p) => /\bcaptain\b/i.test(p.position) && !/vice/i.test(p.position));
  return captain ? { name: captain.name, photo: captain.photo } : null;
}

// Prefer a coach, then a manager (staff Executives or a "Manager" on the roster), then the
// panel's in-charges for the squad.
function staffOf(players: Player[], staff: { managers: Member[]; inCharges: Member[] } | undefined): SquadStaff | null {
  const coaches = players.filter((p) => /coach/i.test(p.position)).map((p) => p.name);
  if (coaches.length) return { role: "Head coach", names: coaches };
  const managers = [...(staff?.managers ?? []).map((m) => m.name), ...players.filter((p) => /manager/i.test(p.position)).map((p) => p.name)];
  if (managers.length) return { role: "Team manager", names: Array.from(new Set(managers)) };
  const inCharges = (staff?.inCharges ?? []).map((m) => m.name);
  if (inCharges.length) return { role: inCharges.length > 1 ? "Team in-charges" : "Team in-charge", names: inCharges };
  return null;
}

export interface SquadHonour {
  id: string;
  type: "title" | "podium";
  title: string;
  year: number | null;
  href: string;
}

// This squad's titles and podiums, newest first: linked to the team, or filed under its
// sport. Records filed under a sport without a side ("Cricket") are historic men's squads.
export function squadHonours(team: Team, achievements: Achievement[]): SquadHonour[] {
  const { sport, gender } = teamSport(team);
  const byId = new Map(achievements.map((a) => [a.id, a]));
  return trophyEntries(achievements)
    .filter((entry) => {
      if (entry.type !== "title" && entry.type !== "podium") return false;
      if (byId.get(entry.id)?.teamId === team.id) return true;
      if (sportKey(entry.sport) !== sport.toLowerCase()) return false;
      const side = /\(female\)/i.test(entry.sport) ? "women" : "men";
      return side === (gender ?? "men");
    })
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .map((entry) => ({ id: entry.id, type: entry.type as "title" | "podium", title: entry.title, year: entry.year, href: `/achievements/${entry.id}` }));
}

export function buildSquads(
  teams: Team[],
  playersByTeam: Map<string, Player[]>,
  staffByTeam: Map<string, { managers: Member[]; inCharges: Member[] }>,
  achievements: Achievement[],
): SportGroup[] {
  const groups = new Map<string, SportGroup>();

  for (const team of teams) {
    const { sport, gender } = teamSport(team);
    const sportSlug = slugify(sport);
    const players = playersByTeam.get(team.id) ?? [];
    const athletes = players.filter((p) => !STAFF.test(p.position));
    const count = countAthletes(players);
    const target = ROSTER_TARGET[sportSlug];
    const side = gender ?? "men";

    const squad: Squad = {
      slug: teamSlug(team),
      teamId: team.id,
      teamName: team.name,
      sport,
      sportSlug,
      gender: side,
      athletes: count,
      photo: team.bannerImage,
      captain: captainOf(players),
      staff: staffOf(players, staffByTeam.get(team.id)),
      lastResult: squadHonours(team, achievements)[0] ?? null,
      faces: [...athletes]
        .sort((a, b) => Number(Boolean(b.photo)) - Number(Boolean(a.photo)))
        .slice(0, 12)
        .map((p) => ({ id: p.id, name: p.name, photo: p.photo, position: cleanPosition(p.position) })),
      spotsOpen: target && count > 0 && count < target ? target - count : null,
    };

    const group = groups.get(sportSlug) ?? { slug: sportSlug, name: sport, number: "", total: 0, squads: {} };
    group.squads[side] = squad;
    group.total += count;
    groups.set(sportSlug, group);
  }

  const rank = (slug: string) => {
    const i = SPORT_ORDER.indexOf(slug);
    return i === -1 ? SPORT_ORDER.length : i;
  };
  return Array.from(groups.values())
    .sort((a, b) => rank(a.slug) - rank(b.slug) || a.name.localeCompare(b.name))
    .map((group, i) => ({ ...group, number: String(i + 1).padStart(2, "0") }));
}

/** The selection a URL asks for (?sport=football&g=men), falling back to the first squad. */
export function resolveSelection(groups: SportGroup[], sport?: string, g?: string): { sport: string; gender: Gender } {
  const group = groups.find((x) => x.slug === sport) ?? groups[0];
  if (!group) return { sport: "", gender: "men" };
  const wanted = g === "women" || g === "men" ? g : "men";
  const gender = group.squads[wanted] ? wanted : (GENDERS.find((x) => group.squads[x]) ?? "men");
  return { sport: group.slug, gender };
}

export function titleCount(achievements: Achievement[]): number {
  return trophyEntries(achievements).filter((entry) => entry.type === "title").length;
}
