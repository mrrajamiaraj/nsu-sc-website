"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, Search, X } from "lucide-react";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { RoundPortrait } from "@/components/alumni/relay/shared";
import type { OpenPerson } from "@/components/alumni/relay/PanelView";
import type { RelayPanel, RelayPerson } from "@/lib/alumni-relay";
import { cn } from "@/lib/utils";

type SortKey = "name" | "role" | "panel";
type Facet = "role" | "committee" | "panel";

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-transparent text-[#3fcfca]">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

// A row of text filters with a sliding underline.
function FilterRow({ label, options, value, onChange, id }: { label: string; options: string[]; value: string; onChange: (v: string) => void; id: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-24 shrink-0 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/45">{label}</span>
      <div role="radiogroup" aria-label={label} className="no-scrollbar flex gap-1 overflow-x-auto">
        {["All", ...options].map((opt) => {
          const on = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(opt)}
              className={cn("relative shrink-0 px-2.5 py-2 text-[14px] font-medium", on ? "text-[#3fcfca]" : "text-[#f5f1e8]/65 hover:text-[#f5f1e8]")}
            >
              {opt}
              {on && <motion.span layoutId={`dir-${id}`} aria-hidden className="absolute inset-x-2 bottom-0.5 h-[2px] rounded-full bg-[#3fcfca]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const ROLE_ORDER = ["President", "General Secretary", "Vice President", "Treasurer", "Joint Secretary"];

// "All": every past panel member in one dense, searchable, sortable list.
export function Directory({ panels, onOpen }: { panels: RelayPanel[]; onOpen: OpenPerson }) {
  const people = useMemo(() => panels.flatMap((p) => [...p.executives, ...p.subExecutives]), [panels]);
  const labelOf = useMemo(() => new Map(panels.map((p) => [p.slug, p.label])), [panels]);
  const panelRank = useMemo(() => new Map(panels.map((p, i) => [p.slug, i])), [panels]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<Facet, string>>({ role: "All", committee: "All", panel: "All" });
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "panel", desc: false });
  const [hover, setHover] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  // "/" jumps to the search field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || t.closest("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      input.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const roles = useMemo(() => {
    const set = Array.from(new Set(people.filter((p) => p.committee === "Executive").map((p) => p.role)));
    return set.sort((a, b) => (ROLE_ORDER.indexOf(a) + 1 || 99) - (ROLE_ORDER.indexOf(b) + 1 || 99));
  }, [people]);

  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const list = people.filter(
      (p) =>
        (filters.role === "All" || p.role === filters.role) &&
        (filters.committee === "All" || p.committee === filters.committee) &&
        (filters.panel === "All" || labelOf.get(p.panel) === filters.panel) &&
        (!q || [p.name, p.role, labelOf.get(p.panel) ?? "", p.now ?? ""].some((v) => v.toLowerCase().includes(q))),
    );
    const value = (p: RelayPerson) => (sort.key === "name" ? p.name : sort.key === "role" ? `${ROLE_ORDER.indexOf(p.role) + 1 || 99}`.padStart(2, "0") + p.role : String(panelRank.get(p.panel)).padStart(3, "0"));
    list.sort((a, b) => value(a).localeCompare(value(b)) || a.name.localeCompare(b.name));
    return sort.desc ? list.reverse() : list;
  }, [people, filters, q, sort, labelOf, panelRank]);

  const head = (key: SortKey, text: string, className?: string) => {
    const on = sort.key === key;
    const Icon = !on ? ArrowUpDown : sort.desc ? ArrowDown : ArrowUp;
    return (
      <div role="columnheader" aria-sort={on ? (sort.desc ? "descending" : "ascending") : "none"} className={className}>
        <button
          type="button"
          onClick={() => setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: false }))}
          className={cn("inline-flex min-h-[36px] items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] hover:text-[#f5f1e8]", on ? "text-[#3fcfca]" : "text-[#f5f1e8]/55")}
        >
          {text}
          <Icon aria-hidden className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  return (
    <section aria-labelledby="directory-heading" className="mx-auto max-w-[1280px] px-4 pt-12 sm:px-6 lg:px-8">
      <h2 id="directory-heading" className="text-[44px] !font-extrabold leading-none text-[#f5f1e8] md:text-[64px]">
        Everyone
      </h2>

      <label className="mt-8 flex max-w-xl items-center gap-3 border-b border-white/20 pb-2 transition-colors focus-within:border-[#3fcfca]">
        <Search aria-hidden className="h-4 w-4 text-[#f5f1e8]/50" />
        <span className="sr-only">Search alumni</span>
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, role, panel or company…"
          className="w-full border-0 bg-transparent text-[16px] text-[#f5f1e8] placeholder:text-[#f5f1e8]/40 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="flex h-8 w-8 items-center justify-center rounded-full text-[#f5f1e8]/60 hover:bg-white/10">
            <X aria-hidden className="h-4 w-4" />
          </button>
        ) : (
          <kbd className="hidden rounded border border-white/20 px-1.5 text-[12px] text-[#f5f1e8]/45 md:inline">/</kbd>
        )}
      </label>

      <div className="mt-6 space-y-1">
        <FilterRow id="role" label="Role" options={roles} value={filters.role} onChange={(v) => setFilters((f) => ({ ...f, role: v }))} />
        <FilterRow id="committee" label="Committee" options={["Executive", "Sub-Executive"]} value={filters.committee} onChange={(v) => setFilters((f) => ({ ...f, committee: v }))} />
        <FilterRow id="panel" label="Panel" options={panels.map((p) => p.label)} value={filters.panel} onChange={(v) => setFilters((f) => ({ ...f, panel: v }))} />
      </div>

      <p className="mt-6 text-[13px] text-[#f5f1e8]/55" aria-live="polite">
        Showing {rows.length} of {people.length}
      </p>

      <div role="table" aria-label="Past panel members" className="mt-3">
        <div role="row" className="hidden grid-cols-[56px_minmax(0,2fr)_minmax(0,1.4fr)_90px_minmax(0,1.6fr)_76px] items-center gap-4 border-b border-white/15 md:grid">
          <span role="columnheader" className="sr-only">
            Photo
          </span>
          {head("name", "Name")}
          {head("role", "Role")}
          {head("panel", "Panel")}
          <span role="columnheader" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">
            Now
          </span>
          <span role="columnheader" className="sr-only">
            Profile
          </span>
        </div>
        {rows.map((p) => {
          const on = hover === p.id;
          return (
            // content-visibility keeps the long list cheap: off-screen rows skip layout and paint.
            <div
              key={p.id}
              role="row"
              onPointerEnter={() => setHover(p.id)}
              onPointerLeave={() => setHover(null)}
              className="group relative grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/10 py-2.5 transition-colors duration-150 [contain-intrinsic-size:auto_68px] [content-visibility:auto] hover:bg-white/[0.04] md:grid-cols-[56px_minmax(0,2fr)_minmax(0,1.4fr)_90px_minmax(0,1.6fr)_76px] md:gap-4"
            >
              <span role="cell">
                <RoundPortrait person={p} size={48} colour={on} />
              </span>
              <span role="cell" className="min-w-0">
                <button
                  type="button"
                  data-cursor="view"
                  onClick={(e) => onOpen(p, "list", e.currentTarget)}
                  onFocus={() => setHover(p.id)}
                  onBlur={() => setHover(null)}
                  className="text-left text-[15px] font-semibold text-[#f5f1e8] after:absolute after:inset-0 hover:text-[#3fcfca]"
                >
                  <Highlight text={p.name} q={q} />
                </button>
                <span className="block text-[13px] text-[#f5f1e8]/60 md:hidden">
                  {p.role} · {labelOf.get(p.panel)}
                </span>
              </span>
              <span role="cell" className="hidden text-[14px] text-[#f5f1e8]/75 md:block">
                <Highlight text={p.role} q={q} />
              </span>
              <span role="cell" className="hidden font-mono text-[13px] tabular-nums text-[#f5f1e8]/70 md:block">
                {labelOf.get(p.panel)}
              </span>
              <span role="cell" className="hidden truncate text-[14px] text-[#f5f1e8]/70 md:block">
                {p.now ? <Highlight text={p.now} q={q} /> : <span className="text-[#f5f1e8]/30">—</span>}
              </span>
              <span role="cell" className="relative z-10 flex items-center justify-end gap-1">
                {p.facebook && (
                  <a href={p.facebook} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on Facebook`} className="hidden h-9 w-9 items-center justify-center rounded-full text-[#f5f1e8]/55 hover:text-[#3fcfca] md:flex">
                    <FacebookIcon className="h-4 w-4" />
                  </a>
                )}
                <ArrowRight aria-hidden className={cn("h-4 w-4 text-[#3fcfca] transition-[opacity,transform] duration-150", on ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0")} />
              </span>
            </div>
          );
        })}
        {rows.length === 0 && <p className="py-6 text-[15px] text-[#f5f1e8]/60">No one matches. Try a different name or clear a filter.</p>}
      </div>
    </section>
  );
}
