import { mockEvents, mockSiteContent } from "@/lib/mock-data";
import type { Event, EventStatus } from "@/lib/types";

// Swap for `supabase.from("events").select("*")` once Supabase exists.
async function getAllEvents(): Promise<Event[]> {
  return mockEvents;
}

// FR-8 sort order: Upcoming = soonest first, Running = soonest start first,
// Finished = newest first.
export async function getEventsByStatus(status: EventStatus): Promise<Event[]> {
  const events = (await getAllEvents()).filter((event) => event.status === status);
  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return status === "Finished" ? sorted.reverse() : sorted;
}

// FR-2 / FR-26: featured event is admin-selected (site_content.featured_event_id),
// not just "the next upcoming one".
export async function getFeaturedEvent(): Promise<Event | null> {
  const events = await getAllEvents();
  const featuredEventEntry = mockSiteContent.find((entry) => entry.pageKey === "home_featured_event");
  const featuredId = featuredEventEntry?.featuredEventId;
  if (!featuredId) return null;
  return events.find((event) => event.id === featuredId) ?? null;
}
