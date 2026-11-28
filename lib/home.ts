import { countAthletes } from "@/lib/roster";
import { teamSlug } from "@/lib/squads";
import type { Achievement, Player, Team } from "@/lib/types";

// Club archive photos used until the admin sets their own (site content keys
// "home_hero_image" and "home_join_image").
// Hero: a mid-kick at the NSU Inter Batch Football Tournament 2026.
export const DEFAULT_HERO_PHOTO =
  "https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/events/04a052d6-5881-401b-8e98-b067c32d583b.webp";
// Join band: NSU SC players huddling in club kit at the Clemon Uni Campus Cricket tournament.
export const DEFAULT_JOIN_PHOTO =
  "https://pub-daabb81a0a394b2da1bd163e412287b8.r2.dev/events/ed2c20fb-6e16-44a4-a554-222fb8e9c39b.webp";

export interface SportSquad {
  id: string;
  label: string; // "Male", "Female", or the full team name when it has no such suffix
  athletes: number;
}

export interface SportCard {
  sport: string;
  photo: string | null;
  href: string; // the largest squad's page
  athletes: number;
  squads: SportSquad[];
}

const GENDER = /\s+(Male|Female)$/i;

// One card per sport, so a sport's men's and women's squads appear together.
// Ranked by athletes on record, then by having a squad photo.
export function sportCards(teams: Team[], playersByTeam: Map<string, Player[]>): SportCard[] {
  const bySport = new Map<string, { team: Team; athletes: number }[]>();
  for (const team of teams) {
    const sport = team.name.replace(GENDER, "").trim();
    const list = bySport.get(sport) ?? [];
    list.push({ team, athletes: countAthletes(playersByTeam.get(team.id) ?? []) });
    bySport.set(sport, list);
  }

  const cards: SportCard[] = [];
  for (const [sport, squads] of Array.from(bySport.entries())) {
    const sorted = [...squads].sort((a, b) => b.athletes - a.athletes);
    cards.push({
      sport,
      photo: sorted.find((squad) => squad.team.bannerImage)?.team.bannerImage ?? null,
      href: `/teams/${teamSlug(sorted[0].team)}`,
      athletes: sorted.reduce((sum, squad) => sum + squad.athletes, 0),
      squads: sorted.map((squad) => ({
        id: squad.team.id,
        label: squad.team.name.match(GENDER)?.[1] ?? squad.team.name,
        athletes: squad.athletes,
      })),
    });
  }
  return cards.sort((a, b) => b.athletes - a.athletes || Number(Boolean(b.photo)) - Number(Boolean(a.photo)));
}

const HONOUR = /champion|crowned|winner|\bcup\b|\btitle\b/i;

// Wall of fame: titles that name a win first (newest first), then the most recent others.
export function wallOfFame(achievements: Achievement[], limit = 4): Achievement[] {
  const byDate = (a: Achievement, b: Achievement) => (b.date ?? "").localeCompare(a.date ?? "");
  const honours = achievements.filter((a) => HONOUR.test(a.title)).sort(byDate);
  const rest = achievements.filter((a) => !HONOUR.test(a.title)).sort(byDate);
  return [...honours, ...rest].slice(0, limit);
}

// First sentence of an achievement's write-up, trimmed for a one-line caption.
export function oneLine(text: string, max = 110): string {
  const sentence = text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s/)[0] ?? "";
  return sentence.length > max ? `${sentence.slice(0, max - 1).trimEnd()}…` : sentence;
}
