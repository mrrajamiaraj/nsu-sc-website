import { Hero } from "@/components/home/Hero";
import { QuickStats } from "@/components/home/QuickStats";
import { FeaturedEvent } from "@/components/home/FeaturedEvent";
import { HomeBlog } from "@/components/home/HomeBlog";
import { JoinBand } from "@/components/home/JoinBand";
import { getQuickStats } from "@/lib/data/stats";
import { getEventsGroupedByStatus, getFeaturedEvent } from "@/lib/data/events";
import { getSiteContent } from "@/lib/data/site-content";
import { getBlogPosts } from "@/lib/data/blog";
import { getRegistrationSettings } from "@/lib/data/registration";
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

// The admin-picked event wins; otherwise whatever is live, then the next one
// coming up, then the most recent result (preferring one with a photo).
async function pickFeaturedEvent(): Promise<Event | null> {
  const featured = await getFeaturedEvent();
  if (featured) return featured;
  const { Running, Upcoming, Finished } = await getEventsGroupedByStatus();
  return Running[0] ?? Upcoming[0] ?? Finished.find((event) => event.bannerImage) ?? Finished[0] ?? null;
}

export default async function Home() {
  const [tagline, orgName, videoUrl, stats, featuredEvent, recentPosts, registration] = await Promise.all([
    getSiteContent("home_tagline"),
    getSiteContent("home_badge"),
    getSiteContent("home_video_url"),
    getQuickStats(),
    pickFeaturedEvent(),
    getBlogPosts(3),
    getRegistrationSettings(),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero
        tagline={tagline ?? "One club, every sport."}
        orgName={orgName ?? "North South University"}
        videoSrc={videoUrl || null}
        registration={registration}
      />
      <QuickStats stats={stats} />
      {featuredEvent && <FeaturedEvent event={featuredEvent} />}
      {recentPosts.length > 0 && <HomeBlog posts={recentPosts} />}
      <JoinBand registration={registration} />
    </>
  );
}
