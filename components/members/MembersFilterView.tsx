"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ListFilter, Search, X } from "lucide-react";
import { MemberPortraitCard } from "@/components/members/MemberPortraitCard";
import { MemberProfileModal } from "@/components/members/MemberProfileModal";
import { FilterPill } from "@/components/ui/FilterPill";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { Member, MemberTier } from "@/lib/types";

type FilterValue = "All" | MemberTier;

// General members get smaller cards in a denser grid; leadership tiers get the large portraits.
const SECTIONS: { tier: MemberTier; tab: string; title: string; compact: boolean }[] = [
  { tier: "Faculty Advisor", tab: "Advisors", title: "Faculty advisors", compact: false },
  { tier: "Executive", tab: "Executive", title: "Executive committee", compact: false },
  { tier: "Sub-Executive", tab: "Sub-executive", title: "Sub-executive committee", compact: true },
  { tier: "General", tab: "General", title: "General members", compact: true },
];

const matches = (member: Member, query: string) =>
  !query || `${member.name} ${member.designation ?? ""}`.toLowerCase().includes(query);

export function MembersFilterView({ membersByTier }: { membersByTier: Record<MemberTier, Member[]> }) {
  const [filter, setFilter] = useState<FilterValue>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const closeProfile = useCallback(() => setSelected(null), []);

  const sections = SECTIONS.filter((section) => membersByTier[section.tier].length > 0);
  const total = sections.reduce((sum, section) => sum + membersByTier[section.tier].length, 0);
  const normalizedQuery = query.trim().toLowerCase();

  const visibleSections = useMemo(
    () =>
      sections
        .filter((section) => filter === "All" || filter === section.tier)
        .map((section) => ({ ...section, members: membersByTier[section.tier].filter((m) => matches(m, normalizedQuery)) }))
        .filter((section) => section.members.length > 0),
    [sections, filter, membersByTier, normalizedQuery],
  );

  const tabs: { value: FilterValue; label: string; count: number }[] = [
    { value: "All", label: "Everyone", count: total },
    ...sections.map((section) => ({ value: section.tier, label: section.tab, count: membersByTier[section.tier].length })),
  ];

  if (sections.length === 0) {
    return <p className="px-4 pb-16 text-center text-slate-400">No members have been added to this panel yet.</p>;
  }

  return (
    <>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 pb-14">
        <div className="flex flex-wrap items-center justify-center gap-2">
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

        <label className="relative w-full max-w-sm">
          <span className="sr-only">Search members</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or role"
            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-10 text-sm text-white placeholder:text-slate-500 backdrop-blur-md transition-colors focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
      </div>

      {visibleSections.length === 0 && (
        <p className="px-4 pb-20 text-center text-slate-400">
          No one matches &ldquo;{query.trim()}&rdquo;.{" "}
          <button type="button" onClick={() => setQuery("")} className="font-medium text-blue-400 hover:text-blue-300">
            Clear search
          </button>
        </p>
      )}

      {visibleSections.map((section) => (
        <section key={section.tier} className="px-4 pb-20">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="mb-8 flex items-end gap-4">
                <span className="font-mono text-sm text-blue-400">
                  {String(sections.findIndex((s) => s.tier === section.tier) + 1).padStart(2, "0")}
                </span>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">{section.title}</h2>
                <span className="mb-1.5 hidden h-px flex-1 bg-gradient-to-r from-white/20 to-transparent sm:block" />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-500">
                  {section.members.length} {section.members.length === 1 ? "person" : "people"}
                </span>
              </div>
            </Reveal>

            <motion.div
              layout
              className={cn(
                "grid gap-5",
                section.compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              <AnimatePresence mode="popLayout">
                {section.members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: Math.min(index, 8) * 0.06 } }}
                    exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
                    className="h-full"
                  >
                    <MemberPortraitCard member={member} compact={section.compact} onOpen={setSelected} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      ))}

      <MemberProfileModal member={selected} onClose={closeProfile} />
    </>
  );
}
