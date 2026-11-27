"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Trophy } from "lucide-react";

export type LiveStripData =
  | {
      kind: "next";
      id: string;
      name: string;
      date: string | null; // ISO date of the first day; null when not announced
      dateLabel: string | null;
      venue: string | null;
      live: boolean;
      registerUrl: string | null;
    }
  | { kind: "result"; id: string; name: string; dateLabel: string | null; champions: string[] };

// Days, hours and minutes to the start of the event day in Dhaka (UTC+6).
function remaining(date: string) {
  const ms = new Date(`${date}T00:00:00+06:00`).getTime() - Date.now();
  if (ms <= 0) return null;
  const mins = Math.floor(ms / 60000);
  return { d: Math.floor(mins / 1440), h: Math.floor((mins % 1440) / 60), m: mins % 60 };
}

function Countdown({ date }: { date: string }) {
  const [left, setLeft] = useState<ReturnType<typeof remaining> | undefined>(undefined);
  useEffect(() => {
    const tick = () => setLeft(remaining(date));
    tick();
    const timer = setInterval(tick, 30000);
    return () => clearInterval(timer);
  }, [date]);

  // Before the clock starts (and without scripts) nothing is shown here; the date beside it carries the information.
  if (!left) return null;
  const unit = (n: number, label: string) => (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="font-display text-2xl font-extrabold tabular-nums text-white">{String(n).padStart(2, "0")}</span>
      <span className="text-xs uppercase text-slate-400">{label}</span>
    </span>
  );
  return (
    <span className="inline-flex items-center gap-2" aria-label={`Starts in ${left.d} days, ${left.h} hours, ${left.m} minutes`}>
      {unit(left.d, "d")}
      <span aria-hidden className="text-slate-500">:</span>
      {unit(left.h, "h")}
      <span aria-hidden className="text-slate-500">:</span>
      {unit(left.m, "m")}
    </span>
  );
}

// Slim band under the hero: the next confirmed event with a countdown, or the latest result.
export function LiveStrip({ data }: { data: LiveStripData }) {
  const label = data.kind === "result" ? "Latest result" : data.live ? "Live now" : "Next up";

  return (
    <section id="live" aria-label={label} className="scroll-mt-24 border-y border-white/10 bg-[#0f302e]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#3fcfca] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#002e2c]">
          {data.kind === "result" ? <Trophy aria-hidden className="h-3.5 w-3.5" /> : <span aria-hidden className="h-2 w-2 rounded-full bg-[#002e2c] motion-safe:animate-pulse" />}
          {label}
        </span>

        <Link href={`/events/${data.id}`} className="min-w-0 font-display text-xl font-bold uppercase tracking-wide text-white hover:text-[#79d8d5]">
          {data.name}
        </Link>

        {data.kind === "next" ? (
          <>
            {data.date && !data.live && <Countdown date={data.date} />}
            <span className="text-sm text-slate-300">{[data.dateLabel ?? "Dates to be announced", data.venue].filter(Boolean).join(" · ")}</span>
            <span className="ml-auto">
              {data.registerUrl ? (
                <a
                  href={data.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#79d8d5] hover:text-white"
                >
                  Register
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </a>
              ) : (
                <Link href={`/events/${data.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#79d8d5] hover:text-white">
                  Event details
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              )}
            </span>
          </>
        ) : (
          <>
            {data.champions.length > 0 && (
              <span className="min-w-0 text-sm text-slate-300">
                {data.champions.slice(0, 2).join(" · ")}
                {data.champions.length > 2 && ` · +${data.champions.length - 2} more`}
              </span>
            )}
            <Link href="#result" className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#79d8d5] hover:text-white">
              See the result
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
