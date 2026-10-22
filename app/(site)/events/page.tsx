import type { Metadata } from "next";
import { EventArchive } from "@/components/events/EventArchive";
import { RegistrationCarousel } from "@/components/events/RegistrationCarousel";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { getAllEvents, getAllSeries } from "@/lib/data/events";
import { getRegistrationSettings } from "@/lib/data/registration";
import { compareForCarousel, groupEvents, todayInDhaka } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events",
  description: "Fixtures and results from NSU Games and Sports Club — registration for upcoming events and the full event archive.",
};

export default async function EventsPage({ searchParams }: { searchParams: { q?: string } }) {
  const [events, series, registrationSettings] = await Promise.all([
    getAllEvents(),
    getAllSeries(),
    getRegistrationSettings(),
  ]);
  const groups = groupEvents(events, series);
  const groupBySeason = new Map(groups.flatMap((group) => group.seasons.map((season) => [season.id, group] as const)));

  const carouselItems = events
    .filter((event) => event.status !== "Finished")
    .sort(compareForCarousel)
    .map((event) => {
      const group = groupBySeason.get(event.id)!;
      return { event, abbreviation: group.abbreviation, name: group.name };
    });

  return (
    <>
      <div className="px-4 pb-10 pt-4 text-center">
        <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
          Fixtures <span className="text-gradient-brand">&amp; results</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Register for what&rsquo;s coming up, and browse every tournament NSU SC has run or played in.
        </p>
      </div>

      <RegistrationCarousel items={carouselItems} today={todayInDhaka()} />
      <EventArchive key={searchParams.q ?? ""} groups={groups} initialQuery={searchParams.q ?? ""} />

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
