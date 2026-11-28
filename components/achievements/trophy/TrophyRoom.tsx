"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { FlapText } from "@/components/home/matchday/SplitFlap";
import { ChampionshipBanners } from "@/components/home/ChampionshipBanners";
import { FilterBar, type TypeFilter } from "@/components/achievements/trophy/FilterBar";
import { Ledger } from "@/components/achievements/trophy/Ledger";
import { BLUR } from "@/components/achievements/trophy/shared";
import { MatchReport, TROPHY_QUERY_KEY } from "@/components/achievements/report/MatchReport";
import { Dialog } from "@/components/contact/interaction/Dialog";
import type { Honour } from "@/lib/honours";
import type { ReportData } from "@/lib/report";
import { TYPE_LABEL, TYPE_ORDER, entryPath, sportKey, type EntryType, type TrophyEntry } from "@/lib/trophy";
import { cn } from "@/lib/utils";

const TALLY: EntryType[] = ["title", "podium", "individual", "milestone"];

// Tally board: split-flap counts (the server renders the real numbers; they flip on load).
// Clicking a counter filters the page to that type.
function Tally({ counts, type, onType }: { counts: Record<TypeFilter, number>; type: TypeFilter; onType: (t: TypeFilter) => void }) {
  const reduce = Boolean(useReducedMotion());
  const [play, setPlay] = useState(false);
  useEffect(() => setPlay(true), []);
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-6 lg:gap-x-10">
      {TALLY.map((t, i) => {
        const active = type === t;
        return (
          <button
            key={t}
            type="button"
            aria-pressed={active}
            onClick={() => onType(active ? "all" : t)}
            className="group relative flex flex-col items-start pb-3 text-left"
          >
            <span className="sr-only">
              {counts[t]} {TYPE_LABEL[t].tally}. Show only these.
            </span>
            <FlapText text={String(counts[t])} charset="0123456789" play={play} still={reduce} delay={i * 140} className="text-[44px] md:text-[56px]" />
            <span aria-hidden className="mt-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/70 transition-colors group-hover:text-[#f5f1e8]">
              {TYPE_LABEL[t].tally}
            </span>
            <span aria-hidden className={cn("absolute bottom-0 left-0 h-[2px] bg-[#3fcfca] transition-all duration-300", active ? "w-full" : "w-0 group-hover:w-6")} />
          </button>
        );
      })}
    </div>
  );
}

// Undated entries as a strip of prints, slightly askew; they straighten on hover.
function Archive({ entries, onOpen }: { entries: TrophyEntry[]; onOpen: (id: string) => void }) {
  if (entries.length === 0) return null;
  return (
    <section aria-labelledby="archive-heading" className="mx-auto max-w-[1280px] px-6 pt-24 lg:px-8">
      <h2 id="archive-heading" className="text-[40px] !font-extrabold uppercase leading-none text-[#f5f1e8] md:text-[56px]">
        From the archive
      </h2>
      <p className="mt-3 text-[16px] text-[#f5f1e8]/65">
        Moments we&rsquo;re still dating. Know the year?{" "}
        <Link href="/contact?topic=other" className="font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
          Tell us
        </Link>
        .
      </p>
      <ul className="mt-8 flex flex-wrap gap-8">
        {entries.map((entry, i) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => onOpen(entry.id)}
              style={{ rotate: `${i % 2 ? 2 : -1.5}deg` }}
              className="block w-[220px] bg-[#f5f1e8] p-2.5 pb-4 text-left shadow-[0_14px_28px_-12px_rgba(0,0,0,0.7)] transition-[rotate,transform] duration-300 hover:-translate-y-1 hover:!rotate-0 focus-visible:!rotate-0"
            >
              <span data-cursor="view" className="relative block aspect-square overflow-hidden bg-[#0b2524]">
                {entry.photos[0] && <Image src={entry.photos[0]} alt="" fill sizes="220px" placeholder="blur" blurDataURL={BLUR} className="object-cover" />}
              </span>
              <span className="mt-3 block text-[14px] font-semibold leading-snug text-[#0b2524]">{entry.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// The room at /achievements. A story opens over it as that achievement's match report: the
// URL moves to /achievements/<slug> with the History API (no page load), so the link can be
// shared and Back closes it. Loading that URL directly renders the report as a full page.
export function TrophyRoom({ entries, reports, banners, maxYear }: { entries: TrophyEntry[]; reports: Record<string, ReportData>; banners: Honour[]; maxYear: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initialType = params.get("type");
  const [type, setType] = useState<TypeFilter>(initialType && (TYPE_ORDER as string[]).includes(initialType) ? (initialType as TypeFilter) : "all");
  const [sport, setSport] = useState((params.get("sport") ?? "").toLowerCase());
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const ledger = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const pathSlug = pathname.match(/^\/achievements\/([^/]+)$/)?.[1] ?? null;
  const openId = pathSlug ? (entries.find((e) => e.slug === pathSlug || e.id === pathSlug)?.id ?? null) : null;

  // ---- Filtering
  const matchesSport = useCallback((e: TrophyEntry) => !sport || sportKey(e.sport) === sport, [sport]);
  const counts = useMemo(() => {
    const out = { all: 0 } as Record<TypeFilter, number>;
    for (const t of TYPE_ORDER) out[t] = 0;
    for (const e of entries.filter(matchesSport)) {
      out[e.type] += 1;
      out.all += 1;
    }
    return out;
  }, [entries, matchesSport]);
  const visible = entries.filter((e) => matchesSport(e) && (type === "all" || e.type === type));
  const weight = (e: TrophyEntry) => TYPE_ORDER.indexOf(e.type);
  const groups = useMemo(() => {
    const map = new Map<number, TrophyEntry[]>();
    for (const e of visible) if (e.year) map.set(e.year, [...(map.get(e.year) ?? []), e]);
    return Array.from(map.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, list]) => ({ year, entries: list.sort((a, b) => weight(a) - weight(b)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.map((e) => e.id).join()]);
  const undated = visible.filter((e) => !e.year);
  const years = new Map(groups.map((g) => [g.year, g.entries.length]));
  const sports = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of entries) if (!seen.has(sportKey(e.sport))) seen.set(sportKey(e.sport), e.sport.replace(/\s*\(.*\)$/, ""));
    return Array.from(seen, ([key, label]) => ({ key, label }));
  }, [entries]);

  // ---- URL: filters in the query (?type=title&sport=football); an open story at /achievements/<id>.
  const query = () => {
    const q = new URLSearchParams();
    if (type !== "all") q.set("type", type);
    if (sport) q.set("sport", sport);
    const s = q.toString();
    return s ? `?${s}` : "";
  };
  const first = useRef(true);
  useEffect(() => {
    // The match report's "Trophy room" link comes back to these filters.
    try {
      window.sessionStorage.setItem(TROPHY_QUERY_KEY, query());
    } catch {
      /* storage blocked */
    }
    if (first.current) {
      first.current = false;
      return;
    }
    if (!openId) router.replace(`/achievements${query()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, sport]);

  // Filter links (a report's tag, sport or year, or a breadcrumb) land back here with new
  // query values; follow them. While a story is open the URL is its own, so leave filters be.
  const paramKey = pathname === "/achievements" ? params.toString() : null;
  useEffect(() => {
    if (paramKey === null) return;
    const t = params.get("type");
    setType(t && (TYPE_ORDER as string[]).includes(t) ? (t as TypeFilter) : "all");
    setSport((params.get("sport") ?? "").toLowerCase());
    const year = Number(params.get("year"));
    if (year) window.setTimeout(() => jump(year), 120);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey]);

  const pathOf = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    return entry ? entryPath(entry) : `/achievements/${id}`;
  };
  const open = (id: string) => {
    pushed.current = true;
    window.history.pushState(null, "", pathOf(id));
  };
  const go = (id: string) => window.history.replaceState(null, "", pathOf(id));
  const close = () => {
    // Opened from the list: step back to it, filters and scroll intact.
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
      return;
    }
    window.history.replaceState(null, "", `/achievements${query()}`);
  };
  useEffect(() => {
    if (!openId) pushed.current = false;
  }, [openId]);

  // ---- Which year is in view, for the scrubber handle.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-year]"));
    const io = new IntersectionObserver(
      (items) => {
        const top = items.filter((i) => i.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActiveYear(Number((top.target as HTMLElement).dataset.year));
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [groups]);

  const jump = (year: number) => {
    setActiveYear(year);
    document.getElementById(`year-${year}`)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };
  const pickType = (t: TypeFilter) => {
    setType(t);
    ledger.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const report = openId ? (reports[openId] ?? null) : null;

  return (
    <LayoutGroup>
      {/* Hero: left-aligned title, tally board on the right. */}
      <header className="mx-auto grid max-w-[1280px] gap-10 px-6 pb-14 pt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-8 lg:pt-16">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#3fcfca]/80">Record book</p>
          <h1 className="mt-3 text-[56px] !font-extrabold uppercase leading-[0.88] text-[#f5f1e8] md:text-[88px] lg:text-[104px]">
            The trophy
            <br />
            room
          </h1>
          <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-[#f5f1e8]/70">Every title, podium and personal award won in NSU colours.</p>
        </div>
        <Tally counts={counts} type={type} onType={pickType} />
      </header>

      {banners.length > 0 && <ChampionshipBanners honours={banners} eyebrow="The real wins" title="Titles" showAllLink={false} onSelect={open} />}

      <div ref={ledger} className="scroll-mt-24 pt-10">
        <FilterBar
          type={type}
          counts={counts}
          onType={setType}
          sport={sport}
          sports={sports}
          onSport={setSport}
          years={years}
          activeYear={activeYear}
          maxYear={maxYear}
          onJump={jump}
        />
        <motion.div layout className="pt-12">
          <Ledger groups={groups} onOpen={open} />
        </motion.div>
      </div>

      <Archive entries={undated} onOpen={open} />

      {/* The story overlay: the match report in a sheet (full height, drag the handle down to close on phones). */}
      <Dialog open={Boolean(report)} onClose={close} labelledBy="report-title" variant="sheet" bare>
        {report && <MatchReport data={report} mode="overlay" onGo={go} onClose={close} />}
      </Dialog>

      {/* Plain links so every entry is reachable without the overlay. */}
      <nav aria-label="All achievements" className="sr-only">
        <ul>
          {entries.map((e) => (
            <li key={e.id}>
              <Link href={entryPath(e)}>{e.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </LayoutGroup>
  );
}
