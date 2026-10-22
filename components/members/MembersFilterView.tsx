"use client";

import { useState } from "react";
import { ListFilter } from "lucide-react";
import { MemberCard } from "@/components/members/MemberCard";
import { FilterPill } from "@/components/ui/FilterPill";
import { Reveal } from "@/components/motion/Reveal";
import type { Member, MemberTier } from "@/lib/types";

type FilterValue = "All" | MemberTier;

const SECTIONS: { tier: MemberTier; tab: string; title: string }[] = [
  { tier: "Faculty Advisor", tab: "Advisors", title: "Faculty advisors" },
  { tier: "Executive", tab: "Executive", title: "Executive committee" },
  { tier: "Sub-Executive", tab: "Sub-executive", title: "Sub-executive committee" },
  { tier: "General", tab: "General", title: "General members" },
];

export function MembersFilterView({ membersByTier }: { membersByTier: Record<MemberTier, Member[]> }) {
  const [filter, setFilter] = useState<FilterValue>("All");

  const sections = SECTIONS.filter((section) => membersByTier[section.tier].length > 0);
  const visibleSections = sections.filter((section) => filter === "All" || filter === section.tier);
  const total = sections.reduce((sum, section) => sum + membersByTier[section.tier].length, 0);

  const tabs: { value: FilterValue; label: string; count: number }[] = [
    { value: "All", label: "Everyone", count: total },
    ...sections.map((section) => ({ value: section.tier, label: section.tab, count: membersByTier[section.tier].length })),
  ];

  if (sections.length === 0) {
    return <p className="px-4 pb-16 text-center text-slate-400">No members have been added to this panel yet.</p>;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 pb-12">
        <ListFilter className="mr-1 h-4 w-4 text-slate-500" />
        {tabs.map((tab) => (
          <FilterPill
            key={tab.value}
            active={filter === tab.value}
            onClick={() => setFilter(tab.value)}
            layoutId="members-filter-pill"
            count={tab.count}
          >
            {tab.label}
          </FilterPill>
        ))}
      </div>

      {visibleSections.map((section) => (
        <section key={section.tier} className="px-4 pb-20">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl">{section.title}</h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {membersByTier[section.tier].map((member, index) => (
                <Reveal key={member.id} delay={Math.min(index, 8) * 0.08} className="h-full">
                  <MemberCard member={member} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
