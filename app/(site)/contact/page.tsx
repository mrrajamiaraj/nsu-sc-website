import type { Metadata } from "next";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactSidebar } from "@/components/contact/ContactSidebar";
import { Reveal } from "@/components/motion/Reveal";
import { getTeams } from "@/lib/data/teams";
import { getSiteContent } from "@/lib/data/site-content";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/constants";
import { parseContactTopic } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the NSU Games and Sports Club panel about squads, trials, events or partnerships.",
};

export default async function ContactPage({ searchParams }: { searchParams: { topic?: string | string[] } }) {
  const [teams, address, phone, email, hours] = await Promise.all([
    getTeams(),
    getSiteContent("contact_address"),
    getSiteContent("contact_phone"),
    getSiteContent("contact_email"),
    getSiteContent("contact_hours"),
  ]);

  const contactEmail = email ?? DEFAULT_CONTACT_EMAIL;

  return (
    <>
      <ContactHero />

      <div className="px-4 pb-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <ContactSidebar
              address={address ?? "Bashundhara, Dhaka 1229, Bangladesh"}
              phone={phone ?? "+880 2-55668200"}
              email={contactEmail}
              hours={hours ?? "7:30 AM - 10:00 PM"}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <ContactForm teams={teams} email={contactEmail} topic={parseContactTopic(searchParams.topic)} />
          </Reveal>
        </div>
      </div>
    </>
  );
}
