"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BLUR, STATUS_TEXT, eventHref } from "@/components/events/hub/shared";
import { dateRange, type HubEvent } from "@/lib/events-hub";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
type Typical = { month: number; code: string; name: string; slug: string };

const dayOfYear = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return (d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000;
};

// Lanes so bars on overlapping dates stack instead of covering each other.
function lanes<T extends { from: number; to: number }>(items: T[]): (T & { lane: number })[] {
  const ends: number[] = [];
  return [...items]
    .sort((a, b) => a.from - b.from)
    .map((it) => {
      let lane = ends.findIndex((end) => end < it.from - 1);
      if (lane === -1) lane = ends.length;
      ends[lane] = it.to + 6; // a little air for the label
      return { ...it, lane };
    });
}

// "This year" places each event on its dates; "Typical year" shows when recurring events
// usually happen, so students can plan even in the off-season.
export function SeasonStrip({ events, typical, today }: { events: HubEvent[]; typical: Typical[]; today: string }) {
  const year = Number(today.slice(0, 4));
  const [mode, setMode] = useState<"year" | "typical">("year");
  const [hover, setHover] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const todayPct = (dayOfYear(today) / 365) * 100;

  // Phones: start with today in the middle.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = (el.scrollWidth * todayPct) / 100 - el.clientWidth / 2;
  }, [todayPct]);

  const thisYear = lanes(
    events
      .filter((e) => e.start && !e.yearOnly && e.start.startsWith(String(year)))
      .map((e) => ({ e, from: dayOfYear(e.start!), to: dayOfYear(e.end ?? e.start!) })),
  );
  const typicalBars = lanes(typical.map((t) => ({ t, from: t.month * 30.4 + 2, to: t.month * 30.4 + 26 })));
  const bars = mode === "year" ? thisYear : typicalBars;
  const laneCount = Math.max(1, ...bars.map((b) => b.lane + 1));

  return (
    <section aria-labelledby="season-heading" className="mx-auto max-w-[1280px] px-4 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="season-heading" className="text-[32px] !font-extrabold leading-none text-[#f5f1e8] md:text-[40px]">
          {mode === "year" ? `Season ${year}` : "A typical year"}
        </h2>
        <div role="radiogroup" aria-label="Calendar view" className="inline-flex rounded-full border border-white/15 bg-[#071a19] p-1">
          {(
            [
              ["year", "This year"],
              ["typical", "Typical year"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={mode === k}
              onClick={() => setMode(k)}
              className={cn("relative z-0 min-h-[36px] rounded-full px-4 text-[13px] font-semibold", mode === k ? "text-[#002e2c]" : "text-[#f5f1e8]/70 hover:text-[#f5f1e8]")}
            >
              {mode === k && <motion.span layoutId="strip-mode" aria-hidden className="absolute inset-0 -z-10 rounded-full bg-[#3fcfca]" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      <div ref={scroller} data-cursor="drag" className="no-scrollbar mt-6 overflow-x-auto pb-2">
        <div className="relative min-w-[860px]">
          {/* Months */}
          <ol className="grid grid-cols-12 border-b border-white/15">
            {MONTHS.map((m, i) => (
              <li key={m} className={cn("border-l border-white/10 px-2 pb-2 text-[12px] font-semibold uppercase tracking-[0.14em]", mode === "year" && i === Number(today.slice(5, 7)) - 1 ? "text-[#3fcfca]" : "text-[#f5f1e8]/50")}>
                {m}
              </li>
            ))}
          </ol>

          <div className="relative" style={{ height: laneCount * 40 + 16 }}>
            {/* Month lines */}
            <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-12">
              {MONTHS.map((m) => (
                <span key={m} className="border-l border-white/[0.06]" />
              ))}
            </div>
            {mode === "year" && (
              <span aria-hidden className="absolute bottom-0 top-0 w-[2px] bg-[#3fcfca]" style={{ left: `${todayPct}%` }}>
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-[#3fcfca] px-1.5 text-[10px] font-bold uppercase text-[#002e2c]">Today</span>
              </span>
            )}

            <ul aria-label={mode === "year" ? `Events in ${year}` : "Recurring events by month"}>
              {mode === "year"
                ? thisYear.map(({ e, from, to, lane }) => {
                    const left = (from / 365) * 100;
                    const width = Math.max(((to - from + 1) / 365) * 100, 1.4);
                    const on = hover === e.id;
                    return (
                      <li key={e.id} className="absolute" style={{ left: `${left}%`, top: 12 + lane * 40, width: `${width}%`, zIndex: on ? 20 : 1 }}>
                        <Link
                          href={eventHref(e)}
                          aria-label={`${e.name}, ${dateRange(e)}, ${STATUS_TEXT[e.status]}`}
                          onPointerEnter={() => setHover(e.id)}
                          onPointerLeave={() => setHover(null)}
                          onFocus={() => setHover(e.id)}
                          onBlur={() => setHover(null)}
                          className={cn(
                            "relative flex h-7 min-w-full items-center whitespace-nowrap rounded-sm px-1.5 text-[11px] font-bold uppercase",
                            e.status === "finished" ? "bg-[#f5f1e8]/25 text-[#f5f1e8] hover:bg-[#f5f1e8]/40" : "bg-[#3fcfca] text-[#002e2c]",
                            e.status === "live" && "motion-safe:animate-pulse",
                          )}
                        >
                          <span className="relative">{e.code}</span>
                        </Link>
                        <AnimatePresence>
                          {on && (
                            <motion.div
                              role="tooltip"
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              transition={{ duration: 0.15 }}
                              className="pointer-events-none absolute left-0 top-full z-30 mt-2 flex w-64 gap-3 rounded-lg border border-white/15 bg-[#082120] p-2.5 shadow-xl"
                            >
                              <span className="relative block h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-[#0f302e]">
                                {e.poster && <Image src={e.poster} alt="" fill sizes="48px" placeholder="blur" blurDataURL={BLUR} className="object-cover" />}
                              </span>
                              <span className="min-w-0 text-left">
                                <span className="block text-[13px] font-semibold leading-snug text-[#f5f1e8]">{e.name}</span>
                                <span className="block text-[12px] text-[#f5f1e8]/60">{[dateRange(e), e.venue].filter(Boolean).join(" · ")}</span>
                                <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3fcfca]">{STATUS_TEXT[e.status]}</span>
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })
                : typicalBars.map(({ t, from, lane }) => (
                    <li key={t.code} className="absolute" style={{ left: `${(from / 365) * 100}%`, top: 12 + lane * 40, width: `${(24 / 365) * 100}%` }}>
                      <Link href={`/events/${t.slug}`} title={t.name} className="flex h-7 items-center whitespace-nowrap rounded-sm border border-dashed border-[#3fcfca]/60 px-1.5 text-[11px] font-bold uppercase text-[#3fcfca] hover:bg-[#3fcfca]/10">
                        {t.code}
                        <span className="sr-only">: {t.name}, usually in {MONTHS[t.month]}</span>
                      </Link>
                    </li>
                  ))}
            </ul>
          </div>
        </div>
      </div>
      {mode === "year" && thisYear.length === 0 && <p className="mt-2 text-[14px] text-[#f5f1e8]/55">Nothing on the calendar for {year} yet. Switch to the typical year to see what usually runs when.</p>}
    </section>
  );
}
