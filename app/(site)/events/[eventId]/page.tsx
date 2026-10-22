import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Coins, MapPin, Medal, Shield, Star, Trophy, Users, type LucideIcon } from "lucide-react";
import { EventGallerySlider } from "@/components/events/EventGallerySlider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IconChip, type ChipColor } from "@/components/ui/IconChip";
import { Reveal } from "@/components/motion/Reveal";
import { formatEventDate } from "@/lib/format";
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

  const when = formatEventDate(event, { withRange: true });

  // Participants, location and the four placings always show (with a dash when
  // not recorded) so every event page has the same layout; teams and prize pool
  // only when set.
  const overview = [
    {
      icon: Users,
      color: "blue" as const,
      label: "Total Participants",
      value: event.participantCount ? `${event.participantCount}+ Athletes` : null,
      always: true,
    },
    { icon: MapPin, color: "teal" as const, label: "Location", value: event.venue, always: true },
    { icon: Shield, color: "purple" as const, label: "Total Teams", value: event.teamCount ? `${event.teamCount} Teams` : null },
  ].filter((item) => item.always || item.value);

  const results = [
    { icon: Trophy, color: "amber" as const, label: "Winner", value: event.winners, always: true },
    { icon: Medal, color: "teal" as const, label: "1st Runner-up", value: event.runnersUp, always: true },
    { icon: Medal, color: "purple" as const, label: "2nd Runner-up", value: event.secondRunnerUp, always: true },
    { icon: Star, color: "blue" as const, label: "Man of the Tournament", value: event.manOfTournament, always: true },
    { icon: Coins, color: "green" as const, label: "Prize Pool", value: event.prizePool },
  ].filter((result) => result.always || result.value);

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

            {when && (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-blue-400" />
                  <span className="font-mono">{when}</span>
                </span>
              </div>
            )}
          </Reveal>
        </div>
      </div>

      <div className="px-4 pb-10">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">Event Details</h2>
            <div className="glass-panel p-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {overview.map((item) => (
                  <DetailItem key={item.label} {...item} />
                ))}
              </div>
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-sm text-slate-400">Description</p>
                <p className="mt-2 max-w-3xl whitespace-pre-line text-slate-300">{event.description}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">Results</h2>
            <div className="glass-panel grid gap-6 p-8 sm:grid-cols-2">
              {results.map((result) => (
                <DetailItem key={result.label} {...result} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}

function DetailItem({
  icon,
  color,
  label,
  value,
}: {
  icon: LucideIcon;
  color: ChipColor;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-4">
      <IconChip icon={icon} color={color} />
      <div className="min-w-0">
        <p className="text-sm text-slate-400">{label}</p>
        {value ? (
          <p className="whitespace-pre-line font-semibold text-white">{value}</p>
        ) : (
          <p className="font-semibold text-slate-500">—</p>
        )}
      </div>
    </div>
  );
}
