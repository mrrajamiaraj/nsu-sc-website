import { Hero } from "@/components/home/Hero";
import { LiveStrip, type LiveStripData } from "@/components/home/LiveStrip";
import { QuickStats } from "@/components/home/QuickStats";
import { SquadsCarousel } from "@/components/home/SquadsCarousel";
import { MatchdayBoard } from "@/components/home/matchday/MatchdayBoard";
import { Gazette } from "@/components/home/Gazette";
import { ChampionshipBanners } from "@/components/home/ChampionshipBanners";
import { JoinBand } from "@/components/home/JoinBand";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { getQuickStats } from "@/lib/data/stats";
import { getEventsGroupedByStatus, getFeaturedEvent } from "@/lib/data/events";
import { getPlayersGroupedByTeam, getTeams } from "@/lib/data/teams";
import { getAchievements } from "@/lib/data/achievements";
import { getSiteContent, getSiteContentImages } from "@/lib/data/site-content";
import { getBlogPosts } from "@/lib/data/blog";
import { getRegistrationSettings } from "@/lib/data/registration";
import { clubRegistration } from "@/lib/registration";
import { eventResults, registrationState, todayInDhaka } from "@/lib/events";
import { formatEventDate } from "@/lib/format";
import { boardEvents } from "@/lib/matchday";
import { FOUNDED, leadParagraph, scoreLines } from "@/lib/gazette";
import { honourBanners } from "@/lib/honours";
import { DEFAULT_HERO_PHOTO, DEFAULT_JOIN_PHOTO, sportCards, wallOfFame } from "@/lib/home";
import { SITE_URL } from "@/lib/constants";
import type { Event } from "@/lib/types";

// schema.org data so search engines can show the club's name and logo.
const SITE_NAME = "NSU Games and Sports Club";
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: SITE_NAME,
      alternateName: "NSU SC",
      url: `${SITE_URL}/`,
    },
    {
      "@type": "SportsOrganization",
      name: SITE_NAME,
      alternateName: "NSU SC",
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icon.png`,
    },
  ],
};

// Hero text comes from the admin's Home settings; these are the club's own words if a field is empty.
const HERO_EYEBROW = "North South University";
const HERO_TAGLINE = "One club, every sport — compete, connect, and represent NSU.";

// Live strip: the admin-featured or next live/upcoming event, otherwise the latest result.
function stripData(next: Event | null, latest: Event | null): LiveStripData | null {
  if (next) {
    const open = registrationState(next, todayInDhaka()) === "open";
    return {
      kind: "next",
      id: next.id,
      name: next.name,
      date: next.date && !next.yearOnly ? next.date : null,
      dateLabel: formatEventDate(next, { withRange: true }),
      venue: next.venue,
      live: next.status === "Running",
      registerUrl: open ? next.registrationUrl : null,
    };
  }
  if (!latest) return null;
  const winners = eventResults(latest)
    .map((row) => ({ category: row.category, names: row.places.winners.join(", ") }))
    .filter((row) => row.names);
  // A winners-with-the-trophy shot when a caption says so, else the first gallery photo, else the poster.
  const trophyShot = latest.gallery.find((url) => /trophy|champion|winner/i.test(latest.galleryCaptions[url] ?? ""));
  const photo = trophyShot ?? latest.gallery[0] ?? latest.bannerImage;
  return { kind: "result", id: latest.id, name: latest.name, dateLabel: formatEventDate(latest), venue: latest.venue, photo, winners };
}

export default async function Home() {
  const [eyebrow, tagline, heroImages, joinImages, stats, featured, grouped, recentPosts, registration, teams, playersByTeam, achievements] =
    await Promise.all([
      getSiteContent("home_badge"),
      getSiteContent("home_tagline"),
      getSiteContentImages("home_hero_image"),
      getSiteContentImages("home_join_image"),
      getQuickStats(),
      getFeaturedEvent(),
      getEventsGroupedByStatus(),
      getBlogPosts(3),
      getRegistrationSettings(),
      getTeams(),
      getPlayersGroupedByTeam(),
      getAchievements(),
    ]);

  const club = clubRegistration(registration);
  const next = featured && featured.status !== "Finished" ? featured : grouped.Running[0] ?? grouped.Upcoming[0] ?? null;
  const latest =
    (featured?.status === "Finished" ? featured : null) ??
    grouped.Finished.find((event) => eventResults(event).length > 0) ??
    grouped.Finished[0] ??
    null;
  const strip = stripData(next, latest);
  const board = boardEvents(grouped, featured);
  const now = new Date();
  const stories = recentPosts.map((post, index) => ({ ...post, opening: index === 0 ? leadParagraph(post.content) : null }));

  return (
    <HomeMotionConfig>
      <div className="[font-family:var(--font-home),system-ui,sans-serif]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Hero
          eyebrow={eyebrow?.trim() || HERO_EYEBROW}
          tagline={tagline?.trim() || HERO_TAGLINE}
          photo={heroImages[0] ?? DEFAULT_HERO_PHOTO}
          club={club}
        />
        {strip && <LiveStrip data={strip} />}
        <QuickStats stats={stats} />
        <SquadsCarousel sports={sportCards(teams, playersByTeam)} squadCount={teams.length} />
        {board.events.length > 0 && <MatchdayBoard events={board.events} initial={board.initial} />}
        {stories.length > 0 && (
          <Gazette
            stories={stories}
            scores={scoreLines(grouped.Finished)}
            today={now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" })}
            volume={Number(now.toLocaleDateString("en-CA", { year: "numeric", timeZone: "Asia/Dhaka" })) - FOUNDED}
            blogHref="/blog"
            blogLabel={`${SITE_URL.replace(/^https?:\/\//, "")}/blog`}
          />
        )}
        {achievements.length > 0 && <ChampionshipBanners honours={honourBanners(wallOfFame(achievements))} />}
        <JoinBand club={club} photo={joinImages[0] ?? DEFAULT_JOIN_PHOTO} />
      </div>
    </HomeMotionConfig>
  );
}
