import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Shield, Trophy, Users } from "lucide-react";
import { PlayerCard } from "@/components/teams/PlayerCard";
import { Reveal } from "@/components/motion/Reveal";
import { getPlayersByTeam, getTeamById, getTeams } from "@/lib/data/teams";

export async function generateStaticParams() {
  const teams = await getTeams();
  return teams.map((team) => ({ teamId: team.id }));
}

export async function generateMetadata({ params }: { params: { teamId: string } }): Promise<Metadata> {
  const team = await getTeamById(params.teamId);
  return { title: team?.nickname ?? team?.name ?? "Team" };
}

export default async function TeamDetailPage({ params }: { params: { teamId: string } }) {
  const team = await getTeamById(params.teamId);
  if (!team) notFound();

  const players = await getPlayersByTeam(team.id);
  const coach = players.find((player) => player.position.toLowerCase().includes("coach"))?.name ?? "TBA";
  const captain = players.find((player) => player.position.toLowerCase().includes("captain"))?.name ?? "TBA";

  return (
    <>
      <div className="px-4 pb-6">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/teams"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teams
          </Link>
        </div>
      </div>

      <div className="px-4 pb-10">
        <Reveal className="glass-panel mx-auto max-w-6xl overflow-hidden p-0">
          <div className="relative aspect-[21/9] w-full overflow-hidden sm:aspect-[3/1]">
            {team.bannerImage ? (
              <Image src={team.bannerImage} alt={team.name} fill sizes="100vw" className="object-cover" priority />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
                <Shield className="h-14 w-14 text-night-950/40" strokeWidth={1.5} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-night-950/95 via-night-950/30 to-transparent" />
            <div className="absolute left-3 top-3 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
              {team.name}
            </div>
            <div className="absolute bottom-0 left-0 p-5 sm:p-8">
              <h1 className="text-3xl font-extrabold text-white sm:text-5xl">{team.nickname ?? team.name}</h1>
              {team.achievement && (
                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-blue-300 sm:text-base">
                  <Trophy className="h-4 w-4 shrink-0" />
                  {team.achievement}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
            <p className="text-slate-300 sm:col-span-2">{team.description}</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm sm:justify-end">
              <div>
                <p className="text-slate-500">Coach</p>
                <p className="font-medium text-white">{coach}</p>
              </div>
              <div>
                <p className="text-slate-500">Captain</p>
                <p className="font-medium text-white">{captain}</p>
              </div>
              <div>
                <p className="text-slate-500">Members</p>
                <p className="font-medium text-white">{players.length} Athletes</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mb-8 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Roster</h2>
            </div>
          </Reveal>

          {players.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {players.map((player, index) => (
                <Reveal key={player.id} delay={index * 0.08}>
                  <PlayerCard player={player} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Roster coming soon.</p>
          )}
        </div>
      </div>
    </>
  );
}
