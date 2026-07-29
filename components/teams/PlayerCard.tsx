import Image from "next/image";
import { Mail } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Player } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PlayerCard({ player }: { player: Player }) {
  return (
    <GlassCard hover className="flex flex-col items-center p-5 text-center">
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-gradient text-lg font-bold text-night-950">
        {player.photo ? (
          <Image src={player.photo} alt={player.name} fill sizes="64px" className="object-cover" />
        ) : (
          initials(player.name)
        )}
      </div>

      <h4 className="mt-3 font-bold text-white">{player.name}</h4>
      <p className="text-sm text-blue-400">{player.position}</p>

      <a
        href={`mailto:${player.email}`}
        className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-white"
      >
        <Mail className="h-3.5 w-3.5 shrink-0" />
        {player.email}
      </a>

      {player.bio && <p className="mt-3 line-clamp-2 text-xs text-slate-500">{player.bio}</p>}
    </GlassCard>
  );
}
