"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { AlumniClassYear, AlumniProfile } from "@/lib/types";

type FilterValue = "All" | string; // "All" or an AlumniClassYear id

const TIERS: { tier: AlumniProfile["tier"]; title: string }[] = [
  { tier: "Executive", title: "Executive committee" },
  { tier: "Sub-Executive", title: "Sub-executive committee" },
];

// One segment of the year selector: the year in display type. The selected one
// gets a frosted highlight and a teal underline that slide between segments.
function YearTab({ active, onSelect, label }: { active: boolean; onSelect: () => void; label: string }) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onSelect();
    // Keep the chosen year in view when the selector is scrolled sideways on phones.
    event.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={handleClick}
      className="group relative min-w-[88px] rounded-xl px-5 py-3.5 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
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
      <span className="relative block">
        <span
          className={cn(
            "block whitespace-nowrap font-display text-xl font-semibold uppercase leading-none tracking-wide transition-colors",
            active ? "text-white" : "text-slate-400 group-hover:text-white",
          )}
        >
          {label}
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
  const [filter, setFilter] = useState<FilterValue>("All");

  // Only years that actually have someone get a tab or a section.
  const panels = classYears
    .map((year) => ({ year, members: alumni.filter((profile) => profile.classYearId === year.id) }))
    .filter((panel) => panel.members.length > 0);
  const visiblePanels = filter === "All" ? panels : panels.filter((panel) => panel.year.id === filter);

  if (panels.length === 0) {
    return <p className="px-4 pb-16 text-center text-slate-400">No past panels have been added yet.</p>;
  }

  return (
    <>
      <Reveal className="px-4 pb-14">
        <p className="mb-3 text-center font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
          Browse by panel
        </p>
        {/* Centered when it fits; swipes sideways when there are more years than room. */}
        <div className="no-scrollbar mx-auto -my-3 max-w-6xl overflow-x-auto py-3">
          <div className="glass-panel mx-auto flex w-max items-stretch rounded-2xl p-1.5">
            <YearTab active={filter === "All"} onSelect={() => setFilter("All")} label="All" />
            {panels.map(({ year }) => (
              <YearTab key={year.id} active={filter === year.id} onSelect={() => setFilter(year.id)} label={year.label} />
            ))}
          </div>
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
                <h2 className="relative mb-8 flex items-center gap-4 text-2xl font-bold text-white sm:text-3xl">
                  <span
                    aria-hidden
                    className="absolute -left-10 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center sm:-left-14"
                  >
                    {panelIndex === 0 && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-300/40" />
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
                        <Reveal key={profile.id} delay={index * 0.08} className="h-full">
                          <AlumniCard alumni={profile} />
                        </Reveal>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
