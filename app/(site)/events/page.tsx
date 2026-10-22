import type { Metadata } from "next";
import { EventsFilterView } from "@/components/events/EventsFilterView";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { getEventsByStatus } from "@/lib/data/events";
import { getRegistrationSettings } from "@/lib/data/registration";
import type { Event, EventStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Events",
};

export default async function EventsPage() {
  const [running, upcoming, finished, registrationSettings] = await Promise.all([
    getEventsByStatus("Running"),
    getEventsByStatus("Upcoming"),
    getEventsByStatus("Finished"),
    getRegistrationSettings(),
  ]);
  const eventsByStatus: Record<EventStatus, Event[]> = { Running: running, Upcoming: upcoming, Finished: finished };

  return (
    <>
      <div className="px-4 pb-10 pt-4 text-center">
        <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
          Fixtures <span className="text-gradient-brand">&amp; results</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Tournaments NSU SC is running or playing in, what&rsquo;s coming up next, and how past events finished.
        </p>
      </div>

      <EventsFilterView eventsByStatus={eventsByStatus} />

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
