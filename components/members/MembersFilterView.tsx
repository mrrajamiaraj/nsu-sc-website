"use client";

import { useCallback, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { MemberPortraitCard } from "@/components/members/MemberPortraitCard";
import { MemberProfileModal } from "@/components/members/MemberProfileModal";
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

// One plain text tab. A thin teal underline slides to the selected one.
function RosterTab({ active, onSelect, label }: { active: boolean; onSelect: () => void; label: string }) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onSelect();
    // Keep the chosen tab in view when the row is scrolled sideways on phones.
    event.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={handleClick}
      className={cn(
        "relative shrink-0 whitespace-nowrap px-4 py-3 first:pl-0 font-display text-lg font-medium uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-400",
        active ? "text-white" : "text-slate-400 hover:text-white",
      )}
    >
      {label}
      {active && (
        <motion.span
          layoutId="members-roster-tab"
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[2px] bg-blue-400"
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      )}
    </button>
  );
}

export function MembersFilterView({ membersByTier }: { membersByTier: Record<MemberTier, Member[]> }) {
  const [filter, setFilter] = useState<FilterValue>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const closeProfile = useCallback(() => setSelected(null), []);

  const sections = SECTIONS.filter((section) => membersByTier[section.tier].length > 0);
  const normalizedQuery = query.trim().toLowerCase();

  const visibleSections = useMemo(
    () =>
      sections
        .filter((section) => filter === "All" || filter === section.tier)
        .map((section) => ({ ...section, members: membersByTier[section.tier].filter((m) => matches(m, normalizedQuery)) }))
        .filter((section) => section.members.length > 0),
    [sections, filter, membersByTier, normalizedQuery],
  );

  const tabs: { value: FilterValue; label: string }[] = [
    { value: "All", label: "Everyone" },
    ...sections.map((section) => ({ value: section.tier, label: section.tab })),
  ];

  if (sections.length === 0) {
    return <p className="px-4 pb-16 text-center text-slate-400">No members have been added to this panel yet.</p>;
  }

  return (
    <>
      {/* Classic tab row on a thin rule, with search at its right end (below it on phones). */}
      <div className="px-4 pb-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:border-b lg:border-white/15">
          <div className="no-scrollbar -mx-4 overflow-x-auto border-b border-white/15 px-4 lg:mx-0 lg:border-0 lg:px-0">
            <div className="flex w-max">
              {tabs.map((tab) => (
                <RosterTab
                  key={tab.value}
                  active={filter === tab.value}
                  onSelect={() => setFilter(tab.value)}
                  label={tab.label}
                />
              ))}
            </div>
          </div>

          <label className="relative block w-full shrink-0 lg:w-56">
            <span className="sr-only">Search members</span>
            <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or role"
              className="w-full bg-transparent py-3 pl-7 pr-7 text-sm text-white placeholder:text-slate-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-0 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
        </div>
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
                <h2 className="text-2xl font-bold text-white sm:text-3xl">{section.title}</h2>
                <span className="mb-1.5 hidden h-px flex-1 bg-gradient-to-r from-white/20 to-transparent sm:block" />
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
