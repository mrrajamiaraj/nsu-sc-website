import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getAchievements } from "@/lib/data/achievements";
import { getCutoutFrames } from "@/lib/data/cutouts";
import { getImageRatios } from "@/lib/data/image-sizes";
import { getPlayersGroupedByTeam, getTeams } from "@/lib/data/teams";
import { GENDER_LABEL, teamSlug, teamSport } from "@/lib/squads";
import { buildTeamSheet, normaliseName, type SheetPerson } from "@/lib/team-sheet";
import { entryPath, isUuid, ledgerOrder, relatedEntries, sportKey, trophyEntries, type EntryType, type TrophyEntry } from "@/lib/trophy";

// "Match report": everything one achievement's page needs, built on the server. The same
// data drives the full page (/achievements/<slug>) and the story overlay in the trophy room.

export interface ReportLink {
  id: string;
  slug: string;
  href: string;
  title: string;
  year: number | null;
  type: EntryType;
  sport: string;
  photo: string | null;
}

export interface ReportPerson {
  key: string;
  name: string;
  role: string | null;
  /** The profile shown in the drawer (a squad player's real record when there is one). */
  person: SheetPerson;
  squad: { label: string; href: string } | null;
  /** Every achievement on record that names this person, this one included. */
  achievements: ReportLink[];
}

export interface ReportData {
  entry: TrophyEntry;
  href: string;
  photos: { src: string; ratio: number | null }[];
  prev: ReportLink | null;
  next: ReportLink | null;
  related: ReportLink[];
  people: ReportPerson[];
  /** null when the count isn't available (the congrats table isn't set up yet). */
  congrats: number | null;
  cta: { label: string; href: string };
}

const linkOf = (e: TrophyEntry): ReportLink => ({
  id: e.id,
  slug: e.slug,
  href: entryPath(e),
  title: e.title,
  year: e.year,
  type: e.type,
  sport: e.sport,
  photo: e.photos[0] ?? null,
});

const initialsOf = (name: string) =>
  name
    .replace(/[^A-Za-z0-9' ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

async function congratsCounts(): Promise<Map<string, number> | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("achievement_congrats").select("achievement_id, count");
    if (error) return null;
    return new Map((data ?? []).map((row) => [row.achievement_id as string, row.count as number]));
  } catch {
    return null;
  }
}

// Trials link for the sport of each achievement. Futsal is played by the football squad.
function ctaFor(entry: TrophyEntry, squads: { sport: string; name: string }[]): ReportData["cta"] {
  const key = sportKey(entry.sport);
  if (entry.sport === "Club") return { label: "Join the club", href: "/contact?topic=trials" };
  const lookup = key === "futsal" ? "football" : key;
  const women = /\(female\)/i.test(entry.sport);
  const squad = squads.find((s) => s.sport === lookup && /female/i.test(s.name) === women);
  const label = `Join ${key} trials`;
  return { label, href: squad ? `/contact?topic=trials&squad=${encodeURIComponent(squad.name)}` : "/contact?topic=trials" };
}

export const getReports = cache(async (): Promise<{ entries: TrophyEntry[]; reports: Record<string, ReportData> }> => {
  const [achievements, teams, playersByTeam, counts] = await Promise.all([getAchievements(), getTeams(), getPlayersGroupedByTeam(), congratsCounts()]);
  const entries = trophyEntries(achievements);
  const order = ledgerOrder(entries);
  const ratios = await getImageRatios(entries.flatMap((e) => e.photos));

  // People named on an achievement, matched to a squad roster by name.
  const credited = Array.from(new Set(entries.flatMap((e) => e.credits.map((c) => c.name))));
  const roster = new Map<string, { teamId: string; playerId: string }>();
  for (const [teamId, players] of Array.from(playersByTeam)) {
    for (const p of players) {
      const name = normaliseName(p.name).toLowerCase();
      if (credited.some((c) => c.toLowerCase() === name)) roster.set(name, { teamId, playerId: p.id });
    }
  }
  const matchedPhotos = Array.from(roster.values())
    .map(({ teamId, playerId }) => playersByTeam.get(teamId)?.find((p) => p.id === playerId)?.photo)
    .filter(Boolean) as string[];
  const frames = matchedPhotos.length ? await getCutoutFrames(matchedPhotos) : {};
  const squads = teams.map((t) => ({ sport: teamSport(t).sport.toLowerCase(), name: t.name }));

  const personOf = (name: string, role: string | null): Pick<ReportPerson, "person" | "squad"> => {
    const hit = roster.get(name.toLowerCase());
    const team = hit ? teams.find((t) => t.id === hit.teamId) : undefined;
    const player = hit ? playersByTeam.get(hit.teamId)?.find((p) => p.id === hit.playerId) : undefined;
    if (team && player) {
      const { sport, gender } = teamSport(team);
      const sheet = buildTeamSheet(teamSlug(team).replace(/-(men|women)$/, ""), [player], { managers: [], inCharges: [] }, frames);
      const person = sheet.players[0] ?? sheet.staff[0];
      if (person) return { person, squad: { label: `NSU ${sport}${gender ? ` ${GENDER_LABEL[gender]}` : ""}`, href: `/teams/${teamSlug(team)}?player=${person.slug}` } };
    }
    return {
      squad: null,
      person: {
        id: name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        name,
        role,
        mark: initialsOf(name),
        number: null,
        group: "Players",
        captain: null,
        photo: null,
        frame: null,
        bio: null,
        links: [],
      },
    };
  };

  const reports: Record<string, ReportData> = {};
  order.forEach((entry, i) => {
    reports[entry.id] = {
      entry,
      href: entryPath(entry),
      photos: entry.photos.map((src) => ({ src, ratio: ratios[src] ?? null })),
      prev: i > 0 ? linkOf(order[i - 1]) : null,
      next: i < order.length - 1 ? linkOf(order[i + 1]) : null,
      related: relatedEntries(entry, entries).map(linkOf),
      people: entry.credits.map((credit) => ({
        key: credit.name,
        name: credit.name,
        role: credit.role,
        ...personOf(credit.name, credit.role),
        achievements: order.filter((e) => e.people.includes(credit.name)).map(linkOf),
      })),
      congrats: counts ? (counts.get(entry.id) ?? 0) : null,
      cta: ctaFor(entry, squads),
    };
  });
  return { entries, reports };
});

// One report by slug, or by the old uuid (the page redirects those to the slug).
export async function findReport(param: string): Promise<ReportData | null> {
  const { entries, reports } = await getReports();
  const entry = entries.find((e) => e.slug === param) ?? (isUuid(param) ? entries.find((e) => e.id === param) : undefined);
  return entry ? reports[entry.id] : null;
}
