import type { Metadata } from "next";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactSidebar } from "@/components/contact/ContactSidebar";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { Reveal } from "@/components/motion/Reveal";
import { getTeams } from "@/lib/data/teams";
import { getRegistrationSettings } from "@/lib/data/registration";
import { getSiteContent } from "@/lib/data/site-content";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const [teams, registrationSettings, address, phone, email, hours] = await Promise.all([
    getTeams(),
    getRegistrationSettings(),
    getSiteContent("contact_address"),
    getSiteContent("contact_phone"),
    getSiteContent("contact_email"),
    getSiteContent("contact_hours"),
  ]);

  return (
    <>
      <ContactHero />

      <div className="px-4 pb-20">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <ContactForm teams={teams} />
          </Reveal>
          <ContactSidebar
            address={address ?? "Bashundhara, Dhaka 1229, Bangladesh"}
            phone={phone ?? "+880 2-55668200"}
            email={email ?? "sports@northsouth.edu"}
            hours={hours ?? "7:30 AM - 10:00 PM"}
          />
        </div>
      </div>

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
