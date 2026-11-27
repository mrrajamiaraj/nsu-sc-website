"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export type StripWinner = { category: string | null; names: string };

export type LiveStripData =
  | {
      kind: "next";
      id: string;
      name: string;
      date: string | null; // ISO date of the first day; null when not announced
      dateLabel: string | null;
      venue: string | null;
      live: boolean;
      registerUrl: string | null;
    }
  | {
      kind: "result";
      id: string;
      name: string;
      dateLabel: string | null;
      venue: string | null;
      photo: string | null;
      winners: StripWinner[];
    };

// Editorial result box, like a newspaper sports page: hierarchy from size and weight, no boxes.
// The lime accent appears in exactly two places: the champion's trophy and the "Full results" link.
// Background: the site's deep teal, the same colour the hero fades into, so there's no seam.
const BAND = "bg-[#0b2524]";
const LIME = "text-[#C6FF3D]";
const MUTED = "text-white/60";

// Results are typed in capitals ("SHADOW HUNTERS"); show them as names ("Shadow Hunters").
const ACRONYMS = new Set(["NSU", "NSUSC", "SC", "BD", "ULAB", "BUET", "IUB", "DU", "AIUB", "BRAC"]);
function asName(text: string) {
  if (/[a-z]/.test(text)) return text;
  return text
    .split(/(\s+)/)
    .map((word) => (ACRONYMS.has(word) ? word : word.charAt(0) + word.slice(1).toLowerCase()))
    .join("");
}
// Categories read in sentence case ("Male doubles").
function asCategory(text: string) {
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// The champion to feature: an individual title (chess, singles) reads best large, so prefer a
// category that isn't a pairs or team event; otherwise the first result.
function featured(winners: StripWinner[]) {
  const solo = winners.findIndex((w) => w.category && !/doubles|double|pair|team|mix/i.test(w.category));
  return solo >= 0 ? solo : 0;
}

// Days, hours and minutes to the start of the event day in Dhaka (UTC+6).
function remaining(date: string) {
  const ms = new Date(`${date}T00:00:00+06:00`).getTime() - Date.now();
  if (ms <= 0) return null;
  const mins = Math.floor(ms / 60000);
  return { d: Math.floor(mins / 1440), h: Math.floor((mins % 1440) / 60), m: mins % 60 };
}

function Countdown({ date }: { date: string }) {
  const [left, setLeft] = useState<ReturnType<typeof remaining> | undefined>(undefined);
  useEffect(() => {
    const tick = () => setLeft(remaining(date));
    tick();
    const timer = setInterval(tick, 30000);
    return () => clearInterval(timer);
  }, [date]);
  if (!left) return null;
  return (
    <p className="text-[22px] font-semibold leading-tight text-white" aria-label={`Starts in ${left.d} days, ${left.h} hours, ${left.m} minutes`}>
      {left.d} days, {left.h} hours <span className={cn("text-[13px] font-normal", MUTED)}>to go</span>
    </p>
  );
}

// Lime text link; underline on hover only, arrow nudges right.
function StripLink({ href, external, children }: { href: string; external?: boolean; children: ReactNode }) {
  const className = cn(
    "group inline-flex items-center gap-1.5 whitespace-nowrap text-[15px] font-medium underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none",
    LIME,
  );
  const inner = (
    <>
      {children}
      <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-[3px] motion-reduce:transition-none" />
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

const divider = "hidden h-16 w-px shrink-0 bg-white/15 xl:block";

export function LiveStrip({ data }: { data: LiveStripData }) {
  const reduce = useReducedMotion();
  const kicker = data.kind === "result" ? "Latest result" : data.live ? "Live now" : "Next up";
  const kickerLine = [kicker, data.venue && asName(data.venue)].filter(Boolean).join(" · ");

  const winners = data.kind === "result" ? data.winners : [];
  const star = winners.length > 0 ? featured(winners) : -1;
  const champion = star >= 0 ? winners[star] : null;
  const others = winners.filter((_, index) => index !== star);

  return (
    <section id="live" aria-labelledby="live-title" className={cn("scroll-mt-24", BAND)}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto flex max-w-[1280px] flex-col gap-6 p-5 sm:px-8 xl:h-[120px] xl:flex-row xl:items-center xl:gap-10 xl:py-0"
      >
        {/* Photo and event: one row at every size. */}
        <div className="flex min-w-0 items-center gap-4 sm:gap-6 xl:shrink-0">
          {data.kind === "result" && data.photo && (
            <Link
              href={`/events/${data.id}`}
              tabIndex={-1}
              aria-hidden
              className="group relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24"
            >
              <Image
                src={data.photo}
                alt=""
                fill
                sizes="96px"
                className="object-cover grayscale-[40%] transition duration-300 group-hover:grayscale-0 motion-reduce:transition-none"
              />
            </Link>
          )}
          <div className="min-w-0">
            <p className={cn("text-[13px] leading-snug", MUTED)}>{kickerLine}</p>
            <h2 id="live-title" className="mt-1 text-[26px] leading-none text-white sm:text-[32px] xl:whitespace-nowrap">
              <Link href={`/events/${data.id}`} className="hover:underline hover:decoration-1 hover:underline-offset-4">
                {data.name}
              </Link>
            </h2>
          </div>
        </div>

        {data.kind === "result" ? (
          <>
            {champion && (
              <>
                <span aria-hidden className={divider} />
                <div className="xl:shrink-0">
                  <p className={cn("text-[13px]", MUTED)}>{champion.category ? `${asCategory(champion.category)} champion` : "Champion"}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-[22px] font-semibold leading-tight text-white xl:whitespace-nowrap">
                    <Trophy aria-hidden className={cn("h-[18px] w-[18px] shrink-0", LIME)} strokeWidth={2.25} />
                    {asName(champion.names)}
                  </p>
                </div>
              </>
            )}

            {/* The rest as a plain results list: category, then the winner, one per line
                (two columns on tablets; one column on desktop so the row fits 1280px). */}
            {others.length > 0 && (
              <dl className="grid gap-y-1 sm:grid-cols-[auto_auto] sm:justify-start sm:gap-x-8 xl:shrink-0 xl:grid-cols-1">
                {others.map((winner, index) => (
                  <div key={`${winner.category}-${index}`} className="flex items-baseline gap-2.5 xl:whitespace-nowrap">
                    <dt className={cn("shrink-0 text-[13px]", MUTED)}>{winner.category ? asCategory(winner.category) : "Winner"}</dt>
                    <dd className="text-[15px] font-medium text-white">{asName(winner.names)}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="border-t border-white/10 pt-4 xl:ml-auto xl:border-0 xl:pt-0">
              <StripLink href={`/events/${data.id}`}>Full results &amp; photos</StripLink>
            </div>
          </>
        ) : (
          <>
            {data.date && !data.live && (
              <>
                <span aria-hidden className={divider} />
                <div>
                  <p className={cn("text-[13px]", MUTED)}>{data.dateLabel ?? "Dates to be announced"}</p>
                  <Countdown date={data.date} />
                </div>
              </>
            )}
            <div className="border-t border-white/10 pt-4 xl:ml-auto xl:border-0 xl:pt-0">
              {data.registerUrl ? (
                <StripLink href={data.registerUrl} external>
                  Register
                </StripLink>
              ) : (
                <StripLink href={`/events/${data.id}`}>Event details</StripLink>
              )}
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}
