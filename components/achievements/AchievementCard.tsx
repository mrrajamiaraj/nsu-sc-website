import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { formatYear } from "@/lib/format";
import type { Achievement } from "@/lib/types";

// One timeline entry: date + team, title + clamped description, and the photo
// beside it when there is one. Full text lives on the detail page.
export function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <Link
      href={`/achievements/${achievement.id}`}
      className="glass-panel group flex flex-col overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5 sm:flex-row"
    >
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {/* Year only: most entries are only known to the year. */}
          {achievement.date && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              <span className="font-mono">{formatYear(achievement.date)}</span>
            </span>
          )}
          {/* Club-wide achievements have no team. */}
          <span className="rounded-full bg-blue-500 px-2.5 py-0.5 font-semibold text-white">
            {achievement.teamName || "NSU SC"}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-bold text-white">{achievement.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-slate-400">{achievement.description}</p>

        <span className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-400 transition-colors group-hover:text-blue-300">
          View details
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>

      {achievement.photo && (
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-56 lg:w-64">
          <Image
            src={achievement.photo}
            alt={achievement.title}
            fill
            sizes="(min-width: 1024px) 16rem, (min-width: 640px) 14rem, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
      )}
    </Link>
  );
}
