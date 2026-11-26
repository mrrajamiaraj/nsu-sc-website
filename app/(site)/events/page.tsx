import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";
import { EventArchive } from "@/components/events/EventArchive";
import { RegistrationCarousel } from "@/components/events/RegistrationCarousel";
import { TrialsCTA } from "@/components/shared/ClosingCTA";
import { getAllEvents, getAllSeries } from "@/lib/data/events";
import { getRegistrationSettings } from "@/lib/data/registration";
import { compareForCarousel, groupEvents, todayInDhaka } from "@/lib/events";

// Rendered per request, as before: the archive reads its filters from the URL, and
// moving this page to static caching would change how admin edits reach it.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description: "Fixtures and results from NSU Games and Sports Club — registration for upcoming events and the full event archive.",
};

export default async function EventsPage() {
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
          {carouselItems.length > 0
            ? "Register for what’s coming up, and browse every tournament NSU SC has run or played in."
            : "Results and photos from every tournament NSU SC has run or played in."}
        </p>
      </div>

      {carouselItems.length > 0 ? (
        <RegistrationCarousel items={carouselItems} today={todayInDhaka()} />
      ) : (
        // Said plainly, so a student looking for the next fixture isn't left guessing.
        <div className="px-4 pb-10">
          <p className="glass-panel mx-auto flex max-w-6xl items-center gap-3 px-5 py-4 text-sm text-slate-300">
            <CalendarClock aria-hidden className="h-5 w-5 shrink-0 text-blue-400" />
            <span>
              No upcoming events are scheduled right now. New fixtures will appear here when the panel announces them.
            </span>
          </p>
        </div>
      )}
      <EventArchive groups={groups} />

      <TrialsCTA
        registration={registrationSettings}
        title="Want to play in the next one?"
        secondary={{ label: "Browse the squads", href: "/teams" }}
      />
    </>
  );
}
