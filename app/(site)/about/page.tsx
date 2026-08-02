import type { Metadata } from "next";
import DOMPurify from "isomorphic-dompurify";
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

export const metadata: Metadata = {
  title: "About Us",
};

const DEFAULT_STORY_HIGHLIGHTS = [
  "Premier sports club in Bangladesh",
  "State-of-the-art training facilities",
  "Professional coaching staff",
  "Active participation in national tournaments",
];
const DEFAULT_MISSION_POINTS = [
  "Promote holistic student development",
  "Foster sportsmanship and fair play",
  "Build a winning athletic tradition",
];
const DEFAULT_VISION_POINTS = [
  "Lead sports innovation in Bangladesh",
  "Produce national-level athletes",
  "Create lasting impact in the community",
];
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
        subtitle={
          heroSubtitle ??
          "Empowering students through sports excellence, teamwork, and competitive spirit since 1992."
        }
      />
      <OurStory
        history={history ? DOMPurify.sanitize(history) : null}
        heading={storyHeading ?? "Building Champions On & Off the Field"}
        highlights={storyHighlights}
      />
      <AboutStats
        sportsOffered={teams.length}
        established={statEstablished ?? "1992"}
        members={statMembers ?? "500+"}
        championships={statChampionships ?? "8+"}
      />
      <MissionVision
        missionText={
          missionText ??
          "To cultivate a vibrant sports culture at NSU that promotes physical fitness, mental well-being, and competitive excellence."
        }
        missionPoints={missionPoints}
        visionText={
          visionText ??
          "To be recognized as the leading university sports club in Bangladesh, setting benchmarks for athletic excellence."
        }
        visionPoints={visionPoints}
      />
      <CoreValues values={coreValues} />
      <ImageGallery images={galleryImages} />
      <Sponsors sponsors={sponsors} />
      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
