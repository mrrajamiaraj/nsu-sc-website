"use client";

import { useState } from "react";
import { ListFilter } from "lucide-react";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import { FilterPill } from "@/components/ui/FilterPill";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { AlumniClassYear, AlumniProfile } from "@/lib/types";

type FilterValue = "All" | string; // "All" or an AlumniClassYear id

const TIERS: { tier: AlumniProfile["tier"]; title: string }[] = [
  { tier: "Executive", title: "Executive committee" },
  { tier: "Sub-Executive", title: "Sub-executive committee" },
];

function TabLabel({ label, count, active }: { label: string; count: number; active: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      {label}
      <span className={cn("font-mono text-xs", active ? "text-night-950/70" : "text-slate-500")}>{count}</span>
    </span>
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
  const total = panels.reduce((sum, panel) => sum + panel.members.length, 0);

  if (panels.length === 0) {
    return <p className="px-4 pb-16 text-center text-slate-400">No past panels have been added yet.</p>;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 pb-12">
        <ListFilter className="mr-1 h-4 w-4 shrink-0 text-slate-500" />
        <FilterPill active={filter === "All"} onClick={() => setFilter("All")} layoutId="alumni-filter-pill">
          <TabLabel label="All years" count={total} active={filter === "All"} />
        </FilterPill>
        {panels.map(({ year, members }) => (
          <FilterPill
            key={year.id}
            active={filter === year.id}
            onClick={() => setFilter(year.id)}
            layoutId="alumni-filter-pill"
          >
            <TabLabel label={year.label} count={members.length} active={filter === year.id} />
          </FilterPill>
        ))}
      </div>

      {visiblePanels.map(({ year, members }) => (
        <section key={year.id} className="px-4 pb-16">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h2 className="mb-8 flex flex-wrap items-baseline gap-x-3 border-b border-white/10 pb-4 text-2xl font-bold text-white sm:text-3xl">
                Panel {year.label}
                <span className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                  {members.length} {members.length === 1 ? "person" : "people"}
                </span>
              </h2>
            </Reveal>

            {TIERS.map(({ tier, title }) => {
              const tierAlumni = members.filter((profile) => profile.tier === tier);
              if (tierAlumni.length === 0) return null;

              return (
                <div key={tier} className="mb-10 last:mb-0">
                  <Reveal>
                    <h3 className="mb-4 font-mono text-sm font-medium uppercase tracking-[0.16em] text-blue-400">
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
          </div>
        </section>
      ))}
    </>
  );
}
