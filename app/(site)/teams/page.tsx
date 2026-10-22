import type { Metadata } from "next";
import { Users } from "lucide-react";
import { TeamCard } from "@/components/teams/TeamCard";
import { StatRow } from "@/components/ui/StatRow";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { Reveal } from "@/components/motion/Reveal";
import { getPlayersByTeam, getTeams } from "@/lib/data/teams";
import { getRegistrationSettings } from "@/lib/data/registration";
import { getSiteContent } from "@/lib/data/site-content";
import { countAthletes } from "@/lib/roster";

export const metadata: Metadata = {
  title: "Teams",
};

export default async function TeamsPage() {
  const [teams, registrationSettings, championships, medals, winRate] = await Promise.all([
    getTeams(),
    getRegistrationSettings(),
    getSiteContent("teams_stat_championships"),
    getSiteContent("teams_stat_medals"),
    getSiteContent("teams_stat_win_rate"),
  ]);
  const teamsWithPlayers = await Promise.all(
    teams.map(async (team) => ({ team, players: await getPlayersByTeam(team.id) })),
  );
  const athletes = teamsWithPlayers.reduce((sum, { players }) => sum + countAthletes(players), 0);

  return (
    <>
      <div className="px-4 pb-12 pt-4 text-center">
        <Reveal y={16}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-300">
            <Users className="h-3.5 w-3.5 text-blue-400" />
            Teams
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
            Our <span className="text-gradient-brand">squads</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Every team that represents North South University, with its roster, staff and record.
          </p>
        </Reveal>
      </div>

      {/* Only figures the admin has actually saved are shown — no stand-in numbers. */}
      <StatRow
        items={[
          { label: "Athletes", value: athletes || null },
          { label: "Championships", value: championships },
          { label: "Medals", value: medals },
          { label: "Win rate", value: winRate },
        ]}
      />

      <div className="px-4 pb-20">
        {teamsWithPlayers.length > 0 ? (
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamsWithPlayers.map(({ team, players }, index) => (
              <Reveal key={team.id} delay={Math.min(index, 6) * 0.08} className="h-full">
                <TeamCard team={team} players={players} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400">No squads have been added yet.</p>
        )}
      </div>

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
