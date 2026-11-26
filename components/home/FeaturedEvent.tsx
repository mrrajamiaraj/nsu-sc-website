import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Crown, Hourglass, Lock, Trophy } from "lucide-react";
import { PosterImage } from "@/components/events/PosterImage";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate, formatEventDate } from "@/lib/format";
import { registrationState, resultLines, todayInDhaka } from "@/lib/events";
import type { Event, EventStatus } from "@/lib/types";

const HEADINGS: Record<EventStatus, string> = {
  Running: "Happening now",
  Upcoming: "Coming up",
  Finished: "Latest result",
};

const IMAGE_SIZES = "(min-width: 1024px) 60vw, 100vw";

// Banners are event artwork, shown whole (see PosterImage). A gallery photo
// standing in for a missing banner can be cropped to fill instead.
function EventCover({ event }: { event: Event }) {
  if (event.bannerImage) {
    return <PosterImage src={event.bannerImage} alt={event.name} sizes={IMAGE_SIZES} />;
  }
  if (event.gallery[0]) {
    return <Image src={event.gallery[0]} alt={event.name} fill sizes={IMAGE_SIZES} className="object-cover" />;
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
      <Trophy className="h-16 w-16 text-night-950/40" strokeWidth={1.5} />
    </div>
  );
}

// The event's own registration (a tournament form), not club sign-up.
function EventRegistration({ event }: { event: Event }) {
  const state = registrationState(event, todayInDhaka());

  if (state === "open" && event.registrationUrl) {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
          Register for this event
          <ArrowRight className="h-4 w-4" />
        </Button>
        {event.registrationDeadline && (
          <p className="text-sm text-slate-300">Deadline {formatDate(event.registrationDeadline)}</p>
        )}
      </div>
    );
  }

  // Mid-event, "not open yet" would mislead; only an open form is worth a line.
  if (event.status === "Running") return null;

  const Icon = state === "closed" ? Lock : Hourglass;
  const label =
    state === "closed"
      ? "Event registration closed"
      : event.registrationOpens
        ? `Event registration opens ${formatDate(event.registrationOpens)}`
        : "Event registration not open yet";

  return (
    <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400">
      <Icon aria-hidden className="h-4 w-4" />
      {label}
    </p>
  );
}

export function FeaturedEvent({ event }: { event: Event }) {
  const finished = event.status === "Finished";
  const champions = finished ? resultLines(event.winners) : [];
  const facts = [
    { label: "Dates", value: formatEventDate(event, { withRange: true }) },
    { label: "Venue", value: event.venue },
    { label: "Teams", value: event.teamCount ? String(event.teamCount) : null },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{HEADINGS[event.status]}</h2>
          <Link
            href="/events"
            className="tap-target inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            All events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <Reveal>
          <article className="glass-panel grid overflow-hidden lg:grid-cols-5">
            <div className="relative aspect-[3/2] overflow-hidden bg-night-950/60 lg:col-span-3 lg:aspect-auto lg:min-h-[24rem]">
              <EventCover event={event} />
            </div>

            <div className="flex min-w-0 flex-col p-6 sm:p-8 lg:col-span-2">
              <StatusBadge status={event.status} className="self-start" />
              <h3 className="mt-4 text-balance break-words text-2xl font-bold text-white sm:text-3xl">{event.name}</h3>

              {facts.length > 0 && (
                <dl className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
                  {facts.map((fact) => (
                    <div key={fact.label} className="grid grid-cols-[5.5rem_1fr] gap-3">
                      <dt className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-400">
                        {fact.label}
                      </dt>
                      <dd className="min-w-0 break-words text-white">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {/* One line per category, so a multi-category result reads as a list. */}
              {champions.length > 0 && (
                <div className="mt-5 border-t border-white/10 pt-5">
                  <h4 className="flex items-center gap-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-400">
                    <Crown aria-hidden className="h-3.5 w-3.5 text-amber-300" />
                    {champions.length > 1 ? "Champions by category" : "Champion"}
                  </h4>
                  <ul className="mt-2 divide-y divide-white/10 text-sm">
                    {champions.map((line) => (
                      <li key={line} className="break-words py-2 font-medium text-white">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Before and during an event the description is the pitch; afterwards
                  the results above replace it (the details page keeps the full text). */}
              {!finished && (
                <>
                  {event.description && (
                    <p className="mt-5 line-clamp-3 whitespace-pre-line text-sm text-slate-400">{event.description}</p>
                  )}
                  <EventRegistration event={event} />
                </>
              )}

              <Link
                href={`/events/${event.id}`}
                className="tap-target mt-auto inline-flex items-center gap-1.5 self-start pt-6 text-sm font-semibold text-blue-400 transition-colors hover:text-blue-300"
              >
                {finished ? "Full results and photos" : "Event details"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
