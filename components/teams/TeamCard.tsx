import Image from "next/image";
import Link from "next/link";
import { Shield, Trophy } from "lucide-react";
import type { Player, Team } from "@/lib/types";

function findByRole(players: Player[], role: string) {
  return players.find((player) => player.position.toLowerCase().includes(role))?.name ?? "TBA";
}

export function TeamCard({ team, players }: { team: Team; players: Player[] }) {
  const coach = findByRole(players, "coach");
  const captain = findByRole(players, "captain");

  return (
    <Link
      href={`/teams/${team.id}`}
      className="glass-panel group block overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {team.bannerImage ? (
          <Image
            src={team.bannerImage}
            alt={team.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
            <Shield className="h-10 w-10 text-night-950/40" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {team.name}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white">{team.nickname ?? team.name}</h3>
        {team.achievement && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-blue-400">
            <Trophy className="h-3.5 w-3.5 shrink-0" />
            {team.achievement}
          </p>
        )}

        <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Coach</span>
            <span className="font-medium text-white">{coach}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Captain</span>
            <span className="font-medium text-white">{captain}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Members</span>
            <span className="font-medium text-white">{players.length} Athletes</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
