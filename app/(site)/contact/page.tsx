import type { Metadata } from "next";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactSidebar } from "@/components/contact/ContactSidebar";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { Reveal } from "@/components/motion/Reveal";
import { getTeams } from "@/lib/data/teams";
import { getRegistrationSettings } from "@/lib/data/registration";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const [teams, registrationSettings] = await Promise.all([getTeams(), getRegistrationSettings()]);

  return (
    <>
      <ContactHero />

      <div className="px-4 pb-20">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <ContactForm teams={teams} />
          </Reveal>
          <ContactSidebar />
        </div>
      </div>

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
