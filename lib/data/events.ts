import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { mapEventRow, mapEventSeriesRow } from "@/lib/mappers";
import { getFeaturedEventId } from "@/lib/data/site-content";
import type { Event, EventSeries, EventStatus } from "@/lib/types";

export const getAllSeries = cache(async (): Promise<EventSeries[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("event_series").select("*").order("name");
  return (data ?? []).map(mapEventSeriesRow);
});

export const getSeriesById = cache(async (id: string): Promise<EventSeries | null> => {
  return (await getAllSeries()).find((series) => series.id === id) ?? null;
});

// Every season of a series, for the season switcher.
export async function getSeasonsOfSeries(seriesId: string): Promise<Event[]> {
  return (await getAllEvents()).filter((event) => event.seriesId === seriesId);
}

export const getAllEvents = cache(async (): Promise<Event[]> => {
  const supabase = await createClient();
  // created_at order is the tiebreak for events sharing a date (the sort below is stable).
  const { data } = await supabase.from("events").select("*").order("created_at", { ascending: true });
  return (data ?? []).map(mapEventRow);
});

export const getEventById = cache(async (eventId: string): Promise<Event | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
  return data ? mapEventRow(data) : null;
});

// Upcoming and running: soonest first. Finished: newest first. Undated events always last.
function sortByDate(events: Event[], status: EventStatus): Event[] {
  const direction = status === "Finished" ? -1 : 1;
  return [...events].sort((a, b) => {
    if (!a.date || !b.date) return (a.date ? 0 : 1) - (b.date ? 0 : 1);
    return direction * (new Date(a.date).getTime() - new Date(b.date).getTime());
  });
}

export async function getEventsGroupedByStatus(): Promise<Record<EventStatus, Event[]>> {
  const events = await getAllEvents();
  const group = (status: EventStatus) =>
    sortByDate(
      events.filter((event) => event.status === status),
      status,
    );
  return { Running: group("Running"), Upcoming: group("Upcoming"), Finished: group("Finished") };
}

// The event the admin picked for the home page, if any.
export async function getFeaturedEvent(): Promise<Event | null> {
  const featuredId = await getFeaturedEventId();
  return featuredId ? getEventById(featuredId) : null;
}
