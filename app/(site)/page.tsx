import { Hero } from "@/components/home/Hero";
import { LiveStrip, type LiveStripData } from "@/components/home/LiveStrip";
import { QuickStats } from "@/components/home/QuickStats";
import { SquadsCarousel } from "@/components/home/SquadsCarousel";
import { LatestResult } from "@/components/home/LatestResult";
import { HomeBlog } from "@/components/home/HomeBlog";
import { WallOfFame } from "@/components/home/WallOfFame";
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

// The headline already says "One club. Every sport.", so the admin tagline
// ("One club, every sport — compete, connect, and represent NSU.") supplies only what follows it.
function sublineFrom(tagline: string | null): string {
  const rest = (tagline ?? "").replace(/^\s*one club,?\s*every sport\.?\s*[—–-]?\s*/i, "").trim();
  const text = rest || "Compete, connect, and represent NSU.";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

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
  const champions = eventResults(latest)
    .map((row) => (row.category ? `${row.category}: ${row.places.winners.join(", ")}` : row.places.winners.join(", ")))
    .filter((line) => !line.endsWith(": "));
  return { kind: "result", id: latest.id, name: latest.name, dateLabel: formatEventDate(latest), champions };
}

export default async function Home() {
  const [tagline, heroImages, joinImages, stats, featured, grouped, recentPosts, registration, teams, playersByTeam, achievements] =
    await Promise.all([
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

  return (
    <HomeMotionConfig>
      <div className="[font-family:var(--font-home),system-ui,sans-serif]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Hero subline={sublineFrom(tagline)} photo={heroImages[0] ?? DEFAULT_HERO_PHOTO} club={club} />
        {strip && <LiveStrip data={strip} />}
        <QuickStats stats={stats} />
        <SquadsCarousel sports={sportCards(teams, playersByTeam)} squadCount={teams.length} />
        {latest && <LatestResult event={latest} />}
        {recentPosts.length > 0 && <HomeBlog posts={recentPosts} />}
        <WallOfFame items={wallOfFame(achievements)} />
        <JoinBand club={club} photo={joinImages[0] ?? DEFAULT_JOIN_PHOTO} />
      </div>
    </HomeMotionConfig>
  );
}
