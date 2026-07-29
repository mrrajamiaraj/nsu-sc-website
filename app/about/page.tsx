import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { OurStory } from "@/components/about/OurStory";
import { AboutStats } from "@/components/about/AboutStats";
import { MissionVision } from "@/components/about/MissionVision";
import { CoreValues } from "@/components/about/CoreValues";
import { Sponsors } from "@/components/about/Sponsors";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { getTeams } from "@/lib/data/teams";
import { getSponsors } from "@/lib/data/sponsors";
import { getRegistrationSettings } from "@/lib/data/registration";

export const metadata: Metadata = {
  title: "About Us",
};

export default async function AboutPage() {
  const [teams, sponsors, registrationSettings] = await Promise.all([
    getTeams(),
    getSponsors(),
    getRegistrationSettings(),
  ]);

  return (
    <>
      <AboutHero />
      <OurStory />
      <AboutStats sportsOffered={teams.length} />
      <MissionVision />
      <CoreValues />
      <Sponsors sponsors={sponsors} />
      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
