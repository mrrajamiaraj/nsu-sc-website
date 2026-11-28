"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { SentenceSelect, type SentenceOption } from "@/components/contact/form/SentenceSelect";
import { Dialog } from "@/components/contact/interaction/Dialog";
import { SportIcon } from "@/components/home/SportIcon";
import { TYPE_LABEL, TYPE_ORDER, type EntryType } from "@/lib/trophy";
import { cn } from "@/lib/utils";

export type TypeFilter = EntryType | "all";

const MIN_YEAR = 1990;

// Mini timeline from 1990 to this year. Years with entries are teal dots (bigger = more
// entries); dragging, clicking or the arrow keys jump the ledger to a year.
function YearScrubber({ years, active, max, onJump }: { years: Map<number, number>; active: number | null; max: number; onJump: (year: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const list = Array.from(years.keys()).sort((a, b) => a - b);
  const pct = (y: number) => ((y - MIN_YEAR) / (max - MIN_YEAR)) * 100;
  const current = active ?? list[list.length - 1] ?? max;

  const nearest = (clientX: number) => {
    const box = track.current!.getBoundingClientRect();
    const year = MIN_YEAR + ((clientX - box.left) / box.width) * (max - MIN_YEAR);
    return list.reduce((best, y) => (Math.abs(y - year) < Math.abs(best - year) ? y : best), list[0]);
  };
  const onPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.type === "pointerdown") e.currentTarget.setPointerCapture(e.pointerId);
    else if (!(e.buttons & 1)) return;
    if (list.length) onJump(nearest(e.clientX));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = list.indexOf(current);
    let next: number | undefined;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = list[Math.max(0, i - 1)];
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") next = list[Math.min(list.length - 1, i + 1)];
    else if (e.key === "Home") next = list[0];
    else if (e.key === "End") next = list[list.length - 1];
    if (next === undefined) return;
    e.preventDefault();
    onJump(next);
  };

  if (list.length === 0) return null;
  return (
    <div className="w-full min-w-[220px] max-w-[360px]">
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label="Jump to year"
        aria-valuemin={MIN_YEAR}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-valuetext={`${current}, ${years.get(current) ?? 0} ${years.get(current) === 1 ? "entry" : "entries"}`}
        onPointerDown={onPointer}
        onPointerMove={onPointer}
        onKeyDown={onKey}
        data-cursor="drag"
        className="relative h-10 cursor-pointer touch-none select-none"
      >
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-[#f5f1e8]/20" />
        {Array.from({ length: max - MIN_YEAR + 1 }, (_, k) => MIN_YEAR + k).map((y) => (
          <span key={y} aria-hidden className={cn("absolute top-1/2 w-px -translate-y-1/2 bg-[#f5f1e8]/20", y % 10 === 0 ? "h-3" : "h-1.5")} style={{ left: `${pct(y)}%` }} />
        ))}
        {list.map((y) => {
          const size = 6 + (years.get(y) ?? 1) * 3;
          return (
            <span
              key={y}
              aria-hidden
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3fcfca]"
              style={{ left: `${pct(y)}%`, width: size, height: size }}
            />
          );
        })}
        <motion.span
          aria-hidden
          className="absolute top-1/2 -ml-[9px] -mt-[9px] h-[18px] w-[18px] rounded-full border-2 border-[#f5f1e8] bg-[#0b2524]"
          animate={{ left: `${pct(current)}%` }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        >
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[12px] font-bold tabular-nums text-[#f5f1e8]">{current}</span>
        </motion.span>
      </div>
      <div aria-hidden className="flex justify-between text-[11px] text-[#f5f1e8]/40">
        <span>{MIN_YEAR}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export function FilterBar({
  type,
  counts,
  onType,
  sport,
  sports,
  onSport,
  years,
  activeYear,
  maxYear,
  onJump,
}: {
  type: TypeFilter;
  counts: Record<TypeFilter, number>;
  onType: (t: TypeFilter) => void;
  sport: string;
  sports: { key: string; label: string }[];
  onSport: (key: string) => void;
  years: Map<number, number>;
  activeYear: number | null;
  maxYear: number;
  onJump: (year: number) => void;
}) {
  const [sheet, setSheet] = useState(false);
  const tabs: TypeFilter[] = ["all", ...TYPE_ORDER];
  const sportOptions: SentenceOption[] = [
    { value: "", label: "All sports" },
    ...sports.map((s) => ({ value: s.key, label: s.label, icon: <SportIcon sport={s.label} className="h-4 w-4" /> })),
  ];

  return (
    <div className="sticky top-[84px] z-30 border-y border-white/10 bg-[#0b2524]/95 backdrop-blur-sm md:top-[92px]">
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-6 lg:px-8">
        <div role="group" aria-label="Filter by type" className="no-scrollbar -mx-2 flex min-w-0 flex-1 gap-1 overflow-x-auto px-2">
          {tabs.map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => onType(t)}
                className={cn("relative min-h-[52px] shrink-0 px-3 text-[15px] font-medium transition-colors", active ? "text-[#3fcfca]" : "text-[#f5f1e8]/70 hover:text-[#f5f1e8]")}
              >
                {t === "all" ? "All" : TYPE_LABEL[t].tab}
                <span className="ml-1.5 text-[13px] tabular-nums text-[#f5f1e8]/45">{counts[t]}</span>
                {active && <motion.span layoutId="trophy-type" className="absolute inset-x-2 bottom-2 h-[2px] rounded-full bg-[#3fcfca]" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
              </button>
            );
          })}
        </div>

        <div className="hidden items-center gap-6 py-2 text-[15px] lg:flex">
          <SentenceSelect id="trophy-sport" name="sport" label="Sport" value={sport} options={sportOptions} placeholder="All sports" onChange={onSport} />
          <YearScrubber years={years} active={activeYear} max={maxYear} onJump={onJump} />
        </div>

        <button
          type="button"
          onClick={() => setSheet(true)}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-white/20 px-4 text-[14px] font-semibold text-[#f5f1e8] lg:hidden"
        >
          <SlidersHorizontal aria-hidden className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Phones and tablets: sport and year in a bottom sheet. */}
      <Dialog open={sheet} onClose={() => setSheet(false)} labelledBy="filters-title" variant="sheet">
        <div className="px-5 pb-10">
          <h2 id="filters-title" className="text-[28px] !font-extrabold uppercase text-[#f5f1e8]">
            Filters
          </h2>
          <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/50">Sport</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sportOptions.map((o) => (
              <button
                key={o.value || "all"}
                type="button"
                aria-pressed={sport === o.value}
                onClick={() => onSport(o.value)}
                className={cn(
                  "inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-3.5 text-[15px] transition",
                  sport === o.value ? "border-[#3fcfca] text-[#3fcfca]" : "border-white/15 text-[#f5f1e8]/80",
                )}
              >
                {o.icon}
                {o.label}
              </button>
            ))}
          </div>
          <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/50">Jump to year</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from(years.keys())
              .sort((a, b) => b - a)
              .map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setSheet(false);
                    window.setTimeout(() => onJump(y), 350);
                  }}
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-white/15 px-3.5 text-[15px] font-semibold text-[#f5f1e8]"
                >
                  {y}
                  <span className="ml-1.5 text-[13px] font-normal text-[#f5f1e8]/45">{years.get(y)}</span>
                </button>
              ))}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
