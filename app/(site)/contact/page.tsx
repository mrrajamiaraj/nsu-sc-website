import type { Metadata } from "next";
import Link from "next/link";
import { ContactHeader } from "@/components/contact/ContactHeader";
import { ContactPanel } from "@/components/contact/ContactPanel";
import { Faq, type FaqItem } from "@/components/contact/extras/Faq";
import { FollowClub } from "@/components/contact/extras/FollowClub";
import { PartnerBand } from "@/components/contact/extras/PartnerBand";
import { TrialsStrip } from "@/components/contact/extras/TrialsStrip";
import { VisitUs, type VisitPhoto } from "@/components/contact/extras/VisitUs";
import { InPageNav, type NavSection } from "@/components/contact/InPageNav";
import { WhoToContact } from "@/components/contact/PanelPeople";
import { TopicShortcuts } from "@/components/contact/TopicShortcuts";
import { Reveal } from "@/components/contact/interaction/Pointer";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { getTeams } from "@/lib/data/teams";
import { getSiteContent, getSiteContentImages } from "@/lib/data/site-content";
import { DEFAULT_JOIN_PHOTO } from "@/lib/home";
import { getSponsors } from "@/lib/data/sponsors";
import { getAllEvents } from "@/lib/data/events";
import { partnerRows } from "@/lib/about";
import { getActivePanel, getPanelMembers } from "@/lib/data/members";
import { getCutoutFrames } from "@/lib/data/cutouts";
import { contactLeads, contactPeople, panelPeople } from "@/lib/contact-panel";
import { getRegistrationSettings } from "@/lib/data/registration";
import { clubRegistration, type ClubRegistration } from "@/lib/registration";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/constants";
import { parseContactTopic } from "@/lib/contact";
import { CONTACT_EXTRAS, REPLY_TIME } from "@/lib/contact-extras";
import { formatDate } from "@/lib/format";
import type { Event, Team } from "@/lib/types";

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

// Only questions with a real answer. A question whose answer isn't confirmed yet (experience,
// the fee, booking the courts) doesn't appear until it is set in lib/contact-extras.ts.
function faqItems(club: ClubRegistration, teams: Team[], email: string): FaqItem[] {
  const { women, all } = womensSquads(teams);
  const items: (FaqItem | null)[] = [
    {
      slug: "join",
      question: "How do I join the club?",
      keywords: "sign up register membership",
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
      keywords: "trial try out selection date",
      answer: (
        <p>
          {CONTACT_EXTRAS.trialsDate ? <>The next open trials are on {formatDate(CONTACT_EXTRAS.trialsDate)}. </> : <>Trial dates are announced on the club&rsquo;s Facebook. </>}
          After you sign up, the panel contacts you about trials for your sport. To ask about one squad, choose Squads &amp; trials in the form above.
        </p>
      ),
    },
    CONTACT_EXTRAS.experienceNeeded
      ? { slug: "experience", question: "Do I need experience?", keywords: "beginner new level", answer: <p>{CONTACT_EXTRAS.experienceNeeded}</p> }
      : null,
    women.length
      ? {
          slug: "women",
          question: "Can female students join every squad?",
          keywords: "women girls female squads",
          answer: <p>{all ? <>Every sport the club plays has a women&rsquo;s squad: {list(women)}.</> : <>The club has women&rsquo;s squads in {list(women)}.</>}</p>,
        }
      : null,
    CONTACT_EXTRAS.membershipFee
      ? { slug: "fees", question: "Is there a membership fee?", keywords: "fee cost price money", answer: <p>{CONTACT_EXTRAS.membershipFee}</p> }
      : null,
    {
      slug: "friendlies",
      question: "Can non-NSU teams invite or challenge us?",
      keywords: "friendly match invitation tournament challenge",
      answer: <p>Send the invitation through the form above with Events &amp; registration as the topic, and include the date, venue and format. The panel replies within {REPLY_TIME}.</p>,
    },
    CONTACT_EXTRAS.courtBooking
      ? { slug: "booking", question: "How do I book the sports complex or courts?", keywords: "book venue court sports complex", answer: <p>{CONTACT_EXTRAS.courtBooking}</p> }
      : null,
    {
      slug: "sponsor",
      question: "How can my company sponsor an event?",
      keywords: "sponsorship partner company brand",
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
    {
      slug: "photos",
      question: "I took photos at an event, how do I share them?",
      keywords: "photos pictures media share album",
      answer: (
        <p>
          Email them to <a href={`mailto:${email}`}>{email}</a> with the event&rsquo;s name in the subject, or send a link to the album through the form above.
        </p>
      ),
    },
  ];
  return items.filter((item): item is FaqItem => item !== null);
}

// Visit us: the club's own photos (the homepage join photo, then the event photos the About
// page uses), never an event poster.
const VISIT_EVENTS = ["NSUSC Sports Carnival Season 02", "Abir Memorial Football Tournament 2025", "Bangabandhu Inter University Sports Championship '22"];
function visitPhotos(events: Event[], joinPhoto: string): VisitPhoto[] {
  const fromEvents = VISIT_EVENTS.flatMap((name) => {
    const e = events.find((ev) => ev.name === name);
    const src = e?.gallery[0];
    return src ? [{ src, caption: e.galleryCaptions[src] || e.name }] : [];
  });
  return [{ src: joinPhoto, caption: "NSU Games & Sports Club at North South University" }, ...fromEvents];
}

type Search = { topic?: string | string[]; squad?: string | string[]; to?: string | string[] };

// "Get your question to the panel": header, direct line + map beside the form, who to
// contact, a short FAQ, and a follow / visit band. Real data only; nothing unconfirmed shows.
// Every section is back, in one rhythm: hero, an in-page nav, topic shortcuts and the form,
// who to contact, visit, trials, FAQ, partners and follow. Real data only: a row or section
// whose details aren't confirmed uses its real fallback line or stays hidden.
export default async function ContactPage({ searchParams }: { searchParams: Search }) {
  const [teams, address, phone, emailSetting, hours, registration, panel, sponsors, events, joinImages] = await Promise.all([
    getTeams(),
    getSiteContent("contact_address"),
    getSiteContent("contact_phone"),
    getSiteContent("contact_email"),
    getSiteContent("contact_hours"),
    getRegistrationSettings(),
    getActivePanel(),
    getSponsors(),
    getAllEvents(),
    getSiteContentImages("home_join_image"),
  ]);
  const email = emailSetting ?? DEFAULT_CONTACT_EMAIL;
  // The panel (names and photos only) for the header faces and Who to contact.
  const members = panel ? await getPanelMembers(panel.id) : [];
  const listed = [...members.filter((m) => m.tier === "Executive"), ...contactLeads(members)];
  const frames = await getCutoutFrames(listed.map((m) => m.photo).filter(Boolean) as string[]);
  const faces = panelPeople(members, frames);
  const people = contactPeople(members, frames);
  const club = clubRegistration(registration);
  const partners = partnerRows(sponsors);
  const logos = [...partners.corporate, ...partners.media];
  const socials = CONTACT_EXTRAS.socials.filter((s) => s.url);
  const matchdayLine = CONTACT_EXTRAS.matchdayPhone
    ? `Matchday or urgent issue? Call ${CONTACT_EXTRAS.matchdayPhone} on event days.`
    : socials.some((s) => s.label === "Facebook")
      ? "Matchday or urgent issue? Message us on Facebook on event days."
      : null;
  const squad = typeof searchParams.squad === "string" && teams.some((team) => team.name === searchParams.squad) ? searchParams.squad : "";
  // "Message <name>" links from the Members page: /contact?to=Sayedul
  const to = typeof searchParams.to === "string" ? searchParams.to.replace(/[^A-Za-zÀ-ɏঀ-৿\s.'-]/g, "").trim().slice(0, 40) : "";

  const nav: NavSection[] = [
    { id: "message", label: "Message" },
    ...(people.length ? [{ id: "who", label: "Who to contact" }] : []),
    { id: "visit", label: "Visit" },
    { id: "trials", label: "Trials" },
    { id: "faq", label: "FAQ" },
    { id: "partner", label: "Partner" },
    ...(socials.length ? [{ id: "follow", label: "Follow" }] : []),
  ];
  // One rhythm: 96px between sections with a hairline halfway.
  const section = "scroll-mt-[136px] border-t border-white/10 py-12";
  const container = "mx-auto w-full max-w-[1200px] px-6 lg:px-8";

  return (
    <HomeMotionConfig>
      {/* Same deep teal and Inter body as the homepage; the page runs up under the clear navbar. */}
      <div className="contact-page -mt-28 bg-[#0b2524] pt-28 [font-family:var(--font-home),system-ui,sans-serif]">
        <div className={container}>
          <ContactHeader people={faces} />
        </div>
        <InPageNav sections={nav} />
        <div className={`${container} overflow-x-clip`}>
          <section id="message" aria-label="Send a message" className="scroll-mt-[136px] pb-12 pt-8">
            <TopicShortcuts />
            <div className="mt-12">
              <ContactPanel
                teams={teams}
                email={email}
                phone={phone ?? "+880 2-55668200"}
                hours={hours ?? "7:30 AM – 10:00 PM"}
                address={address ?? "Bashundhara, Dhaka 1229, Bangladesh"}
                initialTopic={parseContactTopic(searchParams.topic)}
                initialSquad={squad}
                initialGreeting={to ? `Hi ${to}, ` : ""}
              />
            </div>
          </section>
          {people.length > 0 && (
            <section id="who" aria-labelledby="who-heading" className={section}>
              <Reveal>
                <WhoToContact people={people} />
              </Reveal>
            </section>
          )}
          <section id="visit" aria-labelledby="visit-heading" className={section}>
            <Reveal>
              <VisitUs photos={visitPhotos(events, joinImages[0] ?? DEFAULT_JOIN_PHOTO)} />
            </Reveal>
          </section>
          <section id="trials" aria-labelledby="trials-heading" className={section}>
            <Reveal>
              <TrialsStrip club={club} />
            </Reveal>
          </section>
          <section id="faq" aria-labelledby="faq-heading" className={section}>
            <Reveal>
              <Faq items={faqItems(club, teams, email)} />
            </Reveal>
          </section>
        </div>
        <section id="partner" aria-labelledby="partner-heading" className="scroll-mt-[136px] overflow-x-clip">
          <PartnerBand partners={logos} eventCount={events.length} />
        </section>
        {socials.length > 0 ? (
          <div className={container}>
            <section id="follow" aria-labelledby="follow-heading" className="scroll-mt-[136px] py-12">
              <FollowClub accounts={socials} matchdayLine={matchdayLine} />
            </section>
          </div>
        ) : (
          <div className="pb-4" />
        )}
      </div>
    </HomeMotionConfig>
  );
}
