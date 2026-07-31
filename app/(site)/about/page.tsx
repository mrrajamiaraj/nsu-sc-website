import type { Metadata } from "next";
import DOMPurify from "isomorphic-dompurify";
import { AboutHero } from "@/components/about/AboutHero";
import { OurStory } from "@/components/about/OurStory";
import { AboutStats } from "@/components/about/AboutStats";
import { MissionVision } from "@/components/about/MissionVision";
import { CoreValues } from "@/components/about/CoreValues";
import { Sponsors } from "@/components/about/Sponsors";
import { ImageGallery } from "@/components/about/ImageGallery";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { getTeams } from "@/lib/data/teams";
import { getSponsors } from "@/lib/data/sponsors";
import { getRegistrationSettings } from "@/lib/data/registration";
import { getSiteContent, getSiteContentImages } from "@/lib/data/site-content";

export const metadata: Metadata = {
  title: "About Us",
};

export default async function AboutPage() {
  const [teams, sponsors, registrationSettings, history, galleryImages] = await Promise.all([
    getTeams(),
    getSponsors(),
    getRegistrationSettings(),
    getSiteContent("about_history"),
    getSiteContentImages("about_gallery"),
  ]);

  return (
    <>
      <AboutHero />
      <OurStory history={history ? DOMPurify.sanitize(history) : null} />
      <AboutStats sportsOffered={teams.length} />
      <MissionVision />
      <CoreValues />
      <ImageGallery images={galleryImages} />
      <Sponsors sponsors={sponsors} />
      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
