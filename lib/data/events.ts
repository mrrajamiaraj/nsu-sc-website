import { createClient } from "@/lib/supabase/server";
import { mapEventRow } from "@/lib/mappers";
import type { Event, EventStatus } from "@/lib/types";

export async function getAllEvents(): Promise<Event[]> {
  const supabase = await createClient();
  // created_at order is the tiebreak for events sharing a date (stable sort below).
  const { data } = await supabase.from("events").select("*").order("created_at", { ascending: true });
  return (data ?? []).map(mapEventRow);
}

export async function getEventById(eventId: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
  return data ? mapEventRow(data) : null;
}

// FR-8 sort order: Upcoming = soonest first, Running = soonest start first,
// Finished = newest first. Undated events always go last.
export async function getEventsByStatus(status: EventStatus): Promise<Event[]> {
  const events = (await getAllEvents()).filter((event) => event.status === status);
  const direction = status === "Finished" ? -1 : 1;
  return [...events].sort((a, b) => {
    if (!a.date || !b.date) return (a.date ? 0 : 1) - (b.date ? 0 : 1);
    return direction * (new Date(a.date).getTime() - new Date(b.date).getTime());
  });
}

// FR-2 / FR-26: featured event is admin-selected (site_content.featured_event_id),
// not just "the next upcoming one".
export async function getFeaturedEvent(): Promise<Event | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("featured_event_id")
    .eq("page_key", "home_featured_event")
    .maybeSingle();

  const featuredId = data?.featured_event_id as string | null;
  if (!featuredId) return null;
  return getEventById(featuredId);
}
