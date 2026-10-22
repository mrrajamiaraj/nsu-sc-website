import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Trophy } from "lucide-react";
import { formatYear } from "@/lib/format";
import type { Achievement } from "@/lib/types";

// Fixed-shape card: title and description are clamped with reserved heights
// so every card in the grid is the same size. Full text lives on the detail page.
export function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <Link
      href={`/achievements/${achievement.id}`}
      className="glass-panel group flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5"
    >
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
        {/* Club-wide achievements have no team. */}
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
            {achievement.teamName || "NSU SC"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-bold text-white">{achievement.title}</h3>
        <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm text-slate-400">{achievement.description}</p>

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-500">
          {/* Year only: most entries are only known to the year. */}
          <span className="flex items-center gap-1.5">
            {achievement.date && (
              <>
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span className="font-mono">{formatYear(achievement.date)}</span>
              </>
            )}
          </span>
          <span className="flex items-center gap-1 font-medium text-blue-400 transition-colors group-hover:text-blue-300">
            View details
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
