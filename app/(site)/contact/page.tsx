import type { Metadata } from "next";
import Link from "next/link";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactPanel } from "@/components/contact/ContactPanel";
import { LeadershipCallout } from "@/components/contact/LeadershipCallout";
import { WhoToContact } from "@/components/contact/extras/WhoToContact";
import { VisitUs } from "@/components/contact/extras/VisitUs";
import { TrialsStrip } from "@/components/contact/extras/TrialsStrip";
import { Faq, type FaqItem } from "@/components/contact/extras/Faq";
import { FollowClub } from "@/components/contact/extras/FollowClub";
import { PartnerBand } from "@/components/contact/extras/PartnerBand";
import { Ph } from "@/components/contact/extras/shared";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { getTeams } from "@/lib/data/teams";
import { getSiteContent } from "@/lib/data/site-content";
import { getRegistrationSettings } from "@/lib/data/registration";
import { getActivePanel, getPanelMembers } from "@/lib/data/members";
import { getSponsors } from "@/lib/data/sponsors";
import { getAllEvents } from "@/lib/data/events";
import { clubRegistration } from "@/lib/registration";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/constants";
import { parseContactTopic } from "@/lib/contact";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import { directoryRows } from "@/lib/contact-directory";
import type { Team } from "@/lib/types";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the NSU Games and Sports Club panel about squads, trials, events or partnerships.",
};

const CONTAINER = "mx-auto w-full max-w-[1280px] px-6 lg:px-8";

// Sports with a women's squad on the roster, e.g. "football, cricket and volleyball".
function womensSquads(teams: Team[]): string | null {
  const sports = teams.filter((team) => /\sFemale$/i.test(team.name)).map((team) => team.name.replace(/\s+Female$/i, "").toLowerCase());
  if (sports.length === 0) return null;
  return sports.length === 1 ? sports[0] : `${sports.slice(0, -1).join(", ")} and ${sports[sports.length - 1]}`;
}

// Answers say only what the site already knows; everything else is a marked placeholder.
function faqItems(joinUrl: string | null, teams: Team[]): FaqItem[] {
  const women = womensSquads(teams);
  return [
    {
      question: "How do I join the club?",
      answer: joinUrl ? (
        <p>
          Fill in the{" "}
          <a href={joinUrl} target="_blank" rel="noopener noreferrer">
            club sign-up form
          </a>{" "}
          while registration is open. <Ph>what happens after you sign up</Ph>
        </p>
      ) : (
        <p>
          Club sign-ups are closed right now. <Ph>when the next intake opens</Ph>
        </p>
      ),
    },
    {
      question: "When are the trials, and do I need experience?",
      answer: (
        <p>
          <Ph>trial dates and whether experience is needed</Ph> For a question about one squad, choose Squads &amp; trials in the form above.
        </p>
      ),
    },
    {
      question: "Can female students join every squad?",
      answer: (
        <p>
          {women ? <>The club has women&rsquo;s squads in {women}. </> : null}
          <Ph>whether women can join the other squads</Ph>
        </p>
      ),
    },
    {
      question: "Is there a membership fee?",
      answer: <p>{CONTACT_EXTRAS.membershipFee ?? <Ph>membership fee</Ph>}</p>,
    },
    {
      question: "Can non-NSU teams challenge us or invite us to tournaments?",
      answer: (
        <p>
          <Ph>whether the club takes friendlies and tournament invitations</Ph> Send the details through the form above and choose Events &amp;
          registration.
        </p>
      ),
    },
    {
      question: "How do I book the sports complex or courts?",
      answer: (
        <p>
          <Ph>how to book the sports complex or courts</Ph>
        </p>
      ),
    },
    {
      question: "How can my company sponsor an event?",
      answer: (
        <p>
          Choose Partnerships &amp; sponsorships in the form above
          {CONTACT_EXTRAS.sponsorDeckUrl ? (
            <>
              , or <a href={CONTACT_EXTRAS.sponsorDeckUrl}>download the sponsorship deck</a>
            </>
          ) : null}
          . You can see past partners on the <Link href="/about">About page</Link>.
        </p>
      ),
    },
    {
      question: "I took photos at an event, how do I share them with the club?",
      answer: (
        <p>
          <Ph>where to send event photos</Ph> Or message the panel with the form above.
        </p>
      ),
    },
  ];
}

export default async function ContactPage({ searchParams }: { searchParams: { topic?: string | string[] } }) {
  const [teams, address, phone, email, hours, registration, panel, sponsors, events] = await Promise.all([
    getTeams(),
    getSiteContent("contact_address"),
    getSiteContent("contact_phone"),
    getSiteContent("contact_email"),
    getSiteContent("contact_hours"),
    getRegistrationSettings(),
    getActivePanel(),
    getSponsors(),
    getAllEvents(),
  ]);
  const members = panel ? await getPanelMembers(panel.id) : [];
  // The club sign-up form while it's open, else nothing (the callout falls back to the panel page).
  const signupUrl = clubRegistration(registration).formUrl;
  const year = new Date().toLocaleDateString("en-CA", { year: "numeric", timeZone: "Asia/Dhaka" });
  const eventsThisYear = events.filter((event) => event.date?.startsWith(year)).length;
  const partners = sponsors.filter((sponsor) => sponsor.category === "Corporate" && sponsor.logo).slice(0, 5);

  return (
    <HomeMotionConfig>
      {/* Same deep teal and Inter body as the homepage; the page runs up under the clear navbar. */}
      <div className="-mt-28 bg-[#0b2524] pt-28 [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactHero />
        <ContactPanel
          teams={teams}
          email={email ?? DEFAULT_CONTACT_EMAIL}
          phone={phone ?? "+880 2-55668200"}
          hours={hours ?? "7:30 AM – 10:00 PM"}
          address={address ?? "Bashundhara, Dhaka 1229, Bangladesh"}
          initialTopic={parseContactTopic(searchParams.topic)}
        />

        {/* Extra sections. Desktop: who, visit, trials, FAQ, follow, partner.
            Phones: trials, FAQ, who, visit, partner, follow. */}
        <div className="mt-16 flex flex-col gap-16">
          <div className={`${CONTAINER} order-3 md:order-1`}>
            <WhoToContact rows={directoryRows(members, teams)} />
          </div>
          <div className={`${CONTAINER} order-4 md:order-2`}>
            <VisitUs />
          </div>
          <div className={`${CONTAINER} order-1 md:order-3`}>
            <TrialsStrip joinUrl={signupUrl} />
          </div>
          <div className={`${CONTAINER} order-2 md:order-4`}>
            <Faq items={faqItems(signupUrl, teams)} />
          </div>
          <div className={`${CONTAINER} order-6 md:order-5`}>
            <FollowClub />
          </div>
          <div className="order-5 md:order-6">
            <PartnerBand partners={partners} eventCount={eventsThisYear} year={year} />
          </div>
        </div>

        <LeadershipCallout href={signupUrl ?? "/members"} external={Boolean(signupUrl)} />
      </div>
    </HomeMotionConfig>
  );
}
