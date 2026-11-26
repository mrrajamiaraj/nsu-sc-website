"use client";

import { useCallback, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import { AlumniProfileModal } from "@/components/alumni/AlumniProfileModal";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { AlumniClassYear, AlumniProfile } from "@/lib/types";

const ALL = "All";
type FilterValue = typeof ALL | string; // "All" or an AlumniClassYear id

const TIERS: { tier: AlumniProfile["tier"]; title: string }[] = [
  { tier: "Executive", title: "Executive committee" },
  { tier: "Sub-Executive", title: "Sub-executive committee" },
];

// One option in the desktop year selector (a radio group: Tab enters it, arrow
// keys, Home and End move between years). The selected one gets a frosted
// highlight and a teal underline that slide between options.
function YearOption({
  active,
  label,
  count,
  onSelect,
  onKeyDown,
}: {
  active: boolean;
  label: string;
  count: number;
  onSelect: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className="group relative rounded-xl px-4 py-3 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
    >
      {active && (
        <motion.span
          layoutId="alumni-year-tab"
          className="absolute inset-0 rounded-xl border border-white/15 bg-white/10 shadow-glow"
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        >
          <span className="absolute inset-x-4 bottom-1 h-[2px] rounded-full bg-brand-gradient" />
        </motion.span>
      )}
      <span
        className={cn(
          "relative block whitespace-nowrap font-display text-xl font-semibold uppercase leading-none tracking-wide transition-colors",
          active ? "text-white" : "text-slate-400 group-hover:text-white",
        )}
      >
        {label}
        <span className={cn("ml-1.5 font-mono text-[11px] font-normal", active ? "text-blue-300" : "text-slate-500")}>
          {count}
        </span>
      </span>
    </button>
  );
}

export function AlumniFilterView({
  alumni,
  classYears,
}: {
  alumni: AlumniProfile[];
  classYears: AlumniClassYear[];
}) {
  // Only years that actually have someone get an option or a section. Admin order
  // puts the newest panel first.
  const panels = classYears
    .map((year) => ({ year, members: alumni.filter((profile) => profile.classYearId === year.id) }))
    .filter((panel) => panel.members.length > 0);

  // Open on the newest panel rather than every profile at once; "All" stays available.
  const [filter, setFilter] = useState<FilterValue>(panels[0]?.year.id ?? ALL);
  const [selected, setSelected] = useState<AlumniProfile | null>(null);
  const closeProfile = useCallback(() => setSelected(null), []);
  const optionsRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  if (panels.length === 0) {
    return <p className="px-4 pb-16 text-center text-slate-400">No past panels have been added yet.</p>;
  }

  const options = [ALL, ...panels.map((panel) => panel.year.id)];
  const currentIndex = panels.findIndex((panel) => panel.year.id === filter);
  const visiblePanels = filter === ALL ? panels : panels.filter((panel) => panel.year.id === filter);
  const shown = visiblePanels.reduce((sum, panel) => sum + panel.members.length, 0);
  const profiles = (n: number) => `${n} ${n === 1 ? "profile" : "profiles"}`;
  const summary =
    filter === ALL
      ? `Showing all ${profiles(shown)} across ${panels.length} panels`
      : `Showing ${profiles(shown)} from Panel ${panels[currentIndex].year.label}`;

  function handleOptionKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = options.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? (index + 1) % options.length
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (index - 1 + options.length) % options.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setFilter(options[next]);
    optionsRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  }

  // From the pager at the end of a panel: switch, bring the controls back into
  // view and put focus on the new panel's heading so keyboard users follow along.
  function goToPanel(id: string) {
    setFilter(id);
    controlsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  }

  const newer = currentIndex > 0 ? panels[currentIndex - 1] : null;
  const older = currentIndex >= 0 && currentIndex < panels.length - 1 ? panels[currentIndex + 1] : null;

  return (
    <>
      <Reveal className="px-4 pb-14">
        <div ref={controlsRef} className="mx-auto max-w-6xl scroll-mt-28">
          {/* Phones and tablets: one labelled dropdown lists every year without sideways swiping. */}
          <label className="mx-auto block max-w-sm lg:hidden">
            <span className="mb-2 block text-center font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
              Panel year
            </span>
            <span className="relative block">
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="glass-panel w-full appearance-none rounded-2xl px-5 py-3.5 pr-12 font-display text-xl font-semibold uppercase tracking-wide text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <option value={ALL} className="bg-night-900 font-sans text-base normal-case">
                  All panels ({alumni.length})
                </option>
                {panels.map(({ year, members }) => (
                  <option key={year.id} value={year.id} className="bg-night-900 font-sans text-base normal-case">
                    {year.label} ({members.length})
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              />
            </span>
          </label>

          {/* Desktop: every year visible at once, wrapping instead of scrolling sideways. */}
          <div className="hidden lg:block">
            <p
              id="alumni-year-label"
              className="mb-3 text-center font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400"
            >
              Browse by panel
            </p>
            <div
              ref={optionsRef}
              role="radiogroup"
              aria-labelledby="alumni-year-label"
              className="glass-panel mx-auto flex max-w-max flex-wrap justify-center gap-1 rounded-2xl p-1.5"
            >
              <YearOption
                active={filter === ALL}
                label="All"
                count={alumni.length}
                onSelect={() => setFilter(ALL)}
                onKeyDown={(event) => handleOptionKey(event, 0)}
              />
              {panels.map(({ year, members }, index) => (
                <YearOption
                  key={year.id}
                  active={filter === year.id}
                  label={year.label}
                  count={members.length}
                  onSelect={() => setFilter(year.id)}
                  onKeyDown={(event) => handleOptionKey(event, index + 1)}
                />
              ))}
            </div>
          </div>

          <p aria-live="polite" className="mt-5 text-center text-sm text-slate-400">
            {summary}
          </p>
        </div>
      </Reveal>

      {/* Timeline: one node per panel year on a vertical brand-gradient line. The
          line's center (7px + 1px) lines up with the 16px nodes' center. */}
      <div className="px-4 pb-16">
        <div className="relative mx-auto max-w-6xl">
          <div
            aria-hidden
            className="absolute bottom-0 left-[7px] top-3 w-[2px] rounded-full bg-gradient-to-b from-blue-300/70 via-blue-500/30 to-transparent"
          />

          {visiblePanels.map(({ year, members }, panelIndex) => (
            <section key={year.id} className="relative pb-16 pl-10 last:pb-0 sm:pl-14">
              <Reveal>
                <h2
                  ref={panelIndex === 0 ? headingRef : undefined}
                  tabIndex={-1}
                  className="relative mb-8 flex items-center gap-4 text-2xl font-bold text-white focus:outline-none sm:text-3xl"
                >
                  <span
                    aria-hidden
                    className="absolute -left-10 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center sm:-left-14"
                  >
                    {panelIndex === 0 && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-300/40 motion-reduce:hidden" />
                    )}
                    <span className="relative h-4 w-4 rounded-full border-2 border-blue-300 bg-night-900 shadow-glow" />
                  </span>
                  <span className="shrink-0">
                    Panel <span className="text-gradient-brand">{year.label}</span>
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                </h2>
              </Reveal>

              {TIERS.map(({ tier, title }) => {
                const tierAlumni = members.filter((profile) => profile.tier === tier);
                if (tierAlumni.length === 0) return null;

                return (
                  <div key={tier} className="mb-10 last:mb-0">
                    <Reveal>
                      <h3 className="mb-4 flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-[0.16em] text-blue-400">
                        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        {title}
                      </h3>
                    </Reveal>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {tierAlumni.map((profile, index) => (
                        <Reveal key={profile.id} delay={Math.min(index, 6) * 0.08} className="h-full">
                          <AlumniCard alumni={profile} onOpen={setSelected} />
                        </Reveal>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          ))}

          {/* Step through panels without scrolling back up to the selector. */}
          {(newer || older) && (
            <nav aria-label="Other panels" className="relative mt-14 flex flex-wrap justify-between gap-3 pl-10 sm:pl-14">
              {newer ? (
                <button
                  type="button"
                  onClick={() => goToPanel(newer.year.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  <ArrowLeft aria-hidden className="h-4 w-4" />
                  Newer panel · {newer.year.label}
                </button>
              ) : (
                <span />
              )}
              {older && (
                <button
                  type="button"
                  onClick={() => goToPanel(older.year.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Older panel · {older.year.label}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </button>
              )}
            </nav>
          )}
        </div>
      </div>

      <AlumniProfileModal alumni={selected} onClose={closeProfile} />
    </>
  );
}
