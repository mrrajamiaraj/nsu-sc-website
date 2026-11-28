import type { Metadata } from "next";
import { ContactStage } from "@/components/contact/interaction/ContactStage";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { AtAGlance } from "@/components/teams/squad-select/AtAGlance";
import { SquadSelect } from "@/components/teams/squad-select/SquadSelect";
import { SquadsHero } from "@/components/teams/squad-select/SquadsHero";
import { TrialsBand } from "@/components/teams/squad-select/TrialsBand";
import { getAchievements } from "@/lib/data/achievements";
import { getRegistrationSettings } from "@/lib/data/registration";
import { getAllTeamStaff, getPlayersGroupedByTeam, getTeams } from "@/lib/data/teams";
import { clubRegistration } from "@/lib/registration";
import { buildSquads, resolveSelection, titleCount } from "@/lib/squads";

export const metadata: Metadata = {
  title: "Teams",
  description: "Every NSU Games & Sports Club squad by sport, men's and women's, with captains, staff and results.",
};

type Search = { sport?: string | string[]; g?: string | string[] };
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

// "Squad select": the squads organised by sport, each with a Men / Women switch. Everything
// is rendered on the server, including the squad the URL asks for (default Football, Men).
export default async function TeamsPage({ searchParams }: { searchParams: Search }) {
  const [teams, playersByTeam, staffByTeam, achievements, registration] = await Promise.all([
    getTeams(),
    getPlayersGroupedByTeam(),
    getAllTeamStaff(),
    getAchievements(),
    getRegistrationSettings(),
  ]);
  const groups = buildSquads(teams, playersByTeam, staffByTeam, achievements);
  const initial = resolveSelection(groups, one(searchParams.sport), one(searchParams.g));
  const club = clubRegistration(registration);
  const squadCount = groups.reduce((n, g) => n + Object.keys(g.squads).length, 0);
  const athletes = groups.reduce((n, g) => n + g.total, 0);

  return (
    <HomeMotionConfig>
      <div className="-mt-28 bg-[#0b2524] pb-4 pt-28 [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactStage>
          <SquadsHero athletes={athletes} squads={squadCount} sports={groups.length} titles={titleCount(achievements)} />
          {groups.length > 0 ? (
            <>
              <SquadSelect groups={groups} initial={initial} signup={{ open: club.open, formUrl: club.formUrl }} />
              <AtAGlance groups={groups} />
            </>
          ) : (
            <p className="mx-auto max-w-[1280px] px-4 text-[#f5f1e8]/60 sm:px-6 lg:px-8">No squads have been added yet.</p>
          )}
          <TrialsBand groups={groups} club={club} initial={initial} />
        </ContactStage>
      </div>
    </HomeMotionConfig>
  );
}
