"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpDown, LayoutGrid, List, Search, X } from "lucide-react";
import { useRichPointer } from "@/components/contact/interaction/hooks";
import { Cutout, initials } from "@/components/teams/announcement/Cutout";
import { useRoster } from "@/components/teams/announcement/RosterContext";
import type { SheetGroup, SheetPerson } from "@/lib/team-sheet";
import { cn } from "@/lib/utils";

const roleText = (p: SheetPerson) => p.role ?? "";
const label = (p: SheetPerson) => `${p.name}${p.role ? `, ${p.role}` : ""}${p.captain === "C" ? ", Captain" : p.captain === "VC" ? ", Vice-Captain" : ""}`;

function matches(p: SheetPerson, q: string) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [p.name, p.role ?? "", p.number ?? ""].some((v) => v.toLowerCase().includes(needle));
}

// ---- Card

function PlayerCard({ person, dim, hit }: { person: SheetPerson; dim: boolean; hit: boolean }) {
  const { open } = useRoster();
  const rich = useRichPointer();
  const reduce = Boolean(useReducedMotion());
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });
  const tilt = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!rich || e.pointerType !== "mouse") return;
    const box = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - box.left) / box.width - 0.5) * 12);
    rx.set(-((e.clientY - box.top) / box.height - 0.5) * 12);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div className={cn("[perspective:900px] transition-opacity duration-200", dim && "opacity-25")}>
      <motion.button
        type="button"
        data-cursor="view"
        aria-label={label(person)}
        onClick={(e) => open(person.slug, "card", e.currentTarget)}
        onPointerMove={tilt}
        onPointerLeave={reset}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        style={rich ? { rotateX: srx, rotateY: sry } : undefined}
        className="group relative block aspect-[3/4] w-full text-left"
      >
        {/* Background and the big number (or role initials), clipped to the card. */}
        <span aria-hidden className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-b from-[#0f302e] to-[#13312d] ring-1 ring-inset ring-white/[0.06] transition-[box-shadow] duration-200 group-hover:ring-[#3fcfca]/30">
          <span className="absolute -right-1 top-1 select-none font-display text-[96px] font-extrabold leading-[0.85] text-[#f5f1e8]/[0.08] transition-colors duration-200 group-hover:text-[#f5f1e8]/[0.16] sm:text-[120px]">
            {person.number ?? person.mark}
          </span>
        </span>

        {/* The cut-out may lift out over the top edge. */}
        <span aria-hidden className="absolute inset-0 [clip-path:inset(-16%_0_0_0_round_12px)]">
          <motion.span layoutId={`card-${person.slug}`} className="absolute inset-0 block" transition={{ duration: 0.5 }}>
            <span className="absolute inset-0 block origin-bottom transition-transform duration-300 ease-out group-hover:-translate-y-2.5 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:transform-none">
              <Cutout person={person} boxRatio={3 / 4} fill={0.8} sizes="(min-width: 1024px) 240px, 50vw" />
              {!person.photo && (
                <span className="absolute inset-x-0 top-[44%] text-center font-display text-[40px] font-extrabold text-[#f5f1e8]/45">{initials(person.name)}</span>
              )}
            </span>
          </motion.span>
        </span>

        {person.captain && (
          <span aria-hidden className="absolute right-2.5 top-2.5 z-10 flex h-8 min-w-8 items-center justify-center rounded-full bg-[#3fcfca] px-1.5 font-display text-[15px] font-extrabold text-[#002e2c]">
            {person.captain}
          </span>
        )}

        {/* Name block; a stats line slides up under it on hover. */}
        <span aria-hidden className="absolute inset-x-0 bottom-0 overflow-hidden rounded-b-xl">
          <span className="block bg-gradient-to-t from-[#0b2524] via-[#0b2524]/85 to-transparent px-3.5 pb-3 pt-10 transition-transform duration-200 group-hover:-translate-y-7 sm:px-4">
            {person.role && <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3fcfca]/80 sm:text-[12px]">{person.role}</span>}
            <span className={cn("mt-1 block font-display text-[20px] font-extrabold uppercase leading-[0.95] sm:text-[24px]", hit ? "text-[#3fcfca]" : "text-[#f5f1e8]")}>
              {person.name}
            </span>
          </span>
          <span className="absolute inset-x-0 bottom-0 block translate-y-full bg-[#0b2524] px-3.5 py-1.5 text-[12px] text-[#f5f1e8]/65 transition-transform duration-200 group-hover:translate-y-0 sm:px-4">
            {person.photo ? "Stats coming soon" : "Photo coming soon"}
          </span>
        </span>
      </motion.button>
    </div>
  );
}

// ---- List view

type SortKey = "name" | "role" | "number";

function RosterTable({ players, query }: { players: SheetPerson[]; query: string }) {
  const { open } = useRoster();
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean } | null>(null);
  const rows = useMemo(() => {
    if (!sort) return players;
    const value = (p: SheetPerson) => (sort.key === "number" ? Number(p.number ?? 1e6) : sort.key === "role" ? roleText(p) || "~" : p.name);
    const list = [...players].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      return typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
    });
    return sort.desc ? list.reverse() : list;
  }, [players, sort]);
  const head = (key: SortKey, text: string) => {
    const active = sort?.key === key;
    const Icon = !active ? ArrowUpDown : sort.desc ? ArrowDown : ArrowUp;
    return (
      <th scope="col" aria-sort={active ? (sort.desc ? "descending" : "ascending") : "none"} className="px-3 py-2">
        <button
          type="button"
          onClick={() => setSort((s) => (s?.key === key ? { key, desc: !s.desc } : { key, desc: false }))}
          className={cn("inline-flex min-h-[40px] items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] hover:text-[#f5f1e8]", active ? "text-[#3fcfca]" : "text-[#f5f1e8]/55")}
        >
          {text}
          <Icon aria-hidden className="h-3.5 w-3.5" />
        </button>
      </th>
    );
  };
  return (
    <div className="no-scrollbar overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <caption className="sr-only">Players. Column headers sort the list.</caption>
        <thead>
          <tr className="border-b border-white/15">
            <th scope="col" className="w-14 py-2">
              <span className="sr-only">Photo</span>
            </th>
            {head("name", "Name")}
            {head("role", "Role")}
            {head("number", "No.")}
            <th scope="col" className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">
              Key stat
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const hit = Boolean(query) && matches(p, query);
            return (
              <tr key={p.id} className={cn("border-b border-white/10 transition-[opacity,background-color] duration-150 hover:bg-white/[0.04]", query && !hit && "opacity-25")}>
                <td className="py-2">
                  <span className="relative block h-11 w-11 overflow-hidden rounded-full bg-[#13312d]">
                    <Cutout person={p} boxRatio={1} fill={1.6} align="top" sizes="48px" />
                  </span>
                </td>
                <th scope="row" className="px-3 py-2 font-normal">
                  <button type="button" data-cursor="view" onClick={(e) => open(p.slug, "list", e.currentTarget)} className={cn("text-left text-[15px] font-semibold hover:text-[#3fcfca]", hit ? "text-[#3fcfca]" : "text-[#f5f1e8]")}>
                    {p.name}
                    {p.captain && <span className="ml-2 rounded-full bg-[#3fcfca] px-1.5 py-0.5 font-display text-[12px] font-extrabold text-[#002e2c]">{p.captain}</span>}
                  </button>
                </th>
                <td className="px-3 py-2 text-[14px] text-[#f5f1e8]/75">{p.role ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-[14px] tabular-nums text-[#f5f1e8]/75">{p.number ?? "—"}</td>
                <td className="px-3 py-2 text-[14px] text-[#f5f1e8]/45">Coming soon</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---- Staff

function StaffStrip({ staff }: { staff: SheetPerson[] }) {
  const { open } = useRoster();
  return (
    <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {staff.map((s) => (
        <li key={s.id} className="w-[280px] shrink-0 snap-start">
          <button
            type="button"
            data-cursor="view"
            aria-label={`${s.name}, ${s.role ?? "Staff"}`}
            onClick={(e) => open(s.slug, "staff", e.currentTarget)}
            className="group flex w-full items-center gap-4 overflow-hidden rounded-xl bg-gradient-to-r from-[#0f302e] to-[#13312d] pr-4 text-left ring-1 ring-inset ring-white/[0.06] hover:-translate-y-0.5 hover:ring-[#3fcfca]/30"
          >
            <span className="relative block h-[104px] w-[92px] shrink-0 overflow-hidden">
              <span className="absolute inset-0 block origin-bottom transition-transform duration-300 group-hover:scale-105">
                <Cutout person={s} boxRatio={92 / 104} fill={0.9} sizes="120px" />
              </span>
            </span>
            <span className="min-w-0 py-3">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3fcfca]/80">{s.role ?? "Staff"}</span>
              <span className="mt-1 block font-display text-[22px] font-extrabold uppercase leading-[0.95] text-[#f5f1e8]">{s.name}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

// ---- Sheet

function Section({ id, title, count, children }: { id: string; title: string; count: number; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} data-spy={id} className="scroll-mt-44">
      <h2 id={`${id}-heading`} className="flex items-baseline gap-3 text-[32px] !font-extrabold leading-none text-[#f5f1e8] md:text-[40px]">
        {title}
        <span className="font-sans text-[16px] font-medium tabular-nums text-[#f5f1e8]/45">{count}</span>
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function TeamSheet({ groups, staff }: { groups: SheetGroup[]; staff: SheetPerson[] }) {
  const reduce = Boolean(useReducedMotion());
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const sections = useMemo(
    () => [...groups.map((g) => ({ id: g.key, label: g.label, count: g.people.length })), ...(staff.length ? [{ id: "staff", label: "Staff", count: staff.length }] : [])],
    [groups, staff],
  );
  const [current, setCurrent] = useState(sections[0]?.id ?? "");
  const nav = useRef<HTMLDivElement>(null);
  const players = useMemo(() => groups.flatMap((g) => g.people), [groups]);
  const q = query.trim();
  const found = players.filter((p) => matches(p, q)).length;

  // Highlight the group in the middle band of the screen.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-spy]"));
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setCurrent((hit.target as HTMLElement).dataset.spy ?? "");
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [view, sections]);

  // Keep the active tab visible in the scrolling sub-nav on phones.
  useEffect(() => {
    nav.current?.querySelector<HTMLElement>(`[data-nav="${current}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [current]);

  const jump = (id: string) => {
    setCurrent(id);
    // The list view is one table, so a group link switches back to the grid first.
    const toGrid = view === "list" && id !== "staff";
    if (toGrid) setView("grid");
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), toGrid ? 60 : 0);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      {/* Sticky sub-nav: groups with counts. */}
      <div className="sticky top-[84px] z-30 -mx-4 border-b border-white/10 bg-[#0b2524]/92 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <nav aria-label="Team sheet">
          <div ref={nav} className="no-scrollbar flex gap-6 overflow-x-auto">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                data-nav={s.id}
                aria-current={current === s.id ? "true" : undefined}
                onClick={() => jump(s.id)}
                className={cn("relative shrink-0 py-4 text-[14px] font-semibold", current === s.id ? "text-[#3fcfca]" : "text-[#f5f1e8]/65 hover:text-[#f5f1e8]")}
              >
                {s.label} <span className="tabular-nums opacity-60">{s.count}</span>
                {current === s.id && <motion.span layoutId="sheet-underline" aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#3fcfca]" />}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Search and view. */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <label className="relative flex min-w-0 flex-1 items-center sm:max-w-sm">
          <span className="sr-only">Search players</span>
          <Search aria-hidden className="pointer-events-none absolute left-4 h-4 w-4 text-[#f5f1e8]/45" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search player…"
            className="min-h-[44px] w-full rounded-full border border-white/15 bg-[#071a19] pl-10 pr-10 text-[15px] text-[#f5f1e8] placeholder:text-[#f5f1e8]/40 focus:border-[#3fcfca] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full text-[#f5f1e8]/60 hover:bg-white/10 hover:text-[#f5f1e8]">
              <X aria-hidden className="h-4 w-4" />
            </button>
          )}
        </label>
        <div role="group" aria-label="View" className="inline-flex rounded-full border border-white/15 bg-[#071a19] p-1">
          {(
            [
              { v: "grid", text: "Grid", Icon: LayoutGrid },
              { v: "list", text: "List", Icon: List },
            ] as const
          ).map(({ v, text, Icon }) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn("relative z-0 inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold", view === v ? "text-[#002e2c]" : "text-[#f5f1e8]/70 hover:text-[#f5f1e8]")}
            >
              {view === v && <motion.span layoutId="view-pill" aria-hidden className="absolute inset-0 -z-10 rounded-full bg-[#3fcfca]" />}
              <Icon aria-hidden className="h-4 w-4" />
              {text}
            </button>
          ))}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {q ? `${found} of ${players.length} players match` : ""}
      </p>

      <div className="mt-10 space-y-16">
        {view === "grid" ? (
          groups.map((g) => (
            <Section key={g.key} id={g.key} title={g.label} count={g.people.length}>
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
                {g.people.map((p) => {
                  const hit = matches(p, q);
                  return (
                    <li key={p.id}>
                      <PlayerCard person={p} dim={Boolean(q) && !hit} hit={Boolean(q) && hit} />
                    </li>
                  );
                })}
              </ul>
            </Section>
          ))
        ) : (
          <Section id={groups[0]?.key ?? "players"} title="Players" count={players.length}>
            <RosterTable players={players} query={q} />
          </Section>
        )}
        {staff.length > 0 && (
          <Section id="staff" title="Staff" count={staff.length}>
            <StaffStrip staff={staff} />
          </Section>
        )}
      </div>
    </div>
  );
}
