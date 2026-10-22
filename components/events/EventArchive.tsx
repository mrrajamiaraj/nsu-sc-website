"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Archive, ChevronDown, Layers, Search, SlidersHorizontal, Trophy } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { eventYear, seasonLabel, type EventGroup } from "@/lib/events";
import type { EventStatus } from "@/lib/types";

type Sort = "newest" | "oldest" | "name";

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="relative block lg:w-36">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-2xl border border-white/15 bg-white/5 py-2.5 pl-4 pr-9 text-sm text-white focus:border-blue-400/60 focus:outline-none [&>option]:bg-night-900"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </label>
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
      <Link href={href} tabIndex={-1} aria-hidden className="relative block aspect-[16/10] overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
        <h3 className="font-bold text-white">
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

export function EventArchive({ groups, initialQuery = "" }: { groups: EventGroup[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [year, setYear] = useState("");
  const [sport, setSport] = useState("");
  const [season, setSeason] = useState("");
  const [status, setStatus] = useState<"" | EventStatus>("");
  const [sort, setSort] = useState<Sort>("newest");

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
    return filtered.sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name) : (latestTime(b) - latestTime(a)) * (sort === "newest" ? 1 : -1),
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
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <label className="relative block">
              <span className="sr-only">Search events</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or abbreviation (e.g. NCL)"
                className="w-full rounded-2xl border border-white/15 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex">
              <FilterSelect label="Year" value={year} onChange={setYear}>
                <option value="">All years</option>
                {options.years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </FilterSelect>
              {options.sports.length > 0 && (
                <FilterSelect label="Sport" value={sport} onChange={setSport}>
                  <option value="">All sports</option>
                  {options.sports.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </FilterSelect>
              )}
              {options.seasons.length > 0 && (
                <FilterSelect label="Season" value={season} onChange={setSeason}>
                  <option value="">All seasons</option>
                  {options.seasons.map((n) => (
                    <option key={n} value={n}>
                      Season {n}
                    </option>
                  ))}
                </FilterSelect>
              )}
              <FilterSelect label="Status" value={status} onChange={(v) => setStatus(v as "" | EventStatus)}>
                <option value="">Any status</option>
                <option value="Running">Live now</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Finished">Finished</option>
              </FilterSelect>
              <FilterSelect label="Sort" value={sort} onChange={(v) => setSort(v as Sort)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">A–Z</option>
              </FilterSelect>
            </div>
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400" aria-live="polite">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Showing {visible.length} of {groups.length} events
            {filtersActive && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setYear("");
                  setSport("");
                  setSeason("");
                  setStatus("");
                }}
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
          <p className="glass-panel p-8 text-center text-sm text-slate-400">
            {groups.length === 0 ? "No events have been added yet." : "No events match these filters."}
          </p>
        )}
      </div>
    </section>
  );
}
