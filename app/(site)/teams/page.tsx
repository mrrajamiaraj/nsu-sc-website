import type { Metadata } from "next";
import { Users } from "lucide-react";
import { TeamCard } from "@/components/teams/TeamCard";
import { StatRow } from "@/components/ui/StatRow";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPlayersGroupedByTeam, getTeams } from "@/lib/data/teams";
import { getRegistrationSettings } from "@/lib/data/registration";
import { getSiteContent } from "@/lib/data/site-content";
import { countAthletes } from "@/lib/roster";

export const metadata: Metadata = {
  title: "Teams",
  description: "Every NSU Games and Sports Club squad, with rosters, staff and records.",
};

export default async function TeamsPage() {
  const [teams, playersByTeam, registrationSettings, championships, medals, winRate] = await Promise.all([
    getTeams(),
    getPlayersGroupedByTeam(),
    getRegistrationSettings(),
    getSiteContent("teams_stat_championships"),
    getSiteContent("teams_stat_medals"),
    getSiteContent("teams_stat_win_rate"),
  ]);
  const teamsWithPlayers = teams.map((team) => ({ team, players: playersByTeam.get(team.id) ?? [] }));
  const athletes = teamsWithPlayers.reduce((sum, { players }) => sum + countAthletes(players), 0);

  return (
    <>
      <PageHeader
        icon={Users}
        eyebrow="Teams"
        title={
          <>
            Our <span className="text-gradient-brand">squads</span>
          </>
        }
        intro="Every team that represents North South University, with its roster, staff and record."
      />

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
