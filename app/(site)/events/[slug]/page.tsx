import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { EventPage } from "@/components/events/hub/EventPage";
import { ContactStage } from "@/components/contact/interaction/ContactStage";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { SITE_URL } from "@/lib/constants";
import { getAllEvents } from "@/lib/data/events";
import { todayInDhaka } from "@/lib/events";
import { hubEvents, sportLabel, typeLabel, type HubEvent } from "@/lib/events-hub";
import { detailPageMetadata } from "@/lib/seo";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function load(param: string) {
  const events = hubEvents(await getAllEvents(), todayInDhaka());
  const event = events.find((e) => e.slug === param.toLowerCase() || (UUID.test(param) && e.id === param)) ?? null;
  return { events, event };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { event } = await load(params.slug);
  if (!event) return { title: "Event" };
  const facts = [event.code, sportLabel(event.sport), typeLabel(event.type), event.year].filter(Boolean).join(" · ");
  return detailPageMetadata({
    title: event.name,
    description: event.description || facts,
    path: `/events/${event.slug}`,
    image: event.poster,
  });
}

// schema.org SportsEvent, so the event shows properly in search and when shared.
function jsonLd(e: HubEvent) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: e.name,
    url: `${SITE_URL}/events/${e.slug}`,
    ...(e.start && !e.yearOnly ? { startDate: e.start, endDate: e.end ?? e.start } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(e.venue ? { location: { "@type": "Place", name: e.venue, address: "North South University, Bashundhara, Dhaka" } } : {}),
    ...(e.poster ? { image: [e.poster] } : {}),
    ...(e.description ? { description: e.description.slice(0, 300) } : {}),
    ...(sportLabel(e.sport) ? { sport: sportLabel(e.sport) } : {}),
    organizer: { "@type": "SportsOrganization", name: "NSU Games & Sports Club", url: SITE_URL },
  };
}

// One template for every event. Old links by id go on to the readable address.
export default async function EventDetailPage({ params, searchParams }: { params: { slug: string }; searchParams: { tab?: string | string[] } }) {
  const { events, event } = await load(params.slug);
  if (!event) notFound();
  if (params.slug !== event.slug) permanentRedirect(`/events/${event.slug}`);

  const i = events.findIndex((e) => e.id === event.id);
  const more = events.filter((e) => e.id !== event.id && e.sport && e.sport === event.sport).slice(0, 6);
  const tab = typeof searchParams.tab === "string" ? searchParams.tab : null;

  return (
    <HomeMotionConfig>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(event)).replace(/</g, "\\u003c") }} />
      <div className="-mt-28 overflow-x-clip bg-[#0b2524] pb-4 pt-28 [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactStage>
          <EventPage event={event} prev={i > 0 ? events[i - 1] : null} next={i < events.length - 1 ? events[i + 1] : null} more={more} initialTab={tab} />
        </ContactStage>
      </div>
    </HomeMotionConfig>
  );
}
