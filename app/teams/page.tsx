import type { Metadata } from "next";
import { Users } from "lucide-react";
import { TeamCard } from "@/components/teams/TeamCard";
import { TeamsStatsBar } from "@/components/teams/TeamsStatsBar";
import { getPlayersByTeam, getTeams } from "@/lib/data/teams";

export const metadata: Metadata = {
  title: "Teams",
};

export default async function TeamsPage() {
  const teams = await getTeams();
  const teamsWithPlayers = await Promise.all(
    teams.map(async (team) => ({ team, players: await getPlayersByTeam(team.id) })),
  );
  const totalMembers = teamsWithPlayers.reduce((sum, { players }) => sum + players.length, 0);

  return (
    <>
      <div className="px-4 pb-12 pt-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
          <Users className="h-3.5 w-3.5 text-blue-400" />
          Our Teams
        </div>
        <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
          Meet Our <span className="text-gradient-brand">Champions</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Dedicated athletes, expert coaches, and a winning tradition across all sports.
        </p>
      </div>

      <TeamsStatsBar championships="8+" medals="45+" members={totalMembers} winRate="72%" />

      <div className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamsWithPlayers.map(({ team, players }) => (
            <TeamCard key={team.id} team={team} players={players} />
          ))}
        </div>
      </div>
    </>
  );
}
