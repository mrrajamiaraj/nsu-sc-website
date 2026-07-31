import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Coins, MapPin, Medal, Shield, Trophy, Users } from "lucide-react";
import { EventGallerySlider } from "@/components/events/EventGallerySlider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IconChip } from "@/components/ui/IconChip";
import { Reveal } from "@/components/motion/Reveal";
import { formatDateRange } from "@/lib/format";
import { getAllEvents, getEventById } from "@/lib/data/events";

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map((event) => ({ eventId: event.id }));
}

export async function generateMetadata({ params }: { params: { eventId: string } }): Promise<Metadata> {
  const event = await getEventById(params.eventId);
  return { title: event?.name ?? "Event" };
}

export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  const event = await getEventById(params.eventId);
  if (!event) notFound();

  const overview = [
    { icon: Shield, color: "purple" as const, label: "Total Teams", value: event.teamCount ? `${event.teamCount} Teams` : null },
    {
      icon: Users,
      color: "blue" as const,
      label: "Total Participants",
      value: event.participantCount ? `${event.participantCount}+ Athletes` : null,
    },
  ].filter((item) => item.value);

  const results = [
    { icon: Trophy, color: "amber" as const, label: "Winners", value: event.winners },
    { icon: Medal, color: "teal" as const, label: "Runners-up", value: event.runnersUp },
    { icon: Coins, color: "green" as const, label: "Prize Pool", value: event.prizePool },
  ].filter((result) => result.value);

  return (
    <>
      <div className="px-4 pb-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
        </div>
      </div>

      <div className="px-4 pb-10">
        <Reveal className="mx-auto max-w-5xl">
          <EventGallerySlider images={event.gallery.length > 0 ? event.gallery : event.bannerImage ? [event.bannerImage] : []} alt={event.name} />
        </Reveal>
      </div>

      <div className="px-4 pb-10">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <StatusBadge status={event.status} />
            <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl">{event.name}</h1>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-400" />
                {formatDateRange(event.date, event.endDate)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                {event.venue}
              </span>
            </div>

            <p className="mt-6 max-w-3xl text-slate-300">{event.description}</p>
          </Reveal>
        </div>
      </div>

      {overview.length > 0 && (
        <div className="px-4 pb-10">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="glass-panel grid gap-8 p-8 sm:grid-cols-2 sm:divide-x sm:divide-white/10">
                {overview.map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <IconChip icon={item.icon} color={item.color} />
                    <div>
                      <p className="text-sm text-slate-400">{item.label}</p>
                      <p className="font-semibold text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      )}

      <div className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">Results</h2>
          </Reveal>

          {results.length > 0 ? (
            <div className="glass-panel grid gap-8 p-8 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
              {results.map((result) => (
                <div key={result.label} className="flex items-center gap-4">
                  <IconChip icon={result.icon} color={result.color} />
                  <div>
                    <p className="text-sm text-slate-400">{result.label}</p>
                    <p className="font-semibold text-white">{result.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Results will be posted once the event concludes.</p>
          )}
        </div>
      </div>
    </>
  );
}
