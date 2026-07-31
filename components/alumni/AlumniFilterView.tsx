"use client";

import { useState } from "react";
import { ListFilter } from "lucide-react";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import { FilterPill } from "@/components/ui/FilterPill";
import { Reveal } from "@/components/motion/Reveal";
import type { AlumniProfile } from "@/lib/types";

type FilterValue = "All" | number;

const TIERS: AlumniProfile["tier"][] = ["Executive", "Sub-Executive"];

export function AlumniFilterView({ alumni, years }: { alumni: AlumniProfile[]; years: number[] }) {
  const [filter, setFilter] = useState<FilterValue>("All");
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const sliderYear = filter === "All" ? maxYear : filter;

  const visibleYears = filter === "All" ? years : years.filter((year) => year === filter);
  const yearsWithAlumni = visibleYears.filter((year) => alumni.some((profile) => profile.graduationYear === year));

  // Reference labels under the track — every 5th year plus both ends —
  // so it's easy to see where a drag will land instead of guessing blind.
  const tickYears = years.filter((year) => year === minYear || year === maxYear || (year - minYear) % 5 === 0);

  return (
    <>
      <div className="mx-auto mb-4 flex max-w-md items-center justify-center gap-2 px-4">
        <ListFilter className="h-4 w-4 shrink-0 text-slate-500" />
        <FilterPill active={filter === "All"} onClick={() => setFilter("All")} layoutId="alumni-filter-pill">
          All Years
        </FilterPill>
      </div>

      <div className="mx-auto mb-12 max-w-md px-4">
        <div className="mb-2 text-center">
          <span
            className={
              filter === "All" ? "text-sm text-slate-500" : "text-lg font-bold text-white"
            }
          >
            Class of {sliderYear}
          </span>
        </div>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          step={1}
          list="alumni-year-ticks"
          value={sliderYear}
          onChange={(event) => setFilter(Number(event.target.value))}
          aria-label="Select graduation year"
          className="year-slider w-full"
        />
        <datalist id="alumni-year-ticks">
          {years.map((year) => (
            <option key={year} value={year} />
          ))}
        </datalist>
        <div className="relative mt-1.5 h-4 text-xs text-slate-500">
          {tickYears.map((year) => (
            <span
              key={year}
              className="absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0 last:-translate-x-full"
              style={{ left: `${((year - minYear) / (maxYear - minYear)) * 100}%` }}
            >
              {year}
            </span>
          ))}
        </div>
      </div>

      {yearsWithAlumni.length === 0 ? (
        <p className="px-4 pb-16 text-center text-slate-400">No alumni for this year yet.</p>
      ) : (
        yearsWithAlumni.map((year) => {
          const classOfYear = alumni.filter((profile) => profile.graduationYear === year);

          return (
            <div key={year} className="px-4 pb-16">
              <div className="mx-auto max-w-6xl">
                <Reveal>
                  <h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl">Class of {year}</h2>
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
