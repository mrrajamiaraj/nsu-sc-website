import type { Metadata } from "next";
import { Users } from "lucide-react";
import { TeamCard } from "@/components/teams/TeamCard";
import { TeamsStatsBar } from "@/components/teams/TeamsStatsBar";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { Reveal } from "@/components/motion/Reveal";
import { getPlayersByTeam, getTeams } from "@/lib/data/teams";
import { getRegistrationSettings } from "@/lib/data/registration";
import { getSiteContent } from "@/lib/data/site-content";

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
  const totalMembers = teamsWithPlayers.reduce((sum, { players }) => sum + players.length, 0);

  return (
    <>
      <div className="px-4 pb-12 pt-4 text-center">
        <Reveal y={16}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
            <Users className="h-3.5 w-3.5 text-blue-400" />
            Our Teams
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
            Meet Our <span className="text-gradient-brand">Champions</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Dedicated athletes, expert coaches, and a winning tradition across all sports.
          </p>
        </Reveal>
      </div>

      <TeamsStatsBar
        championships={championships ?? "8+"}
        medals={medals ?? "45+"}
        members={totalMembers}
        winRate={winRate ?? "72%"}
      />

      <div className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamsWithPlayers.map(({ team, players }, index) => (
            <Reveal key={team.id} delay={index * 0.08}>
              <TeamCard team={team} players={players} />
            </Reveal>
          ))}
        </div>
      </div>

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
