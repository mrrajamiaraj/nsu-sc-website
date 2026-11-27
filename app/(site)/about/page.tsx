import type { Metadata } from "next";
import { OpeningWhistle } from "@/components/about/long-game/OpeningWhistle";
import { Scoreboard } from "@/components/about/long-game/Scoreboard";
import { Seasons } from "@/components/about/long-game/Seasons";
import { StandFor } from "@/components/about/long-game/StandFor";
import { ThePanel } from "@/components/about/long-game/ThePanel";
import { KitWall } from "@/components/about/long-game/KitWall";
import { YourTurn } from "@/components/about/long-game/YourTurn";
import { ContactStage } from "@/components/contact/interaction/ContactStage";
import { Reveal } from "@/components/contact/interaction/Pointer";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { getTeams } from "@/lib/data/teams";
import { getSponsors } from "@/lib/data/sponsors";
import { getRegistrationSettings } from "@/lib/data/registration";
import { getAllEvents } from "@/lib/data/events";
import { getAchievements } from "@/lib/data/achievements";
import { getActivePanel, getPanelMembers } from "@/lib/data/members";
import { getSiteContentImages } from "@/lib/data/site-content";
import { clubRegistration } from "@/lib/registration";
import { FOUNDED } from "@/lib/gazette";
import { DEFAULT_JOIN_PHOTO } from "@/lib/home";
import { heroTiles, milestones, panelPeople, partnerRows, scoreboard, statementPhotos } from "@/lib/about";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "NSU Games and Sports Club is North South University's student-run sports club: its seasons, its people and the partners behind it.",
};

// "The long game": the club's story told from its own records (squads, panel, events,
// achievements, partners). Every number on the page is counted on the server.
export default async function AboutPage() {
  const [teams, sponsors, registration, events, achievements, panel, joinImages] = await Promise.all([
    getTeams(),
    getSponsors(),
    getRegistrationSettings(),
    getAllEvents(),
    getAchievements(),
    getActivePanel(),
    getSiteContentImages("home_join_image"),
  ]);
  const members = panel ? await getPanelMembers(panel.id) : [];
  const year = Number(new Date().toLocaleDateString("en-CA", { year: "numeric", timeZone: "Asia/Dhaka" }));
  const partners = partnerRows(sponsors);
  const people = panelPeople(members);

  return (
    <HomeMotionConfig>
      <div className="-mt-28 bg-[#0b2524] pt-28 [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactStage pitch={false}>
          <OpeningWhistle tiles={heroTiles(teams, events)} founded={FOUNDED} />
          <Scoreboard stats={scoreboard(teams, members, events, year, panel?.name ?? null)} />
          <Seasons stops={milestones(events, achievements)} founded={FOUNDED} year={year} />
          <Reveal>
            <StandFor photos={statementPhotos(events)} />
          </Reveal>
          {people.length > 0 && (
            <Reveal>
              <ThePanel people={people} panelName={panel?.name ?? "Panel"} />
            </Reveal>
          )}
          <Reveal>
            <KitWall corporate={partners.corporate} media={partners.media} eventCount={events.length} />
          </Reveal>
          <YourTurn photo={joinImages[0] ?? DEFAULT_JOIN_PHOTO} club={clubRegistration(registration)} />
        </ContactStage>
      </div>
    </HomeMotionConfig>
  );
}
