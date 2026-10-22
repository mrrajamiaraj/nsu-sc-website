import Image from "next/image";
import Link from "next/link";
import { Shield, Trophy } from "lucide-react";
import { countAthletes, findPlayerByRole } from "@/lib/roster";
import type { Player, Team } from "@/lib/types";

export function TeamCard({ team, players }: { team: Team; players: Player[] }) {
  const coach = findPlayerByRole(players, "coach");
  const captain = findPlayerByRole(players, "captain");
  const athletes = countAthletes(players);
  const summary = [
    athletes > 0 && `${athletes} ${athletes === 1 ? "athlete" : "athletes"}`,
    coach && `Coach ${coach}`,
    captain && `Captain ${captain}`,
  ].filter(Boolean);

  return (
    <Link
      href={`/teams/${team.id}`}
      className="glass-panel group flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5"
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
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-white">{team.name}</h3>
        {team.nickname && team.nickname !== team.name && (
          <p className="mt-0.5 text-sm text-slate-400">{team.nickname}</p>
        )}
        {team.achievement && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-blue-400">
            <Trophy className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {team.achievement}
          </p>
        )}
        {summary.length > 0 && (
          <div className="mt-auto pt-4">
            <p className="border-t border-white/10 pt-4 text-sm text-slate-400">{summary.join(" · ")}</p>
          </div>
        )}
      </div>
    </Link>
  );
}
