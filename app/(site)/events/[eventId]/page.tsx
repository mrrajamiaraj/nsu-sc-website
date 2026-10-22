import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, ChevronRight, Hourglass, Lock } from "lucide-react";
import { EventGallerySlider } from "@/components/events/EventGallerySlider";
import { PrizeBreakdown, SeasonSection, SeasonStats, WinnersPodium } from "@/components/events/SeasonSections";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { formatDate, formatEventDate } from "@/lib/format";
import { getAllEvents, getEventById, getSeasonsOfSeries, getSeriesById } from "@/lib/data/events";
import { eventYear, groupEvents, registrationState, seasonTitle, todayInDhaka } from "@/lib/events";
import { detailPageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map((event) => ({ eventId: event.id }));
}

export async function generateMetadata({ params }: { params: { eventId: string } }): Promise<Metadata> {
  const event = await getEventById(params.eventId);
  if (!event) return { title: "Event" };
  const series = event.seriesId ? await getSeriesById(event.seriesId) : null;
  return detailPageMetadata({
    title: series ? `${series.name} — ${seasonTitle(event)}` : event.name,
    description: event.description || series?.description,
    path: `/events/${event.id}`,
    image: event.bannerImage ?? event.gallery[0],
  });
}

function InfoTile({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <dt className="flex items-center gap-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-400">
        {icon && <CalendarDays className="h-3.5 w-3.5" />}
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-white">{value}</dd>
    </div>
  );
}

export default async function SeasonPage({ params }: { params: { eventId: string } }) {
  const event = await getEventById(params.eventId);
  if (!event) notFound();

  const [series, siblings] = await Promise.all([
    event.seriesId ? getSeriesById(event.seriesId) : null,
    event.seriesId ? getSeasonsOfSeries(event.seriesId) : [],
  ]);
  const group = groupEvents(siblings.length ? siblings : [event], series ? [series] : [])[0];
  const name = group.name;
  const year = eventYear(event);
  const today = todayInDhaka();
  const registration = registrationState(event, today);
  const photos = event.gallery.length > 0 ? event.gallery : event.bannerImage ? [event.bannerImage] : [];

  // Only show dates when they say more than the year; upcoming seasons without them say TBA.
  const dates = event.date && !event.yearOnly ? formatEventDate(event, { withRange: true }) : null;
  const tiles = [
    event.seasonNumber ? { label: "Season", value: String(event.seasonNumber) } : null,
    year ? { label: "Year", value: year } : null,
    dates || event.status !== "Finished" ? { label: "Dates", value: dates ?? "TBA", icon: true } : null,
    group.sport ? { label: "Sport", value: group.sport } : null,
    event.venue ? { label: "Venue", value: event.venue } : null,
  ].filter((tile): tile is { label: string; value: string; icon?: boolean } => Boolean(tile));

  return (
    <>
      <div className="px-4 pb-8 pt-4">
        <div className="mx-auto max-w-5xl">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-400">
              <li>
                <Link href="/events" className="tap-target transition-colors hover:text-white">
                  Events
                </Link>
              </li>
              <ChevronRight aria-hidden className="h-3.5 w-3.5" />
              <li>
                <Link
                  href={`/events?q=${encodeURIComponent(group.abbreviation)}`}
                  className="tap-target transition-colors hover:text-white"
                >
                  {group.abbreviation}
                </Link>
              </li>
              <ChevronRight aria-hidden className="h-3.5 w-3.5" />
              <li aria-current="page" className="text-white">
                {seasonTitle(event)}
              </li>
            </ol>
          </nav>

          {group.seasons.length > 1 && (
            <ul className="no-scrollbar mt-6 flex gap-2 overflow-x-auto" aria-label="Seasons">
              {group.seasons.map((season) => {
                const current = season.id === event.id;
                return (
                  <li key={season.id} className="shrink-0">
                    <Link
                      href={`/events/${season.id}`}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "inline-flex rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                        current
                          ? "bg-brand-gradient text-night-950"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      {season.seasonNumber ? `Season ${season.seasonNumber}` : "Season"}
                      {eventYear(season) && ` · ${eventYear(season)}`}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="px-4 pb-16">
        <Reveal className="glass-panel mx-auto grid max-w-5xl gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-blue-400">
                {group.abbreviation}
              </span>
              <StatusBadge status={event.status} />
            </div>
            <h1 className="mt-4 break-words text-4xl font-extrabold leading-[0.95] text-white sm:text-6xl">{name}</h1>
            {event.description ? (
              <p className="mt-5 max-w-[68ch] whitespace-pre-line leading-relaxed text-slate-300">{event.description}</p>
            ) : (
              <p className="mt-5 text-sm italic text-slate-400">A detailed description for this season has not been added yet.</p>
            )}

            {event.status !== "Finished" && (
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
                {registration === "open" && event.registrationUrl ? (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 font-semibold text-night-950 shadow-glow transition hover:brightness-110"
                  >
                    Register now
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-400">
                    {registration === "closed" ? <Lock className="h-4 w-4" /> : <Hourglass className="h-4 w-4" />}
                    {registration === "closed" ? "Registration closed" : "Registration not yet open"}
                  </span>
                )}
                <p className="text-sm text-slate-400">
                  {event.registrationOpens && `Opens ${formatDate(event.registrationOpens)}`}
                  {event.registrationOpens && event.registrationDeadline && " · "}
                  {event.registrationDeadline && `Deadline ${formatDate(event.registrationDeadline)}`}
                </p>
              </div>
            )}
          </div>

          <dl className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {tiles.map((tile) => (
              <InfoTile key={tile.label} {...tile} />
            ))}
          </dl>
        </Reveal>
      </div>

      <SeasonStats event={event} />
      <PrizeBreakdown event={event} />
      <WinnersPodium event={event} />

      <SeasonSection
        eyebrow="Gallery"
        title="Photo gallery"
        aside={photos.length > 0 && <span className="text-xs text-slate-400">{photos.length} photos</span>}
      >
        {photos.length > 0 ? (
          <EventGallerySlider images={photos} alt={name} captions={event.galleryCaptions} thumbnails />
        ) : (
          <p className="glass-panel px-6 py-5 text-sm italic text-slate-400">Photos from this season will appear here.</p>
        )}
      </SeasonSection>
    </>
  );
}
