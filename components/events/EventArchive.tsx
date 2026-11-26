"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowRight, Archive, ChevronDown, Layers, Search, SlidersHorizontal, Trophy } from "lucide-react";
import { PosterImage } from "@/components/events/PosterImage";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { eventYear, seasonLabel, type EventGroup } from "@/lib/events";
import type { EventStatus } from "@/lib/types";

type Sort = "newest" | "oldest" | "name";

const STATUSES: EventStatus[] = ["Running", "Upcoming", "Finished"];
const SORTS: Sort[] = ["newest", "oldest", "name"];

// Filters live in the URL (?q=&year=&season=&status=&sort=) so a filtered list can
// be shared, survives reload, and comes back when the visitor returns from an event.
interface Filters {
  q: string;
  year: string;
  sport: string;
  season: string;
  status: "" | EventStatus;
  sort: Sort;
}

const EMPTY: Filters = { q: "", year: "", sport: "", season: "", status: "", sort: "newest" };

function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 lg:w-36">
      {/* Visible on phones and tablets, where the controls sit in a labelled grid; the desktop row reads by its options. */}
      <label htmlFor={id} className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-400 lg:sr-only">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-2xl border border-white/15 bg-white/5 py-2.5 pl-3.5 pr-8 text-sm text-white focus:border-blue-400/60 focus:outline-none [&>option]:bg-night-900"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

function latestTime(group: EventGroup) {
  const date = group.latest.date;
  return date ? new Date(date).getTime() : Number.NEGATIVE_INFINITY;
}

function coverImage(group: EventGroup) {
  return group.latest.bannerImage ?? [...group.seasons].reverse().find((season) => season.bannerImage)?.bannerImage ?? null;
}

function ArchiveCard({ group }: { group: EventGroup }) {
  const image = coverImage(group);
  const href = `/events/${group.latest.id}`;

  return (
    <article className="glass-panel group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25">
      <Link href={href} tabIndex={-1} aria-hidden className="relative block aspect-[16/10] overflow-hidden bg-night-950/60">
        {image ? (
          <PosterImage
            src={image}
            alt=""
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
            <Trophy className="h-12 w-12 text-night-950/40" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-night-950/10 to-transparent" />
        {group.sport && (
          <span className="absolute left-3 top-3 rounded-full bg-night-950/60 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur-md">
            {group.sport}
          </span>
        )}
        <StatusBadge status={group.latest.status} className="absolute right-3 top-3 backdrop-blur-md" />
        <span className="absolute bottom-3 left-4 font-display text-5xl font-semibold uppercase leading-none text-white">
          {group.abbreviation}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="break-words font-bold text-white">
          <Link href={href} className="tap-target hover:text-blue-300">
            {group.name}
          </Link>{" "}
          {group.series && <span className="font-normal text-slate-400">({group.abbreviation})</span>}
        </h3>

        <ul className="mt-3 flex flex-wrap gap-2">
          {group.seasons.map((season) => {
            const current = season.id === group.latest.id;
            return (
              <li key={season.id}>
                <Link
                  href={`/events/${season.id}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    current
                      ? "border-blue-400/40 bg-blue-500/15 text-blue-300 hover:bg-blue-500/25"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
                  )}
                >
                  <Layers className="h-3 w-3" />
                  {seasonLabel(season) ?? "Undated"}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href={href}
          className="tap-target mt-auto inline-flex items-center gap-1.5 self-start pt-5 text-sm font-semibold text-blue-400 transition-colors hover:text-blue-300"
        >
          View details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export function EventArchive({ groups }: { groups: EventGroup[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const options = useMemo(() => {
    const years = new Set<string>();
    const sports = new Set<string>();
    const seasons = new Set<number>();
    for (const group of groups) {
      if (group.sport) sports.add(group.sport);
      for (const s of group.seasons) {
        const y = eventYear(s);
        if (y) years.add(y);
        if (s.seasonNumber) seasons.add(s.seasonNumber);
      }
    }
    return {
      years: Array.from(years).sort().reverse(),
      sports: Array.from(sports).sort(),
      seasons: Array.from(seasons).sort((a, b) => a - b),
    };
  }, [groups]);

  // Values that don't match a real option are ignored.
  const parse = useCallback(
    (params: URLSearchParams): Filters => {
      const get = (key: string) => params.get(key) ?? "";
      const status = get("status") as EventStatus;
      const sort = get("sort") as Sort;
      return {
        q: get("q"),
        year: options.years.includes(get("year")) ? get("year") : "",
        sport: options.sports.includes(get("sport")) ? get("sport") : "",
        season: options.seasons.map(String).includes(get("season")) ? get("season") : "",
        status: STATUSES.includes(status) ? status : "",
        sort: SORTS.includes(sort) ? sort : "newest",
      };
    },
    [options],
  );

  const [filters, setFilters] = useState<Filters>(() => parse(new URLSearchParams(searchParams.toString())));
  const { q: query, year, sport, season, status, sort } = filters;
  const set = (patch: Partial<Filters>) => setFilters((current) => ({ ...current, ...patch }));

  // The query string this component last wrote. A different one means the URL was
  // changed from outside (e.g. the navbar's plain /events link), so take it over.
  const written = useRef(searchParams.toString());
  useEffect(() => {
    const current = searchParams.toString();
    if (current === written.current) return;
    written.current = current;
    setFilters(parse(new URLSearchParams(current)));
  }, [searchParams, parse]);

  // replaceState rather than a history entry per keystroke: Back still leaves the
  // page in one step, and returns here with the same filters.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (year) params.set("year", year);
    if (sport) params.set("sport", sport);
    if (season) params.set("season", season);
    if (status) params.set("status", status);
    if (sort !== "newest") params.set("sort", sort);
    const search = params.toString();
    written.current = search;
    const url = search ? `${pathname}?${search}` : pathname;
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", url);
  }, [pathname, query, year, sport, season, status, sort]);

  const moreActive = [year, sport, season, status].filter(Boolean).length + (sort !== "newest" ? 1 : 0);
  // On phones the less-used controls sit behind one button; a shared link with filters set opens it.
  const [showMore, setShowMore] = useState(moreActive > 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = groups.filter((group) => {
      if (q && !group.name.toLowerCase().includes(q) && !group.abbreviation.toLowerCase().includes(q)) return false;
      if (year && !group.seasons.some((s) => eventYear(s) === year)) return false;
      if (sport && group.sport !== sport) return false;
      if (season && !group.seasons.some((s) => String(s.seasonNumber) === season)) return false;
      if (status && group.latest.status !== status) return false;
      return true;
    });
    // The default order puts anything live, then upcoming, ahead of past results.
    const priority = (group: EventGroup) => (sort === "newest" ? STATUSES.indexOf(group.latest.status) : 0);
    return filtered.sort(
      (a, b) =>
        priority(a) - priority(b) ||
        (sort === "name" ? a.name.localeCompare(b.name) : (latestTime(b) - latestTime(a)) * (sort === "newest" ? 1 : -1)),
    );
  }, [groups, query, year, sport, season, status, sort]);

  const filtersActive = Boolean(query || year || sport || season || status);

  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-6">
          <Eyebrow icon={Archive} className="mb-4">
            All events
          </Eyebrow>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Event archive</h2>
        </Reveal>

        <Reveal className="glass-panel mb-8 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="flex flex-col items-start gap-2">
              <label className="relative block w-full">
                <span className="sr-only">Search events by name or abbreviation</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => set({ q: e.target.value })}
                  placeholder="Name or abbreviation"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none"
                />
              </label>
              {/* Phones only: the less-used controls open below this button. */}
              <button
                type="button"
                onClick={() => setShowMore((open) => !open)}
                aria-expanded={showMore}
                aria-controls="event-filters"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 sm:hidden"
              >
                <SlidersHorizontal aria-hidden className="h-4 w-4" />
                More filters
                <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform", showMore && "rotate-180")} />
                {moreActive > 0 && (
                  <span className="rounded-full bg-blue-500/25 px-1.5 text-xs text-blue-100">
                    {moreActive}
                    <span className="sr-only"> active</span>
                  </span>
                )}
              </button>
            </div>
            <div
              id="event-filters"
              className={cn(
                "grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid sm:grid-cols-4 lg:flex",
                showMore ? "grid" : "hidden",
              )}
            >
              <FilterSelect id="filter-year" label="Year" value={year} onChange={(v) => set({ year: v })}>
                <option value="">All years</option>
                {options.years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </FilterSelect>
              {options.sports.length > 0 && (
                <FilterSelect id="filter-sport" label="Sport" value={sport} onChange={(v) => set({ sport: v })}>
                  <option value="">All sports</option>
                  {options.sports.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </FilterSelect>
              )}
              {options.seasons.length > 0 && (
                <FilterSelect id="filter-season" label="Season" value={season} onChange={(v) => set({ season: v })}>
                  <option value="">All seasons</option>
                  {options.seasons.map((n) => (
                    <option key={n} value={n}>
                      Season {n}
                    </option>
                  ))}
                </FilterSelect>
              )}
              <FilterSelect id="filter-status" label="Status" value={status} onChange={(v) => set({ status: v as "" | EventStatus })}>
                <option value="">Any status</option>
                <option value="Running">Live now</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Finished">Finished</option>
              </FilterSelect>
              <FilterSelect id="filter-sort" label="Sort" value={sort} onChange={(v) => set({ sort: v as Sort })}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">A–Z</option>
              </FilterSelect>
            </div>
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400" aria-live="polite">
            <SlidersHorizontal aria-hidden className="h-3.5 w-3.5" />
            Showing {visible.length} of {groups.length} events
            {filtersActive && (
              <button
                type="button"
                onClick={() => setFilters({ ...EMPTY, sort })}
                className="tap-target font-medium text-blue-400 hover:text-blue-300"
              >
                Clear filters
              </button>
            )}
          </p>
        </Reveal>

        {visible.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((group, index) => (
              <Reveal key={group.key} delay={Math.min(index, 6) * 0.06} className="h-full">
                <ArchiveCard group={group} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="glass-panel flex flex-col items-center gap-3 p-8 text-center text-sm text-slate-400">
            <p>{groups.length === 0 ? "No events have been added yet." : "No events match these filters."}</p>
            {filtersActive && (
              <button
                type="button"
                onClick={() => setFilters({ ...EMPTY, sort })}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-medium text-white transition-colors hover:bg-white/10"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
