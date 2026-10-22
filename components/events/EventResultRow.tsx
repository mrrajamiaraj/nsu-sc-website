import Link from "next/link";
import { ArrowRight, MapPin, Trophy } from "lucide-react";
import type { Event } from "@/lib/types";

// Calendar-style block: month + day + year, just the year when that's all that's
// known, or a dash when there's no date. Parsed from the string so a date-only
// value can't shift a day in negative-UTC-offset timezones.
function DateBlock({ event }: { event: Event }) {
  if (!event.date) {
    return <span className="text-lg font-semibold text-slate-500">—</span>;
  }
  const [year, month, day] = event.date.slice(0, 10).split("-").map(Number);
  if (event.yearOnly) {
    return <span className="text-xl font-semibold text-white">{year}</span>;
  }
  const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  return (
    <>
      <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-blue-400">{monthLabel}</span>
      <span className="text-2xl font-semibold leading-none text-white">{day}</span>
      <span className="font-mono text-[0.6875rem] text-slate-500">{year}</span>
    </>
  );
}

export function EventResultRow({ event }: { event: Event }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="glass-panel group flex items-center gap-4 p-4 transition-all duration-300 hover:border-white/25 sm:gap-6 sm:p-5"
    >
      <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 sm:w-20">
        <DateBlock event={event} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-white sm:text-lg">{event.name}</h3>
        <div className="mt-1.5 flex flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:flex-wrap sm:gap-x-5">
          {event.venue && (
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </span>
          )}
          {event.winners && (
            <span className="flex min-w-0 items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 shrink-0 text-amber-300" />
              <span className="truncate">{event.winners.split("\n").join(", ")}</span>
            </span>
          )}
        </div>
      </div>

      <ArrowRight className="h-5 w-5 shrink-0 text-slate-500 transition-all group-hover:translate-x-0.5 group-hover:text-white" />
    </Link>
  );
}
