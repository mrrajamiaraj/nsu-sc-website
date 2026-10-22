import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Reveal } from "@/components/motion/Reveal";
import { formatEventDate } from "@/lib/format";
import type { Event, EventStatus } from "@/lib/types";

const HEADINGS: Record<EventStatus, string> = {
  Running: "Happening now",
  Upcoming: "Coming up",
  Finished: "Latest result",
};

export function FeaturedEvent({ event }: { event: Event }) {
  const when = formatEventDate(event, { withRange: true });
  const facts = [
    { label: "Dates", value: when },
    { label: "Venue", value: event.venue },
    { label: "Teams", value: event.teamCount ? String(event.teamCount) : null },
    { label: "Winners", value: event.winners },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{HEADINGS[event.status]}</h2>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            All events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <Reveal>
          <article className="glass-panel grid overflow-hidden lg:grid-cols-5">
            <div className="relative aspect-[16/10] lg:col-span-3 lg:aspect-auto lg:min-h-[24rem]">
              {event.bannerImage ? (
                <Image
                  src={event.bannerImage}
                  alt={event.name}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
                  <Trophy className="h-16 w-16 text-night-950/40" strokeWidth={1.5} />
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 sm:p-8 lg:col-span-2">
              <StatusBadge status={event.status} className="self-start" />
              <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl">{event.name}</h3>

              {facts.length > 0 && (
                <dl className="mt-5 space-y-3 border-y border-white/10 py-5 text-sm">
                  {facts.map((fact) => (
                    <div key={fact.label} className="grid grid-cols-[5.5rem_1fr] gap-3">
                      <dt className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-500">
                        {fact.label}
                      </dt>
                      <dd className="whitespace-pre-line text-white">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {event.description && <p className="mt-5 line-clamp-4 text-sm text-slate-400">{event.description}</p>}

              <Link
                href={`/events/${event.id}`}
                className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-blue-400 transition-colors hover:text-blue-300"
              >
                {event.status === "Finished" ? "See results and photos" : "Event details"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
