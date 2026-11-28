import type { Metadata } from "next";
import Link from "next/link";
import { ContactHeader } from "@/components/contact/ContactHeader";
import { ContactPanel } from "@/components/contact/ContactPanel";
import { Faq, type FaqItem } from "@/components/contact/extras/Faq";
import { FollowVisit } from "@/components/contact/FollowVisit";
import { WhoToContact } from "@/components/contact/PanelPeople";
import { Reveal } from "@/components/contact/interaction/Pointer";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { getTeams } from "@/lib/data/teams";
import { getSiteContent, getSiteContentImages } from "@/lib/data/site-content";
import { getActivePanel, getPanelMembers } from "@/lib/data/members";
import { getCutoutFrames } from "@/lib/data/cutouts";
import { panelPeople } from "@/lib/contact-panel";
import { DEFAULT_JOIN_PHOTO } from "@/lib/home";
import { getRegistrationSettings } from "@/lib/data/registration";
import { clubRegistration, type ClubRegistration } from "@/lib/registration";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/constants";
import { parseContactTopic } from "@/lib/contact";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import { formatDate } from "@/lib/format";
import type { Team } from "@/lib/types";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the NSU Games & Sports Club panel about squads, trials, events or partnerships.",
};

const list = (items: string[]) => (items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

// Women's squads on the roster, and whether every sport has one.
function womensSquads(teams: Team[]) {
  const sports = Array.from(new Set(teams.map((t) => t.name.replace(/\s+(Male|Female)$/i, "").trim())));
  const women = teams.filter((t) => /\sFemale$/i.test(t.name)).map((t) => t.name.replace(/\s+Female$/i, "").toLowerCase());
  return { women, all: women.length > 0 && women.length === sports.length };
}

// Only questions with a real answer. A question whose answer isn't confirmed yet (the fee,
// until it's set in lib/contact-extras.ts) doesn't appear at all.
function faqItems(club: ClubRegistration, teams: Team[]): FaqItem[] {
  const { women, all } = womensSquads(teams);
  const items: (FaqItem | null)[] = [
    {
      slug: "join",
      question: "How do I join the club?",
      answer: club.formUrl ? (
        <p>
          Fill in the{" "}
          <a href={club.formUrl} target="_blank" rel="noopener noreferrer">
            club sign-up form
          </a>{" "}
          while registration is open. The panel then contacts you about trials for your sport.
        </p>
      ) : (
        <p>{club.body}</p>
      ),
    },
    {
      slug: "trials",
      question: "When are the trials?",
      answer: (
        <p>
          {CONTACT_EXTRAS.trialsDate ? <>The next open trials are on {formatDate(CONTACT_EXTRAS.trialsDate)}. </> : null}
          After you sign up, the panel contacts you about trials for your sport. To ask about one squad, choose Squads &amp; trials in the form above.
        </p>
      ),
    },
    women.length
      ? {
          slug: "women",
          question: "Can female students join every squad?",
          answer: <p>{all ? <>Every sport the club plays has a women&rsquo;s squad: {list(women)}.</> : <>The club has women&rsquo;s squads in {list(women)}.</>}</p>,
        }
      : null,
    CONTACT_EXTRAS.membershipFee
      ? { slug: "fees", question: "Is there a membership fee?", answer: <p>{CONTACT_EXTRAS.membershipFee}</p> }
      : null,
    {
      slug: "sponsor",
      question: "How can my company sponsor an event?",
      answer: (
        <p>
          Choose Partnerships &amp; sponsorships in the form above
          {CONTACT_EXTRAS.sponsorDeckUrl ? (
            <>
              , or <a href={CONTACT_EXTRAS.sponsorDeckUrl}>download the sponsorship deck</a>
            </>
          ) : null}
          . You can see past partners on the <Link href="/about#partners">About page</Link>.
        </p>
      ),
    },
  ];
  return items.filter((item): item is FaqItem => item !== null).slice(0, 5);
}

type Search = { topic?: string | string[]; squad?: string | string[]; to?: string | string[] };

// "Get your question to the panel": header, direct line + map beside the form, who to
// contact, a short FAQ, and a follow / visit band. Real data only; nothing unconfirmed shows.
export default async function ContactPage({ searchParams }: { searchParams: Search }) {
  const [teams, address, phone, email, hours, registration, panel, joinImages] = await Promise.all([
    getTeams(),
    getSiteContent("contact_address"),
    getSiteContent("contact_phone"),
    getSiteContent("contact_email"),
    getSiteContent("contact_hours"),
    getRegistrationSettings(),
    getActivePanel(),
    getSiteContentImages("home_join_image"),
  ]);
  // The executive committee (names and photos only) for the header faces and Who to contact.
  const members = panel ? await getPanelMembers(panel.id) : [];
  const executives = members.filter((m) => m.tier === "Executive");
  const frames = await getCutoutFrames(executives.map((m) => m.photo).filter(Boolean) as string[]);
  const people = panelPeople(members, frames);
  const club = clubRegistration(registration);
  const squad = typeof searchParams.squad === "string" && teams.some((team) => team.name === searchParams.squad) ? searchParams.squad : "";
  // "Message <name>" links from the Members page: /contact?to=Sayedul
  const to = typeof searchParams.to === "string" ? searchParams.to.replace(/[^A-Za-z\u00C0-\u024F\u0980-\u09FF\s.'-]/g, "").trim().slice(0, 40) : "";

  return (
    <HomeMotionConfig>
      {/* Same deep teal and Inter body as the homepage; the page runs up under the clear navbar. */}
      <div className="contact-page -mt-28 overflow-x-clip bg-[#0b2524] pb-4 pt-28 [font-family:var(--font-home),system-ui,sans-serif]">
        <div className="mx-auto w-full max-w-[1200px] px-6 lg:px-8">
          <ContactHeader people={people} />
          <ContactPanel
            teams={teams}
            email={email ?? DEFAULT_CONTACT_EMAIL}
            phone={phone ?? "+880 2-55668200"}
            hours={hours ?? "7:30 AM – 10:00 PM"}
            address={address ?? "Bashundhara, Dhaka 1229, Bangladesh"}
            initialTopic={parseContactTopic(searchParams.topic)}
            initialSquad={squad}
            initialGreeting={to ? `Hi ${to}, ` : ""}
          />
          {people.length > 0 && (
            <Reveal className="mt-24">
              <WhoToContact people={people} />
            </Reveal>
          )}
          <Reveal className="mt-24">
            <Faq items={faqItems(club, teams)} />
          </Reveal>
        </div>
        <div className="mt-24">
          <FollowVisit photo={joinImages[0] ?? DEFAULT_JOIN_PHOTO} />
        </div>
      </div>
    </HomeMotionConfig>
  );
}
