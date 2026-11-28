"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpDown, LayoutGrid, List, Search, SlidersHorizontal, Trophy, X } from "lucide-react";
import { useMedia, useRichPointer } from "@/components/contact/interaction/hooks";
import { SportIcon } from "@/components/home/SportIcon";
import { BLUR, SportType, StatusMark, eventHref, resultLine } from "@/components/events/hub/shared";
import { SPORTS, TYPES, dateRange, sportLabel, typeLabel, type HubEvent, type SportKey, type TypeKey } from "@/lib/events-hub";
import { cn } from "@/lib/utils";

type Sort = "newest" | "oldest" | "az";
type View = "grid" | "list";
export type ArchiveState = { sport: SportKey | ""; type: TypeKey | ""; q: string; sort: Sort; view: View };

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-transparent text-[#3fcfca]">
            {p}
          </mark>
        ) : (
          p
        ),
      )}
    </>
  );
}

// ---- Tile

function Tile({ e, q }: { e: HubEvent; q: string }) {
  const rich = useRichPointer();
  const reduce = Boolean(useReducedMotion());
  const touch = useMedia("(hover: none)");
  const [hot, setHot] = useState(false);
  const [slide, setSlide] = useState(0);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });
  // Up to three photos for the hover slideshow, loaded only once hovered.
  const shots = useMemo(() => Array.from(new Set([e.poster, ...e.gallery].filter(Boolean) as string[])).slice(0, 3), [e]);

  useEffect(() => {
    if (!hot || reduce || shots.length < 2) return;
    const t = window.setInterval(() => setSlide((s) => (s + 1) % shots.length), 1400);
    return () => window.clearInterval(t);
  }, [hot, reduce, shots.length]);

  const move = (ev: ReactPointerEvent<HTMLAnchorElement>) => {
    if (!rich || ev.pointerType !== "mouse") return;
    const box = ev.currentTarget.getBoundingClientRect();
    ry.set(((ev.clientX - box.left) / box.width - 0.5) * 8);
    rx.set(-((ev.clientY - box.top) / box.height - 0.5) * 8);
  };
  const leave = () => {
    rx.set(0);
    ry.set(0);
    setHot(false);
    setSlide(0);
  };
  const result = resultLine(e);
  const details = [dateRange(e), e.venue, e.teams ? `${e.teams} teams` : null].filter(Boolean).join(" · ");

  return (
    <div className="[perspective:900px]">
      <motion.div style={rich ? { rotateX: srx, rotateY: sry } : undefined} whileHover={rich && !reduce ? { y: -6 } : undefined}>
        <Link
          href={eventHref(e)}
          data-cursor="view"
          aria-label={`${e.name}${dateRange(e) ? `, ${dateRange(e)}` : ""}${result ? `. Champions: ${result}` : ""}`}
          onPointerEnter={(ev) => ev.pointerType === "mouse" && setHot(true)}
          onPointerMove={move}
          onPointerLeave={leave}
          onFocus={() => setHot(true)}
          onBlur={() => setHot(false)}
          onClick={(ev) => {
            // Phones: the first tap opens the details panel, the second goes to the event.
            if (touch && !hot) {
              ev.preventDefault();
              setHot(true);
            }
          }}
          className="group relative block aspect-[4/5] w-full overflow-hidden rounded-lg bg-[#0f302e]"
        >
          {shots.length === 0 ? (
            <span aria-hidden className="absolute inset-0 flex items-center justify-center">
              <SportIcon sport={SPORTS.find((s) => s.key === e.sport)?.icon ?? "Trophy"} strokeWidth={1} className="h-16 w-16 text-[#f5f1e8]/15" />
            </span>
          ) : (
            shots.map((src, i) =>
              i === 0 || hot ? (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 280px, 75vw"
                  placeholder="blur"
                  blurDataURL={BLUR}
                  className={cn("object-cover transition-opacity duration-500", i === slide ? "opacity-100" : "opacity-0")}
                />
              ) : null,
            )
          )}
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#071a19] via-[#071a19]/30 to-[#071a19]/50" />

          <span className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <SportType event={e} className="text-[11px] [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]" />
            <StatusMark status={e.status} className="text-[11px]" />
          </span>

          <span className={cn("absolute inset-x-3 bottom-3 block transition-transform duration-300 ease-out", hot && "-translate-y-[92px]")}>
            <span className="block font-display text-[52px] font-extrabold uppercase leading-[0.85] text-[#f5f1e8] [text-shadow:0_2px_18px_rgba(0,0,0,0.5)] md:text-[60px]">
              <Highlight text={e.code} q={q} />
            </span>
            <span className="mt-1.5 block truncate text-[14px] font-medium text-[#f5f1e8]/85">
              <Highlight text={e.name} q={q} />
            </span>
            {result && (
              <span className="mt-1 flex items-center gap-1.5 truncate text-[13px] text-[#f5f1e8]/75">
                <Trophy aria-hidden className="h-3.5 w-3.5 shrink-0 text-[#3fcfca]" />
                <span className="truncate">{result}</span>
              </span>
            )}
          </span>

          {/* Details slide up from the bottom on hover / first tap. */}
          <span className={cn("absolute inset-x-0 bottom-0 block translate-y-full bg-[#071a19]/95 px-3 py-3 transition-transform duration-300 ease-out", hot && "translate-y-0")}>
            <span className="block truncate text-[12px] text-[#f5f1e8]/70">{details || "Date not on record"}</span>
            {e.champions[0] && <span className="mt-0.5 block truncate text-[13px] text-[#f5f1e8]">Champions: {e.champions[0].names}</span>}
            <span className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#3fcfca]">
              Results &amp; photos <ArrowRight aria-hidden className="h-3.5 w-3.5" />
            </span>
          </span>
        </Link>
      </motion.div>
    </div>
  );
}

// ---- Shelf: one year, scrolling sideways (drag, arrows, keys, snap).

function Shelf({ label, events, q, id }: { label: string; events: HubEvent[]; q: string; id: string }) {
  const scroller = useRef<HTMLUListElement>(null);
  const head = useRef<HTMLHeadingElement>(null);
  const filled = useInView(head, { amount: 1, margin: "0px 0px -35% 0px" });
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(update, [events.length]);
  const by = (dir: number) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: "smooth" });

  const down = (e: ReactPointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse") return;
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  };
  const move = (e: ReactPointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) d.moved = true;
    e.currentTarget.scrollLeft = d.left - dx;
  };
  const up = () => {
    window.setTimeout(() => (drag.current = null), 0);
  };
  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      by(e.key === "ArrowRight" ? 1 : -1);
    }
  };

  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-48 border-t border-white/10 py-8 md:grid md:grid-cols-[180px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="mb-4 flex items-end justify-between md:mb-0 md:block">
        <h3
          ref={head}
          id={`${id}-h`}
          className={cn(
            "font-display text-[72px] font-extrabold leading-[0.85] transition-colors duration-700 md:text-[96px] lg:text-[120px]",
            filled ? "text-[#f5f1e8]" : "text-transparent [-webkit-text-stroke:1.5px_rgba(245,241,232,0.45)]",
          )}
        >
          {label}
        </h3>
        <p className="text-[13px] text-[#f5f1e8]/55 md:mt-2">
          {events.length} event{events.length === 1 ? "" : "s"}
        </p>
        <div className="mt-4 hidden gap-2 md:flex">
          <button type="button" onClick={() => by(-1)} disabled={edges.start} aria-label={`Earlier in ${label}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 hover:bg-white/10 disabled:opacity-40">
            <ArrowLeft aria-hidden className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => by(1)} disabled={edges.end} aria-label={`More from ${label}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 hover:bg-white/10 disabled:opacity-40">
            <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>
      <ul
        ref={scroller}
        tabIndex={0}
        aria-label={`${label} events`}
        data-cursor="drag"
        onScroll={update}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        onClickCapture={(e) => drag.current?.moved && e.preventDefault()}
        onKeyDown={onKey}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0"
      >
        {events.map((e) => (
          <li key={e.id} className="w-[75vw] shrink-0 snap-start sm:w-[260px] lg:w-[280px]">
            <Tile e={e} q={q} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---- List view: a sortable results table.

type Col = "date" | "event" | "sport" | "type";
function ResultsTable({ events, q }: { events: HubEvent[]; q: string }) {
  const [sort, setSort] = useState<{ col: Col; desc: boolean }>({ col: "date", desc: true });
  const rows = useMemo(() => {
    const val = (e: HubEvent) => (sort.col === "date" ? e.start ?? "0" : sort.col === "event" ? e.name : sort.col === "sport" ? sportLabel(e.sport) ?? "~" : typeLabel(e.type) ?? "~");
    const list = [...events].sort((a, b) => val(a).localeCompare(val(b)));
    return sort.desc ? list.reverse() : list;
  }, [events, sort]);
  const th = (col: Col, text: string) => {
    const on = sort.col === col;
    const Icon = !on ? ArrowUpDown : sort.desc ? ArrowDown : ArrowUp;
    return (
      <th scope="col" aria-sort={on ? (sort.desc ? "descending" : "ascending") : "none"} className="px-3 py-2">
        <button type="button" onClick={() => setSort((s) => (s.col === col ? { col, desc: !s.desc } : { col, desc: col === "date" }))} className={cn("inline-flex min-h-[36px] items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] hover:text-[#f5f1e8]", on ? "text-[#3fcfca]" : "text-[#f5f1e8]/55")}>
          {text}
          <Icon aria-hidden className="h-3.5 w-3.5" />
        </button>
      </th>
    );
  };
  return (
    <div className="no-scrollbar overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-left">
        <caption className="sr-only">Every tournament with its champion and runner-up. Column headers sort the table.</caption>
        <thead>
          <tr className="border-b border-white/15">
            {th("date", "Date")}
            {th("event", "Event")}
            {th("sport", "Sport")}
            {th("type", "Type")}
            <th scope="col" className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">
              Champion
            </th>
            <th scope="col" className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">
              Runner-up
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id} className="group border-b border-white/10 hover:bg-white/[0.04]">
              <td className="whitespace-nowrap px-3 py-3 text-[14px] tabular-nums text-[#f5f1e8]/70">{dateRange(e) ?? "—"}</td>
              <th scope="row" className="px-3 py-3 font-normal">
                <Link href={eventHref(e)} className="text-[15px] font-semibold text-[#f5f1e8] hover:text-[#3fcfca]">
                  <span className="mr-2 font-display text-[16px] font-extrabold uppercase text-[#3fcfca]">
                    <Highlight text={e.code} q={q} />
                  </span>
                  <Highlight text={e.name} q={q} />
                </Link>
              </th>
              <td className="px-3 py-3 text-[14px] text-[#f5f1e8]/75">{sportLabel(e.sport) ?? "—"}</td>
              <td className="px-3 py-3 text-[14px] text-[#f5f1e8]/75">{typeLabel(e.type) ?? "—"}</td>
              <td className="px-3 py-3 text-[14px] text-[#f5f1e8]">{resultLine(e) ?? <span className="text-[#f5f1e8]/35">—</span>}</td>
              <td className="px-3 py-3 text-[14px] text-[#f5f1e8]/75">{e.runnersUp.map((r) => r.names).join(", ") || <span className="text-[#f5f1e8]/35">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Filters

function Filters({
  events,
  state,
  set,
  years,
  onYear,
  searchRef,
}: {
  events: HubEvent[];
  state: ArchiveState;
  set: (patch: Partial<ArchiveState>) => void;
  years: { year: number; count: number }[];
  onYear: (y: number) => void;
  searchRef: React.RefObject<HTMLInputElement>;
}) {
  const sports = SPORTS.filter((s) => events.some((e) => e.sport === s.key));
  const types = TYPES.filter((t) => events.some((e) => e.type === t.key));
  const max = Math.max(1, ...years.map((y) => y.count));
  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="Sport" className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {sports.map((s) => {
          const on = state.sport === s.key;
          return (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={on}
              title={s.label}
              onClick={() => set({ sport: on ? "" : s.key })}
              className={cn("group flex min-w-[64px] shrink-0 flex-col items-center gap-1 rounded-lg px-2 py-2", on ? "bg-[#3fcfca]/10 text-[#3fcfca]" : "text-[#f5f1e8]/65 hover:bg-white/[0.05] hover:text-[#f5f1e8]")}
            >
              <motion.span animate={on ? { rotate: [0, -14, 12, 0], y: [0, -3, 0] } : { rotate: 0 }} transition={{ duration: 0.45 }}>
                <SportIcon aria-hidden sport={s.icon} className="h-6 w-6" />
              </motion.span>
              <span className="whitespace-nowrap text-[11px] font-semibold">{s.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div role="radiogroup" aria-label="Type" className="no-scrollbar flex gap-1 overflow-x-auto">
          {[{ key: "" as const, label: "All types" }, ...types].map((t) => {
            const on = state.type === t.key;
            return (
              <button key={t.key || "all"} type="button" role="radio" aria-checked={on} onClick={() => set({ type: t.key })} className={cn("relative shrink-0 px-2.5 py-2 text-[14px] font-medium", on ? "text-[#3fcfca]" : "text-[#f5f1e8]/65 hover:text-[#f5f1e8]")}>
                {t.label}
                {on && <motion.span layoutId="type-underline" aria-hidden className="absolute inset-x-2 bottom-0.5 h-[2px] rounded-full bg-[#3fcfca]" />}
              </button>
            );
          })}
        </div>
        <label className="relative flex min-w-[200px] flex-1 items-center">
          <span className="sr-only">Search events</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 h-4 w-4 text-[#f5f1e8]/45" />
          <input
            ref={searchRef}
            type="search"
            value={state.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Search name or code…"
            className="min-h-[40px] w-full rounded-full border border-white/15 bg-[#071a19] pl-9 pr-9 text-[14px] text-[#f5f1e8] placeholder:text-[#f5f1e8]/40 focus:border-[#3fcfca] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {state.q && (
            <button type="button" onClick={() => set({ q: "" })} aria-label="Clear search" className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-full text-[#f5f1e8]/60 hover:bg-white/10">
              <X aria-hidden className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
        <label className="flex items-center gap-2 text-[13px] text-[#f5f1e8]/60">
          Sort
          <select value={state.sort} onChange={(e) => set({ sort: e.target.value as Sort })} className="min-h-[36px] rounded-full border border-white/15 bg-[#071a19] px-3 text-[14px] text-[#f5f1e8] focus:border-[#3fcfca] focus:outline-none">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="az">A–Z</option>
          </select>
        </label>
        <div role="radiogroup" aria-label="View" className="inline-flex rounded-full border border-white/15 bg-[#071a19] p-1">
          {(
            [
              ["grid", "Grid", LayoutGrid],
              ["list", "List", List],
            ] as const
          ).map(([v, text, Icon]) => (
            <button key={v} type="button" role="radio" aria-checked={state.view === v} onClick={() => set({ view: v })} className={cn("relative z-0 inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold", state.view === v ? "text-[#002e2c]" : "text-[#f5f1e8]/70 hover:text-[#f5f1e8]")}>
              {state.view === v && <motion.span layoutId="archive-view" aria-hidden className="absolute inset-0 -z-10 rounded-full bg-[#3fcfca]" />}
              <Icon aria-hidden className="h-4 w-4" />
              {text}
            </button>
          ))}
        </div>
      </div>
      {/* Year scrubber: one dot per year, sized by how many events it had. */}
      {years.length > 1 && state.sort !== "az" && state.view === "grid" && (
        <div className="no-scrollbar flex items-end gap-1 overflow-x-auto" aria-label="Jump to a year">
          {years.map((y) => (
            <button key={y.year} type="button" onClick={() => onYear(y.year)} className="group flex shrink-0 flex-col items-center gap-1 px-2 py-1" aria-label={`${y.year}, ${y.count} events`}>
              <span aria-hidden className="block rounded-full bg-[#f5f1e8]/30 transition-colors group-hover:bg-[#3fcfca]" style={{ width: 6 + (y.count / max) * 10, height: 6 + (y.count / max) * 10 }} />
              <span className="text-[11px] tabular-nums text-[#f5f1e8]/55 group-hover:text-[#f5f1e8]">{y.year}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Archive

export function Archive({ events, initial }: { events: HubEvent[]; initial: ArchiveState }) {
  const [state, setState] = useState<ArchiveState>(initial);
  const [sheet, setSheet] = useState(false);
  const touched = useRef(false);
  const search = useRef<HTMLInputElement>(null);
  const desktop = useMedia("(min-width: 768px)");
  const set = (patch: Partial<ArchiveState>) => {
    touched.current = true;
    setState((s) => ({ ...s, ...patch }));
  };

  // State in the URL so a filtered archive can be shared.
  useEffect(() => {
    if (!touched.current) return;
    const url = new URL(window.location.href);
    for (const k of ["sport", "type", "q", "sort", "view"] as const) url.searchParams.delete(k);
    if (state.sport) url.searchParams.set("sport", state.sport);
    if (state.type) url.searchParams.set("type", state.type);
    if (state.q.trim()) url.searchParams.set("q", state.q.trim());
    if (state.sort !== "newest") url.searchParams.set("sort", state.sort);
    if (state.view !== "grid") url.searchParams.set("view", state.view);
    window.history.replaceState(window.history.state, "", url);
  }, [state]);

  // "/" jumps to search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (e.key !== "/" || (t instanceof Element && t.closest("input, textarea, select"))) return;
      e.preventDefault();
      if (!desktop) setSheet(true);
      window.setTimeout(() => search.current?.focus(), desktop ? 0 : 250);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [desktop]);

  const q = state.q.trim();
  const shown = events.filter(
    (e) => (!state.sport || e.sport === state.sport) && (!state.type || e.type === state.type) && (!q || `${e.name} ${e.code} ${e.year ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  );
  const ordered = [...shown].sort((a, b) =>
    state.sort === "az" ? a.name.localeCompare(b.name) : state.sort === "oldest" ? (a.start ?? "9").localeCompare(b.start ?? "9") : (b.start ?? "0").localeCompare(a.start ?? "0"),
  );
  const shelves = useMemo(() => {
    if (state.sort === "az") return [{ key: "az", label: "A–Z", events: ordered }];
    const map = new Map<string, HubEvent[]>();
    for (const e of ordered) {
      const k = e.year ? String(e.year) : "Undated";
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    return Array.from(map.entries()).map(([k, list]) => ({ key: k, label: k === "Undated" ? "Undated" : k, events: list }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordered.map((e) => e.id).join(), state.sort]);
  const years = useMemo(() => {
    const map = new Map<number, number>();
    for (const e of shown) if (e.year) map.set(e.year, (map.get(e.year) ?? 0) + 1);
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, count]) => ({ year, count }));
  }, [shown]);
  const since = Math.min(...events.map((e) => e.year ?? 9999));
  const active = [state.sport, state.type, q].filter(Boolean).length;
  const what = [state.sport && sportLabel(state.sport as SportKey)?.toLowerCase(), state.type && typeLabel(state.type as TypeKey)?.toLowerCase()].filter(Boolean).join(" ");

  const clear = () => set({ sport: "", type: "", q: "" });
  const jumpYear = (y: number) => {
    setSheet(false);
    document.getElementById(`year-${y}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filters = <Filters events={events} state={state} set={set} years={years} onYear={jumpYear} searchRef={search} />;

  return (
    <section aria-labelledby="archive-heading" className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6 lg:mt-32 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="archive-heading" className="text-[44px] !font-extrabold leading-none text-[#f5f1e8] md:text-[64px]">
          Every tournament
        </h2>
        <p className="text-[15px] text-[#f5f1e8]/60">
          {events.length} events since {since}
        </p>
      </div>

      {/* Desktop: sticky filter bar while browsing the archive. Phones: a bottom sheet. */}
      <div className="sticky top-[84px] z-30 -mx-4 mt-6 hidden border-y border-white/10 bg-[#0b2524]/92 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 md:block lg:-mx-8 lg:px-8">{filters}</div>
      <div className="sticky top-[76px] z-30 -mx-4 mt-6 flex items-center gap-2 border-y border-white/10 bg-[#0b2524]/92 px-4 py-2.5 backdrop-blur-md md:hidden">
        <button type="button" onClick={() => setSheet(true)} className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/20 px-4 text-[14px] font-semibold">
          <SlidersHorizontal aria-hidden className="h-4 w-4" />
          Filters{active ? ` · ${active}` : ""}
        </button>
        <div className="no-scrollbar flex flex-1 gap-1 overflow-x-auto">
          {SPORTS.filter((s) => events.some((e) => e.sport === s.key)).map((s) => (
            <button key={s.key} type="button" aria-pressed={state.sport === s.key} aria-label={s.label} onClick={() => set({ sport: state.sport === s.key ? "" : s.key })} className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", state.sport === s.key ? "bg-[#3fcfca]/10 text-[#3fcfca]" : "text-[#f5f1e8]/60")}>
              <SportIcon aria-hidden sport={s.icon} className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {sheet && !desktop && (
          <motion.div className="fixed inset-0 z-[160] md:hidden" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
            <motion.button type="button" aria-label="Close filters" onClick={() => setSheet(false)} className="absolute inset-0 h-full w-full bg-[#071a19]/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3 }}
              onKeyDown={(e) => e.key === "Escape" && setSheet(false)}
              className="contact-page absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[#0b2524] p-4 pb-8 [font-family:var(--font-home),system-ui,sans-serif]"
            >
              <span aria-hidden className="mx-auto mb-4 block h-1 w-10 rounded-full bg-white/25" />
              {filters}
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={clear} className="min-h-[48px] flex-1 rounded-full border border-white/20 text-[15px] font-semibold">
                  Clear
                </button>
                <button type="button" onClick={() => setSheet(false)} className="min-h-[48px] flex-[2] rounded-full bg-[#3fcfca] text-[15px] font-semibold text-[#002e2c]">
                  Show {shown.length} event{shown.length === 1 ? "" : "s"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <p aria-live="polite" className="mt-4 text-[13px] text-[#f5f1e8]/55">
        {active ? `Showing ${shown.length} ${what ? `${what} ` : ""}event${shown.length === 1 ? "" : "s"}${q ? ` matching “${q}”` : ""}` : `Showing all ${events.length} events`}
      </p>

      {shown.length === 0 ? (
        <div className="mt-8 border-y border-white/10 py-10">
          <p className="text-[18px] text-[#f5f1e8]">Nothing matches that.</p>
          <p className="mt-1 text-[15px] text-[#f5f1e8]/60">{q ? "Try a shorter search, or a code like NFL." : "Try another sport or type."}</p>
          <button type="button" onClick={clear} className="mt-4 min-h-[44px] text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
            Clear filters
          </button>
        </div>
      ) : state.view === "list" ? (
        <div className="mt-6">
          <ResultsTable events={ordered} q={q} />
        </div>
      ) : (
        <div className="mt-4">
          {shelves.map((s) => (
            <Shelf key={s.key} id={`year-${s.key}`} label={s.label} events={s.events} q={q} />
          ))}
        </div>
      )}
    </section>
  );
}
