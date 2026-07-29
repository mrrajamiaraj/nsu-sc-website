"use client";

import { useState } from "react";
import { ListFilter } from "lucide-react";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import { FilterPill } from "@/components/ui/FilterPill";
import { Reveal } from "@/components/motion/Reveal";
import type { AlumniProfile } from "@/lib/types";

type FilterValue = "All" | number;

export function AlumniFilterView({ alumni, years }: { alumni: AlumniProfile[]; years: number[] }) {
  const [filter, setFilter] = useState<FilterValue>("All");

  const filtered = filter === "All" ? alumni : alumni.filter((profile) => profile.graduationYear === filter);

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 pb-12">
        <ListFilter className="mr-1 h-4 w-4 text-slate-500" />
        <FilterPill active={filter === "All"} onClick={() => setFilter("All")} layoutId="alumni-filter-pill">
          All Years
        </FilterPill>
        {years.map((year) => (
          <FilterPill key={year} active={filter === year} onClick={() => setFilter(year)} layoutId="alumni-filter-pill">
            {year}
          </FilterPill>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="px-4 pb-16 text-center text-slate-400">No alumni for this year yet.</p>
      ) : (
        <div className="px-4 pb-20">
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((profile, index) => (
              <Reveal key={profile.id} delay={index * 0.08}>
                <AlumniCard alumni={profile} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
