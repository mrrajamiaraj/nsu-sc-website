"use client";

import { useState } from "react";
import { ListFilter } from "lucide-react";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import { FilterPill } from "@/components/ui/FilterPill";
import { Reveal } from "@/components/motion/Reveal";
import type { AlumniClassYear, AlumniProfile } from "@/lib/types";

type FilterValue = "All" | string; // "All" or an AlumniClassYear id

const TIERS: AlumniProfile["tier"][] = ["Executive", "Sub-Executive"];

export function AlumniFilterView({
  alumni,
  classYears,
}: {
  alumni: AlumniProfile[];
  classYears: AlumniClassYear[];
}) {
  const [filter, setFilter] = useState<FilterValue>("All");

  const visibleYears = filter === "All" ? classYears : classYears.filter((year) => year.id === filter);
  const yearsWithAlumni = visibleYears.filter((year) => alumni.some((profile) => profile.classYearId === year.id));

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 pb-12">
        <ListFilter className="mr-1 h-4 w-4 shrink-0 text-slate-500" />
        <FilterPill active={filter === "All"} onClick={() => setFilter("All")} layoutId="alumni-filter-pill">
          All Years
        </FilterPill>
        {classYears.map((year) => (
          <FilterPill
            key={year.id}
            active={filter === year.id}
            onClick={() => setFilter(year.id)}
            layoutId="alumni-filter-pill"
          >
            {year.label}
          </FilterPill>
        ))}
      </div>

      {yearsWithAlumni.length === 0 ? (
        <p className="px-4 pb-16 text-center text-slate-400">No alumni for this year yet.</p>
      ) : (
        yearsWithAlumni.map((year) => {
          const classOfYear = alumni.filter((profile) => profile.classYearId === year.id);

          return (
            <div key={year.id} className="px-4 pb-16">
              <div className="mx-auto max-w-6xl">
                <Reveal>
                  <h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl">Class of {year.label}</h2>
                </Reveal>

                {TIERS.map((tier) => {
                  const tierAlumni = classOfYear.filter((profile) => profile.tier === tier);
                  if (tierAlumni.length === 0) return null;

                  return (
                    <div key={tier} className="mb-10 last:mb-0">
                      <Reveal>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                          {tier === "Executive" ? "Executives" : "Sub-Executives"}
                        </h3>
                      </Reveal>
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {tierAlumni.map((profile, index) => (
                          <Reveal key={profile.id} delay={index * 0.08}>
                            <AlumniCard alumni={profile} />
                          </Reveal>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
