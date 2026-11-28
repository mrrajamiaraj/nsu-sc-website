import type { Metadata } from "next";
import { Archive, type ArchiveState } from "@/components/events/hub/Archive";
import { NowBoard } from "@/components/events/hub/NowBoard";
import { HostCta, PlayCta, Records } from "@/components/events/hub/Records";
import { SeasonStrip } from "@/components/events/hub/SeasonStrip";
import { ContactStage } from "@/components/contact/interaction/ContactStage";
import { Reveal } from "@/components/contact/interaction/Pointer";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { getAllEvents } from "@/lib/data/events";
import { getRegistrationSettings } from "@/lib/data/registration";
import { getSiteContent } from "@/lib/data/site-content";
import { getSponsors } from "@/lib/data/sponsors";
import { getTeams } from "@/lib/data/teams";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/constants";
import { todayInDhaka } from "@/lib/events";
import { SPORTS, TYPES, hubEvents, records, typicalYear, type SportKey, type TypeKey } from "@/lib/events-hub";
import { clubRegistration } from "@/lib/registration";
import { slugify, teamSport } from "@/lib/squads";

// Rendered per request: the status of every event is worked out from today's date.
export const dynamic = "force-dynamic";

const DESCRIPTION = "What's on, how to register, and results and photos from every tournament NSU Games & Sports Club has run.";
export const metadata: Metadata = {
  title: "Events",
  description: DESCRIPTION,
  alternates: { canonical: "/events" },
  openGraph: { title: "Events | NSU Games & Sports Club", description: DESCRIPTION, url: "/events" },
};

type Search = Record<"sport" | "type" | "q" | "sort" | "view", string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

// "Matchday central": the Now board (live, upcoming or off-season, from the dates), the
// season strip, the archive of every tournament, records and the two calls to action.
export default async function EventsPage({ searchParams }: { searchParams: Search }) {
  const [raw, registration, email, sponsors, teams] = await Promise.all([getAllEvents(), getRegistrationSettings(), getSiteContent("contact_email"), getSponsors(), getTeams()]);
  const today = todayInDhaka();
  const events = hubEvents(raw, today);
  const typical = typicalYear(events);
  const club = clubRegistration(registration);

  const sport = one(searchParams.sport);
  const type = one(searchParams.type);
  const sort = one(searchParams.sort);
  const initial: ArchiveState = {
    sport: SPORTS.some((s) => s.key === sport) ? (sport as SportKey) : "",
    type: TYPES.some((t) => t.key === type) ? (type as TypeKey) : "",
    q: one(searchParams.q).slice(0, 60),
    sort: sort === "oldest" || sort === "az" ? sort : "newest",
    view: one(searchParams.view) === "list" ? "list" : "grid",
  };
  const partners = sponsors.filter((s) => s.category === "Corporate" && s.logo).slice(0, 8).map((s) => ({ name: s.name, logo: s.logo! }));
  const squadSports = Array.from(new Map(teams.map((t) => [slugify(teamSport(t).sport), teamSport(t).sport])).entries()).map(([key, label]) => ({ key, label }));

  return (
    <HomeMotionConfig>
      <div className="-mt-28 overflow-x-clip bg-[#0b2524] pb-4 pt-28 [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactStage>
          <NowBoard events={events} typical={typical} today={today} email={email ?? DEFAULT_CONTACT_EMAIL} />
          <SeasonStrip events={events} typical={typical} today={today} />
          <Archive events={events} initial={initial} />
          <Reveal>
            <Records rec={records(events)} />
          </Reveal>
          <HostCta partners={partners} />
          <PlayCta sports={squadSports} club={club} />
        </ContactStage>
      </div>
    </HomeMotionConfig>
  );
}
