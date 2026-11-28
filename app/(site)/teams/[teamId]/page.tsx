import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ContactStage } from "@/components/contact/interaction/ContactStage";
import { Reveal } from "@/components/contact/interaction/Pointer";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { LineupHero, type HeroInfo } from "@/components/teams/announcement/LineupHero";
import { ProfileDrawer } from "@/components/teams/announcement/ProfileDrawer";
import { SquadCta, SquadRecord } from "@/components/teams/announcement/RecordAndCta";
import { RosterProvider } from "@/components/teams/announcement/RosterContext";
import { TeamSheet } from "@/components/teams/announcement/TeamSheet";
import { getAchievements } from "@/lib/data/achievements";
import { getCutoutFrames } from "@/lib/data/cutouts";
import { getRegistrationSettings } from "@/lib/data/registration";
import { getPlayersByTeam, getTeamById, getTeamStaff, getTeams } from "@/lib/data/teams";
import { clubRegistration } from "@/lib/registration";
import { detailPageMetadata } from "@/lib/seo";
import { GENDER_LABEL, slugify, squadHonours, teamSlug, teamSport } from "@/lib/squads";
import { buildTeamSheet } from "@/lib/team-sheet";
import type { Team } from "@/lib/types";

export async function generateStaticParams() {
  const teams = await getTeams();
  return teams.map((team) => ({ teamId: teamSlug(team) }));
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Squads live at /teams/<sport>-<men|women> ("cricket-men"). Older links by team id still
// resolve; the page itself sends them on to the readable address.
async function findTeam(param: string) {
  if (UUID.test(param)) return getTeamById(param);
  return (await getTeams()).find((team) => teamSlug(team) === param.toLowerCase()) ?? null;
}

function names(team: Team) {
  const { sport, gender } = teamSport(team);
  const side = gender ? GENDER_LABEL[gender] : "Squad";
  return { sport, gender, side, title: `NSU ${sport}${gender ? ` — ${side}'s squad` : ""}` };
}

export async function generateMetadata({ params }: { params: { teamId: string } }): Promise<Metadata> {
  const team = await findTeam(params.teamId);
  if (!team) return { title: "Team" };
  const { title, sport, side } = names(team);
  return detailPageMetadata({
    title,
    description: `The NSU ${sport.toLowerCase()} ${side.toLowerCase()}'s squad: players by role, captain, staff and honours.`,
    path: `/teams/${teamSlug(team)}`,
    image: team.bannerImage,
  });
}

// "Team announcement": the squad lined up like a reveal graphic, then a role-grouped team
// sheet with profiles, honours and the way to trials. One template for every sport.
export default async function TeamDetailPage({ params, searchParams }: { params: { teamId: string }; searchParams: { player?: string | string[] } }) {
  const team = await findTeam(params.teamId);
  if (!team) notFound();
  if (params.teamId !== teamSlug(team)) permanentRedirect(`/teams/${teamSlug(team)}`);

  const [roster, staff, achievements, registration] = await Promise.all([
    getPlayersByTeam(team.id),
    getTeamStaff(team.id),
    getAchievements(),
    getRegistrationSettings(),
  ]);
  const { sport, gender, side } = names(team);
  const frames = await getCutoutFrames([...roster.map((p) => p.photo), ...staff.managers.map((m) => m.photo), ...staff.inCharges.map((m) => m.photo)].filter(Boolean) as string[]);
  const sheet = buildTeamSheet(slugify(sport), roster, staff, frames);
  const honours = squadHonours(team, achievements);
  const club = clubRegistration(registration);

  const managers = sheet.staff.filter((s) => /manager|coach/i.test(s.role ?? ""));
  const leads = managers.length ? managers : sheet.staff;
  const info: HeroInfo = {
    sportSlug: slugify(sport),
    sport,
    side,
    secondLine: gender ? `${side}'s squad` : "Squad",
    backHref: `/teams?sport=${slugify(sport)}${gender ? `&g=${gender}` : ""}`,
    players: sheet.players.length,
    captain: sheet.captain?.name ?? null,
    staff: leads.length ? { label: leads[0].role?.replace(/^Team /, "") ?? "Staff", names: leads.map((s) => s.name).join(", ") } : null,
    lastResult: honours[0] ?? null,
    teamPhoto: team.bannerImage,
  };
  const player = typeof searchParams.player === "string" ? searchParams.player : null;

  return (
    <HomeMotionConfig>
      <div className="-mt-28 overflow-x-clip bg-[#0b2524] pb-4 pt-28 [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactStage pitch={false}>
          <RosterProvider people={[...sheet.players, ...sheet.staff]} initialPlayer={player}>
            <LineupHero info={info} players={sheet.players} />
            {sheet.players.length > 0 || sheet.staff.length > 0 ? (
              <TeamSheet groups={sheet.groups} staff={sheet.staff} />
            ) : null}
            <ProfileDrawer squadLabel={`${sport} — ${side}`} honours={honours} />
          </RosterProvider>
          <Reveal>
            <SquadRecord honours={honours} />
          </Reveal>
          <SquadCta sport={sport} teamName={team.name} club={club} />
        </ContactStage>
      </div>
    </HomeMotionConfig>
  );
}
