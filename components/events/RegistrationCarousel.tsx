"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, ClipboardList, Hourglass, Lock, Trophy } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";
import { formatEventDate } from "@/lib/format";
import { registrationState, seasonLabel, type RegistrationState } from "@/lib/events";
import type { Event } from "@/lib/types";

export interface CarouselItem {
  event: Event;
  abbreviation: string;
  name: string;
}

function shortDate(iso: string | null) {
  if (!iso) return "TBA";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const PILL: Record<RegistrationState | "live", { label: string; className: string }> = {
  live: { label: "Live now", className: "bg-green-500/20 text-green-200 ring-green-400/30" },
  open: { label: "Registration open", className: "bg-blue-500/25 text-blue-100 ring-blue-400/40" },
  "not-open": { label: "Coming soon", className: "bg-night-950/60 text-slate-200 ring-white/15" },
  closed: { label: "Registration closed", className: "bg-night-950/60 text-slate-300 ring-white/15" },
};

function RegistrationButton({ event, state }: { event: Event; state: RegistrationState }) {
  const base = "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm";
  if (state === "open" && event.registrationUrl) {
    return (
      <a
        href={event.registrationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, "bg-brand-gradient font-semibold text-night-950 transition hover:brightness-110")}
      >
        Register now
        <ArrowRight className="h-4 w-4" />
      </a>
    );
  }
  return (
    <span className={cn(base, "border border-white/10 bg-white/5 text-slate-400")}>
      {state === "closed" ? <Lock className="h-4 w-4" /> : <Hourglass className="h-4 w-4" />}
      {state === "closed" ? "Registration closed" : "Registration not yet open"}
    </span>
  );
}

function CarouselCard({ item, today }: { item: CarouselItem; today: string }) {
  const { event } = item;
  const state = registrationState(event, today);
  const pill = event.status === "Running" ? PILL.live : PILL[state];
  const label = [item.abbreviation, event.seasonNumber ? `S${event.seasonNumber}` : null].filter(Boolean).join(" · ");
  const facts = [
    { label: "Opens", value: shortDate(event.registrationOpens) },
    { label: "Deadline", value: shortDate(event.registrationDeadline) },
    { label: "Event", value: formatEventDate(event) ?? "TBA" },
  ];

  return (
    <article className="glass-panel flex h-full w-[85vw] max-w-[22rem] shrink-0 snap-start flex-col overflow-hidden sm:w-[21rem]">
      <Link href={`/events/${event.id}`} className="group relative block aspect-[16/10] overflow-hidden" tabIndex={-1} aria-hidden>
        {event.bannerImage ? (
          <Image
            src={event.bannerImage}
            alt=""
            fill
            sizes="(min-width: 640px) 21rem, 85vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
            <Trophy className="h-12 w-12 text-night-950/40" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-night-950/20 to-transparent" />
        <span className={cn("absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ring-1 backdrop-blur-md", pill.className)}>
          {pill.label}
        </span>
        <div className="absolute inset-x-4 bottom-3">
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-blue-400">{label}</p>
          <p className="mt-1 line-clamp-1 font-display text-xl font-semibold uppercase leading-tight text-white">{item.name}</p>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-slate-300">
          {event.description || `${seasonLabel(event) ?? "This season"}. Details will be announced soon.`}
        </p>
        <dl className="mt-3 grid grid-cols-3 gap-2">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5">
              <dt className="text-[0.6875rem] text-slate-400">{fact.label}</dt>
              <dd className="truncate text-xs font-semibold text-white">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto flex items-center gap-2 pt-4">
          <RegistrationButton event={event} state={state} />
          <Link
            href={`/events/${event.id}`}
            aria-label={`${item.name} details`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function RegistrationCarousel({ items, today }: { items: CarouselItem[]; today: string }) {
  const track = useRef<HTMLDivElement>(null);
  if (items.length === 0) return null;

  const scroll = (direction: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: direction * Math.min(el.clientWidth * 0.9, 700), behavior: "smooth" });
  };

  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow icon={ClipboardList} className="mb-4">
              Registration
            </Eyebrow>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">New &amp; upcoming events</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{items.length} upcoming</span>
            {items.length > 1 && (
              <div className="hidden gap-2 sm:flex">
                {([-1, 1] as const).map((direction) => (
                  <button
                    key={direction}
                    type="button"
                    onClick={() => scroll(direction)}
                    aria-label={direction === -1 ? "Previous events" : "Next events"}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 transition-colors hover:bg-white/10"
                  >
                    {direction === -1 ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        <div
          ref={track}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2"
        >
          {items.map((item) => (
            <CarouselCard key={item.event.id} item={item} today={today} />
          ))}
        </div>
      </div>
    </section>
  );
}
