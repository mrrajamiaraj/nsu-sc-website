"use client";

import { forwardRef } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUp, LayoutGrid, List, Search, X } from "lucide-react";
import { FlapText } from "@/components/home/matchday/SplitFlap";
import { ANTON, Face, Highlight, TIER_FILTERS, useOpenPerson, type TierFilter } from "@/components/members/sheet/shared";
import { SOCIAL_LABEL, SocialIcon } from "@/components/members/sheet/Socials";
import { TIER_LABEL, type PanelPerson } from "@/lib/members-sheet";
import { cn } from "@/lib/utils";

export type RosterView = "faces" | "list";
export type RosterSort = "az" | "tier" | "department";

const field = "min-h-[44px] rounded-lg border border-white/15 bg-[#0b2524] px-3 text-[15px] text-[#f5f1e8] transition hover:border-white/30 focus-visible:border-[#3fcfca]";

function Faces({ people, query }: { people: PanelPerson[]; query: string }) {
  const open = useOpenPerson();
  return (
    <ul className="roster-faces mx-auto flex max-w-[340px] flex-wrap justify-center gap-2 sm:max-w-[620px] lg:max-w-[784px]">
      <AnimatePresence mode="popLayout" initial={false}>
        {people.map((p) => (
          <motion.li key={p.slug} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="group relative">
            <button type="button" data-cursor="view" onClick={(e) => open(p, people, e.currentTarget)} aria-label={`${p.name}, ${p.role ?? TIER_LABEL[p.tier].one}`} className="block rounded-full">
              <Face person={p} size={56} className="ring-1 ring-white/10 transition duration-200 group-hover:scale-110 group-hover:ring-2 group-hover:ring-[#3fcfca]" />
            </button>
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-20 w-max max-w-[200px] -translate-x-1/2 rounded-md bg-[#f5f1e8] px-2.5 py-1.5 text-center text-[12px] leading-snug text-[#0b2524] opacity-0 shadow-lg transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
            >
              <span className="block font-semibold">
                <Highlight text={p.name} query={query} />
              </span>
              <span className="block text-[#0b2524]/65">{p.role ?? TIER_LABEL[p.tier].one}</span>
            </span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function SortHeader({ label, col, sort, dir, onSort, className }: { label: string; col: RosterSort; sort: RosterSort; dir: 1 | -1; onSort: (s: RosterSort) => void; className?: string }) {
  const on = sort === col;
  const Icon = dir === 1 ? ArrowDown : ArrowUp;
  return (
    <span role="columnheader" aria-sort={on ? (dir === 1 ? "ascending" : "descending") : "none"} className={className}>
      <button type="button" onClick={() => onSort(col)} className={cn("inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition", on ? "text-[#3fcfca]" : "text-[#f5f1e8]/50 hover:text-[#f5f1e8]")}>
        {label}
        <Icon aria-hidden className={cn("h-3 w-3", !on && "opacity-0")} />
      </button>
    </span>
  );
}

function ListView({ people, query, sort, dir, onSort, showDept, showSport }: { people: PanelPerson[]; query: string; sort: RosterSort; dir: 1 | -1; onSort: (s: RosterSort) => void; showDept: boolean; showSport: boolean }) {
  const open = useOpenPerson();
  const cols = cn("grid items-center gap-3 md:gap-4", "grid-cols-[40px_minmax(0,1fr)_20px]", showDept ? "md:grid-cols-[40px_minmax(0,1.4fr)_120px_minmax(0,1fr)_120px_72px_20px]" : "md:grid-cols-[40px_minmax(0,1.4fr)_130px_minmax(0,1fr)_72px_20px]");
  return (
    <div role="table" aria-label="Panel roster" aria-rowcount={people.length + 1} className="border-t border-white/10">
      <div role="row" className={cn(cols, "hidden border-b border-white/10 px-3 py-3 md:grid")}>
        <span role="columnheader" className="sr-only">
          Portrait
        </span>
        <SortHeader label="Name" col="az" sort={sort} dir={dir} onSort={onSort} />
        <SortHeader label="Tier" col="tier" sort={sort} dir={dir} onSort={onSort} />
        <span role="columnheader" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/50">
          Role{showSport ? " · sport" : ""}
        </span>
        {showDept && <SortHeader label="Department" col="department" sort={sort} dir={dir} onSort={onSort} />}
        <span role="columnheader" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/50">
          Socials
        </span>
        <span aria-hidden />
      </div>
      <LayoutGroup>
        {people.map((p) => (
          // Rows off screen skip layout and paint until scrolled near (cheap at 90 rows).
          <motion.div key={p.slug} layout="position" role="row" className="group relative border-b border-white/[0.06] [contain-intrinsic-size:auto_64px] [content-visibility:auto]">
            <button
              type="button"
              onClick={(e) => open(p, people, e.currentTarget)}
              aria-label={`${p.name}, ${p.role ?? TIER_LABEL[p.tier].one}. Open profile`}
              className="absolute inset-0 z-0 rounded-md transition-colors hover:bg-white/[0.04] focus-visible:bg-white/[0.04]"
            />
            <div className={cn(cols, "pointer-events-none relative z-10 px-3 py-3")}>
              <span role="cell">
                <Face person={p} size={40} />
              </span>
              <span role="cell" className="min-w-0">
                <span className="block truncate text-[15px] font-semibold text-[#f5f1e8]">
                  <Highlight text={p.name} query={query} />
                </span>
                <span className="block truncate text-[13px] text-[#f5f1e8]/55 md:hidden">{p.role ?? TIER_LABEL[p.tier].one}</span>
              </span>
              <span role="cell" className="hidden text-[14px] text-[#f5f1e8]/75 md:block">
                <Highlight text={TIER_LABEL[p.tier].one} query={query} />
              </span>
              <span role="cell" className="hidden min-w-0 truncate text-[14px] text-[#f5f1e8]/75 md:block">
                <Highlight text={[p.role, p.sport].filter(Boolean).join(" · ") || "—"} query={query} />
              </span>
              {showDept && (
                <span role="cell" className="hidden truncate text-[14px] text-[#f5f1e8]/75 md:block">
                  <Highlight text={p.department ?? "—"} query={query} />
                </span>
              )}
              <span role="cell" className="pointer-events-auto hidden items-center gap-1 md:flex">
                {p.socials.map((s) => (
                  <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on ${SOCIAL_LABEL[s.key]}`} className="flex h-8 w-8 items-center justify-center rounded-full text-[#f5f1e8]/60 transition hover:bg-white/10 hover:text-[#3fcfca]">
                    <SocialIcon kind={s.key} className="h-4 w-4" />
                  </a>
                ))}
              </span>
              <ArrowRight aria-hidden className="h-4 w-4 -translate-x-1 text-[#3fcfca] opacity-0 transition duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </motion.div>
        ))}
      </LayoutGroup>
    </div>
  );
}

// Everyone on the panel: search, tier / sport filters, sort, and a Faces or List view.
export const Roster = forwardRef<
  HTMLInputElement,
  {
    people: PanelPerson[];
    total: number;
    query: string;
    onQuery: (q: string) => void;
    tier: TierFilter;
    onTier: (t: TierFilter) => void;
    sport: string;
    sports: string[];
    onSport: (s: string) => void;
    sort: RosterSort;
    dir: 1 | -1;
    onSort: (s: RosterSort) => void;
    view: RosterView;
    onView: (v: RosterView) => void;
    showDept: boolean;
  }
>(function Roster({ people, total, query, onQuery, tier, onTier, sport, sports, onSport, sort, dir, onSort, view, onView, showDept }, searchRef) {
  const reduce = Boolean(useReducedMotion());
  const tierWord = tier === "all" ? "people" : tier === "general" ? "general members" : tier === "advisor" ? "advisors" : `${TIER_LABEL[tier].one.toLowerCase()}s`;

  return (
    <section id="roster" aria-labelledby="roster-heading" className="mx-auto mt-28 max-w-[1280px] scroll-mt-28 px-4 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="roster-heading" className={cn(ANTON, "text-[36px] !leading-none text-[#f5f1e8] md:text-[48px]")}>
          The roster
        </h2>
        <p className="flex items-baseline gap-2 text-[15px] text-[#f5f1e8]/65">
          Showing
          <FlapText text={String(people.length).padStart(2, " ")} charset="0123456789" still={reduce} cycle={false} className="text-[18px]" />
          of {total}
        </p>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        Showing {people.length} {tierWord}
        {query ? ` matching ${query}` : ""}
      </p>

      {/* Toolbar */}
      <div className="sticky top-[84px] z-30 -mx-4 mt-6 flex flex-wrap items-center gap-2 border-y border-white/10 bg-[#0b2524]/95 px-4 py-3 backdrop-blur-sm md:top-[92px] md:mx-0 md:rounded-lg md:border md:px-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search the roster</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f5f1e8]/50" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search name, role, department or sport…"
            aria-keyshortcuts="/"
            className={cn(field, "w-full pl-9 pr-16 placeholder:text-[#f5f1e8]/40")}
          />
          {query ? (
            <button type="button" onClick={() => onQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#f5f1e8]/60 hover:bg-white/10 hover:text-[#f5f1e8]">
              <X aria-hidden className="h-4 w-4" />
            </button>
          ) : (
            <kbd aria-hidden className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-white/20 px-1.5 text-[12px] text-[#f5f1e8]/50 md:block">
              /
            </kbd>
          )}
        </label>
        <label className="flex items-center gap-2">
          <span className="sr-only">Tier</span>
          <select value={tier} onChange={(e) => onTier(e.target.value as TierFilter)} className={field}>
            {TIER_FILTERS.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All tiers" : TIER_LABEL[t].many}
              </option>
            ))}
          </select>
        </label>
        {sports.length > 0 && (
          <label className="flex items-center gap-2">
            <span className="sr-only">Sport</span>
            <select value={sport} onChange={(e) => onSport(e.target.value)} className={field}>
              <option value="">All sports</option>
              {sports.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex items-center gap-2">
          <span className="sr-only">Sort</span>
          <select value={sort} onChange={(e) => onSort(e.target.value as RosterSort)} className={field}>
            <option value="az">A–Z</option>
            <option value="tier">By tier</option>
            {showDept && <option value="department">By department</option>}
          </select>
        </label>
        <div role="radiogroup" aria-label="View" className="flex rounded-lg border border-white/15 p-0.5">
          {(["faces", "list"] as RosterView[]).map((v) => {
            const Icon = v === "faces" ? LayoutGrid : List;
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={view === v}
                onClick={() => onView(v)}
                className={cn("relative inline-flex min-h-[40px] items-center gap-1.5 rounded-md px-3 text-[14px] font-semibold transition", view === v ? "text-[#002e2c]" : "text-[#f5f1e8]/70 hover:text-[#f5f1e8]")}
              >
                {view === v && <motion.span layoutId="roster-view" className="absolute inset-0 rounded-md bg-[#3fcfca]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                <Icon aria-hidden className="relative h-4 w-4" />
                <span className="relative">{v === "faces" ? "Faces" : "List"}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 min-h-[240px]">
        {people.length === 0 ? (
          <p className="py-16 text-center text-[16px] text-[#f5f1e8]/65">
            No one matches &lsquo;{query}&rsquo;. Try a role, a tier or a shorter name.
            <button type="button" onClick={() => (onQuery(""), onTier("all"), onSport(""))} className="ml-2 font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
              Clear filters
            </button>
          </p>
        ) : view === "faces" ? (
          <Faces people={people} query={query} />
        ) : (
          <ListView people={people} query={query} sort={sort} dir={dir} onSort={onSort} showDept={showDept} showSport={sports.length > 0} />
        )}
      </div>
    </section>
  );
});
