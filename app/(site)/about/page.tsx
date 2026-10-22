import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { OurStory } from "@/components/about/OurStory";
import { AboutStats } from "@/components/about/AboutStats";
import { MissionVision } from "@/components/about/MissionVision";
import { CoreValues, type CoreValueContent } from "@/components/about/CoreValues";
import { Sponsors } from "@/components/about/Sponsors";
import { ImageGallery } from "@/components/about/ImageGallery";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { getTeams } from "@/lib/data/teams";
import { getSponsors } from "@/lib/data/sponsors";
import { getRegistrationSettings } from "@/lib/data/registration";
import { getSiteContent, getSiteContentImages, getSiteContentJson } from "@/lib/data/site-content";
import { sanitizeHtml } from "@/lib/sanitize";

export const metadata: Metadata = {
  title: "About Us",
};

// Fallbacks apply only when the admin field is empty. They make no claims about
// the club; empty highlight/point lists simply aren't rendered.
const DEFAULT_STORY_HIGHLIGHTS: string[] = [];
const DEFAULT_MISSION_POINTS: string[] = [];
const DEFAULT_VISION_POINTS: string[] = [];
const DEFAULT_CORE_VALUES: CoreValueContent[] = [
  { title: "Passion", description: "We fuel athletic excellence through dedication and love for sports." },
  { title: "Teamwork", description: "Together we achieve more, building bonds that last a lifetime." },
  { title: "Excellence", description: "We strive for the highest standards in every game we play." },
  { title: "Innovation", description: "Embracing new training methods and sports technologies." },
];

export default async function AboutPage() {
  const [
    teams,
    sponsors,
    registrationSettings,
    history,
    galleryImages,
    heroSubtitle,
    storyHeading,
    storyHighlights,
    statEstablished,
    statMembers,
    statChampionships,
    missionText,
    missionPoints,
    visionText,
    visionPoints,
    coreValues,
  ] = await Promise.all([
    getTeams(),
    getSponsors(),
    getRegistrationSettings(),
    getSiteContent("about_history"),
    getSiteContentImages("about_gallery"),
    getSiteContent("about_hero_subtitle"),
    getSiteContent("about_story_heading"),
    getSiteContentJson("about_story_highlights", DEFAULT_STORY_HIGHLIGHTS),
    getSiteContent("about_stat_established"),
    getSiteContent("about_stat_members"),
    getSiteContent("about_stat_championships"),
    getSiteContent("about_mission_text"),
    getSiteContentJson("about_mission_points", DEFAULT_MISSION_POINTS),
    getSiteContent("about_vision_text"),
    getSiteContentJson("about_vision_points", DEFAULT_VISION_POINTS),
    getSiteContentJson("about_core_values", DEFAULT_CORE_VALUES),
  ]);

  return (
    <>
      <AboutHero
        subtitle={heroSubtitle ?? "The games and sports club of North South University, run by students for students."}
      />
      <OurStory
        history={history ? sanitizeHtml(history) : null}
        heading={storyHeading ?? "Sport at North South University"}
        highlights={storyHighlights.filter(Boolean)}
      />
      <AboutStats
        squads={teams.length}
        founded={statEstablished}
        members={statMembers}
        championships={statChampionships}
      />
      <MissionVision
        missionText={
          missionText ?? "To give every NSU student a place to play, compete and grow through sport."
        }
        missionPoints={missionPoints.filter(Boolean)}
        visionText={visionText ?? "A campus where sport is part of every student's university life."}
        visionPoints={visionPoints.filter(Boolean)}
      />
      <CoreValues values={coreValues} />
      <ImageGallery images={galleryImages} />
      <Sponsors sponsors={sponsors} />
      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
