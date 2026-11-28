"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { FlapText } from "@/components/home/matchday/SplitFlap";
import { SportIcon } from "@/components/home/SportIcon";
import type { ClubRegistration } from "@/lib/registration";
import { cn } from "@/lib/utils";

type Rec = {
  tournaments: number;
  sports: number;
  seasons: number;
  since: number | null;
  bySport: [string, number][];
  teams: number | null;
  matches: number | null;
  athletes: number | null;
  leaders: [string, number][];
};

// Records & numbers: only figures that are on record. Hovering Tournaments shows the split by sport.
export function Records({ rec }: { rec: Rec }) {
  const reduce = Boolean(useReducedMotion());
  const ref = useRef<HTMLElement>(null);
  const play = useInView(ref, { once: true, amount: 0.4 });
  const [open, setOpen] = useState(false);
  const stats = [
    { v: rec.tournaments, label: "Tournaments", breakdown: true },
    { v: rec.sports, label: "Sports" },
    { v: rec.seasons, label: rec.since ? `Seasons since ${rec.since}` : "Seasons" },
    rec.teams ? { v: rec.teams, label: "Teams hosted" } : null,
    rec.matches ? { v: rec.matches, label: "Matches" } : null,
    rec.athletes ? { v: rec.athletes, label: "Players" } : null,
  ].filter(Boolean) as { v: number; label: string; breakdown?: boolean }[];
  const top = Math.max(1, ...rec.leaders.map((l) => l[1]));

  return (
    <section ref={ref} aria-labelledby="records-heading" className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6 lg:mt-32 lg:px-8">
      <h2 id="records-heading" className="text-[40px] !font-extrabold leading-none text-[#f5f1e8]">
        Records &amp; numbers
      </h2>
      <div className={cn("mt-8 grid grid-cols-2 border-y border-white/10 md:grid-cols-3", stats.length > 3 && "lg:grid-cols-6")}>
        {stats.map((s, i) => (
          <div
            key={s.label}
            tabIndex={0}
            onPointerEnter={() => s.breakdown && setOpen(true)}
            onPointerLeave={() => s.breakdown && setOpen(false)}
            onFocus={() => s.breakdown && setOpen(true)}
            onBlur={() => s.breakdown && setOpen(false)}
            className="relative border-white/10 px-5 py-7 hover:bg-white/[0.03] [&:not(:last-child)]:border-r"
          >
            <span className="sr-only">
              {s.v} {s.label}
            </span>
            <FlapText text={String(s.v)} charset="0123456789" play={play} still={reduce} delay={i * 140} className="text-[40px] md:text-[52px]" />
            <span aria-hidden className="mt-3 block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/70">
              {s.label}
            </span>
            {s.breakdown && (
              <ul className={cn("mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[13px] transition-[opacity,max-height] duration-300 md:absolute md:left-0 md:top-full md:z-20 md:mt-0 md:w-72 md:rounded-b-lg md:border md:border-white/15 md:bg-[#082120] md:p-3", open ? "opacity-100" : "md:pointer-events-none md:opacity-0")}>
                {rec.bySport.map(([sport, n]) => (
                  <li key={sport} className="flex justify-between gap-2 text-[#f5f1e8]/80">
                    <span>{sport}</span>
                    <span className="tabular-nums text-[#3fcfca]">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {rec.leaders.length > 0 && (
        <div className="mt-10 max-w-xl">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">Most titles</h3>
          <ol className="mt-3 space-y-2">
            {rec.leaders.map(([name, n]) => (
              <li key={name} className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_2rem] items-center gap-3 text-[15px]">
                <span className="truncate text-[#f5f1e8]">{name}</span>
                <span className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.span className="block h-full rounded-full bg-[#3fcfca]" initial={{ width: 0 }} animate={{ width: play ? `${(n / top) * 100}%` : 0 }} transition={{ duration: reduce ? 0 : 0.8 }} />
                </span>
                <span className="text-right tabular-nums text-[#f5f1e8]/70">{n}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

// Host or sponsor an event.
export function HostCta({ partners }: { partners: { name: string; logo: string }[] }) {
  return (
    <section aria-labelledby="host-heading" className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6 lg:mt-32 lg:px-8">
      <div className="grid gap-8 border-t border-white/15 pt-12 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-6">
          <h2 id="host-heading" className="text-[40px] !font-extrabold leading-[0.95] text-[#f5f1e8] md:text-[56px]">
            Want to host or sponsor an event?
          </h2>
          <Link href="/contact?topic=partnership#contact-form" className="group mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-[#f5f1e8]/70 px-6 text-[16px] font-semibold text-[#f5f1e8] hover:-translate-y-0.5 hover:border-[#f5f1e8] hover:bg-white/10">
            Partner with us
            <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        {partners.length > 0 && (
          <ul aria-label="Past partners" className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:col-span-6">
            {partners.map((p) => (
              <li key={p.name} title={p.name} className="group relative flex aspect-[3/2] items-center justify-center rounded-md bg-[#f5f1e8] p-3 transition-transform duration-200 hover:-translate-y-1">
                <Image src={p.logo} alt={p.name} fill sizes="160px" className="object-contain p-3 grayscale transition duration-300 group-hover:grayscale-0" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// "Want to play in the next one?": pick a sport, then join or look at its squads.
export function PlayCta({ sports, club }: { sports: { key: string; label: string }[]; club: ClubRegistration }) {
  const [sport, setSport] = useState(sports[0]?.key ?? "");
  const label = sports.find((s) => s.key === sport)?.label ?? "";
  const primary = "group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#3fcfca] px-7 text-[16px] font-semibold text-[#002e2c] hover:bg-[#6fe0dc]";
  return (
    <section aria-labelledby="play-heading" className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6 lg:mt-32 lg:px-8">
      <div className="border-t border-white/15 pt-12 lg:grid lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <h2 id="play-heading" className="text-[44px] !font-extrabold leading-[0.92] text-[#f5f1e8] md:text-[72px]">
            Want to play in the next one?
          </h2>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-[#f5f1e8]/75">{club.body}</p>
        </div>
        <div className="mt-8 lg:col-span-5 lg:mt-2">
          <p id="play-sport" className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">
            Your sport
          </p>
          <div role="radiogroup" aria-labelledby="play-sport" className="mt-3 flex flex-wrap gap-2">
            {sports.map((s) => (
              <button
                key={s.key}
                type="button"
                role="radio"
                aria-checked={sport === s.key}
                title={s.label}
                onClick={() => setSport(s.key)}
                className={cn("group flex h-14 w-14 items-center justify-center rounded-xl border", sport === s.key ? "border-[#3fcfca] bg-[#3fcfca]/10 text-[#3fcfca]" : "border-white/15 text-[#f5f1e8]/65 hover:border-white/40 hover:text-[#f5f1e8]")}
              >
                <SportIcon aria-hidden sport={s.label} className="h-6 w-6 transition-transform group-hover:scale-110" />
                <span className="sr-only">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Magnetic>
              {club.formUrl ? (
                <a href={club.formUrl} target="_blank" rel="noopener noreferrer" data-haptic className={primary}>
                  Join the club
                  <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  <span className="sr-only">(opens the sign-up form)</span>
                </a>
              ) : (
                <Link href={`/contact?topic=trials#contact-form`} data-haptic className={primary}>
                  Ask about trials
                  <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </Magnetic>
            <Link href={`/teams?sport=${sport}`} className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-[#f5f1e8]/70 px-7 text-[16px] font-semibold text-[#f5f1e8] hover:-translate-y-0.5 hover:border-[#f5f1e8] hover:bg-white/10">
              {label ? `${label} squads` : "Browse the squads"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
