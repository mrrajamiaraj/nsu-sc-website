import Image from "next/image";
import { CalendarDays, Trophy } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Achievement } from "@/lib/types";

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div className="glass-panel group flex flex-col overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {achievement.photo ? (
          <Image
            src={achievement.photo}
            alt={achievement.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
            <Trophy className="h-12 w-12 text-night-950/40" strokeWidth={1.5} />
          </div>
        )}
        {achievement.teamName && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
              {achievement.teamName}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-white">{achievement.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-slate-400">{achievement.description}</p>

        <div className="mt-4 flex items-center gap-1.5 border-t border-white/10 pt-3 text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          {formatDate(achievement.date)}
        </div>
      </div>
    </div>
  );
}
