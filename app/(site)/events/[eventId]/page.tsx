import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { EventGallerySlider } from "@/components/events/EventGallerySlider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Reveal } from "@/components/motion/Reveal";
import { formatEventDate } from "@/lib/format";
import { getAllEvents, getEventById } from "@/lib/data/events";

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map((event) => ({ eventId: event.id }));
}

function summarize(text: string, max = 160) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

export async function generateMetadata({ params }: { params: { eventId: string } }): Promise<Metadata> {
  const event = await getEventById(params.eventId);
  if (!event) return { title: "Event" };

  const description = event.description ? summarize(event.description) : undefined;
  const image = event.bannerImage ?? event.gallery[0];
  const images = image ? [{ url: image, alt: event.name }] : undefined;

  return {
    title: event.name,
    description,
    alternates: { canonical: `/events/${event.id}` },
    openGraph: { type: "website", title: event.name, description, url: `/events/${event.id}`, images },
    twitter: { card: image ? "summary_large_image" : "summary", title: event.name, description, images: image ? [image] : undefined },
  };
}

type Fact = { label: string; value: string | null };

function FactList({ facts }: { facts: Fact[] }) {
  const known = facts.filter((fact): fact is { label: string; value: string } => Boolean(fact.value));
  if (known.length === 0) return null;
  return (
    <dl className="divide-y divide-white/10">
      {known.map((fact) => (
        <div key={fact.label} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
          <dt className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-500 sm:pt-0.5">
            {fact.label}
          </dt>
          <dd className="whitespace-pre-line text-white">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  const event = await getEventById(params.eventId);
  if (!event) notFound();

  const when = formatEventDate(event, { withRange: true });
  const images = event.gallery.length > 0 ? event.gallery : event.bannerImage ? [event.bannerImage] : [];

  const details: Fact[] = [
    { label: "Dates", value: when },
    { label: "Venue", value: event.venue },
    { label: "Teams", value: event.teamCount ? String(event.teamCount) : null },
    { label: "Athletes", value: event.participantCount ? `${event.participantCount}+` : null },
  ];
  const results: Fact[] = [
    { label: "Winners", value: event.winners },
    { label: "Runners-up", value: event.runnersUp },
    { label: "2nd runners-up", value: event.secondRunnerUp },
    { label: "Man of the tournament", value: event.manOfTournament },
    { label: "Prize pool", value: event.prizePool },
  ];
  const hasResults = results.some((result) => result.value);

  return (
    <>
      <div className="px-4 pb-10 pt-4">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All events
          </Link>

          <Reveal className="mt-6">
            <StatusBadge status={event.status} />
            <h1 className="mt-4 text-4xl font-extrabold leading-[0.95] text-white sm:text-6xl">{event.name}</h1>
            {(when || event.venue) && (
              <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                {when && (
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-400" />
                    <span className="font-mono">{when}</span>
                  </span>
                )}
                {event.venue && (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    {event.venue}
                  </span>
                )}
              </p>
            )}
          </Reveal>
        </div>
      </div>

      {images.length > 0 && (
        <div className="px-4 pb-12">
          <Reveal className="mx-auto max-w-5xl">
            <EventGallerySlider images={images} alt={event.name} />
          </Reveal>
        </div>
      )}

      <div className="px-4 pb-20">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            {event.description && (
              <p className="max-w-[68ch] whitespace-pre-line text-lg leading-relaxed text-slate-300">{event.description}</p>
            )}
            <h2 className="mb-2 mt-10 text-xl font-bold text-white first:mt-0">Details</h2>
            <FactList facts={details} />
            {!details.some((fact) => fact.value) && (
              <p className="text-sm text-slate-500">No further details have been recorded for this event.</p>
            )}
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-2">
            <div className="glass-panel p-6 sm:p-8">
              <h2 className="mb-2 text-xl font-bold text-white">Results</h2>
              {hasResults ? (
                <FactList facts={results} />
              ) : (
                <p className="text-sm text-slate-400">
                  {event.status === "Finished"
                    ? "Results for this event haven't been posted yet."
                    : "Results will be posted here once the event is over."}
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
