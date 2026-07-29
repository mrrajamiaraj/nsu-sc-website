"use client";

import { useState } from "react";
import { ListFilter } from "lucide-react";
import { MemberCard } from "@/components/members/MemberCard";
import { FilterPill } from "@/components/ui/FilterPill";
import { Reveal } from "@/components/motion/Reveal";
import type { Member, MemberTier } from "@/lib/types";

type FilterValue = "All" | MemberTier;

const SECTIONS: { tier: MemberTier; title: string }[] = [
  { tier: "Executive", title: "Executive Members" },
  { tier: "Sub-Executive", title: "Sub-Executive Members" },
  { tier: "General", title: "General Members" },
];

const FILTERS: FilterValue[] = ["All", "Executive", "Sub-Executive", "General"];

export function MembersFilterView({ membersByTier }: { membersByTier: Record<MemberTier, Member[]> }) {
  const [filter, setFilter] = useState<FilterValue>("All");

  const visibleSections = SECTIONS.filter(
    (section) => (filter === "All" || filter === section.tier) && membersByTier[section.tier].length > 0,
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 pb-12">
        <ListFilter className="mr-1 h-4 w-4 text-slate-500" />
        {FILTERS.map((value) => (
          <FilterPill key={value} active={filter === value} onClick={() => setFilter(value)} layoutId="members-filter-pill">
            {value === "All" ? "All Members" : value}
          </FilterPill>
        ))}
      </div>

      {visibleSections.length === 0 ? (
        <p className="px-4 pb-16 text-center text-slate-400">No members to show yet.</p>
      ) : (
        visibleSections.map((section) => (
          <div key={section.tier} className="px-4 pb-20">
            <div className="mx-auto max-w-6xl">
              <Reveal>
                <h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl">{section.title}</h2>
              </Reveal>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {membersByTier[section.tier].map((member, index) => (
                  <Reveal key={member.id} delay={index * 0.08}>
                    <MemberCard member={member} />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}
