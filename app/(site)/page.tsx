import { Hero } from "@/components/home/Hero";
import { QuickStats } from "@/components/home/QuickStats";
import { FeaturedEvent } from "@/components/home/FeaturedEvent";
import { HomeBlog } from "@/components/home/HomeBlog";
import { JoinBand } from "@/components/home/JoinBand";
import { getQuickStats } from "@/lib/data/stats";
import { getEventsByStatus, getFeaturedEvent } from "@/lib/data/events";
import { getSiteContent } from "@/lib/data/site-content";
import { getRecentBlogPosts } from "@/lib/data/blog";
import { getRegistrationSettings } from "@/lib/data/registration";
import type { Event } from "@/lib/types";

// The admin-picked event wins; otherwise whatever is live, then the next one
// coming up, then the most recent result (preferring one with a photo).
async function pickFeaturedEvent(): Promise<Event | null> {
  const featured = await getFeaturedEvent();
  if (featured) return featured;
  const [running, upcoming, finished] = await Promise.all([
    getEventsByStatus("Running"),
    getEventsByStatus("Upcoming"),
    getEventsByStatus("Finished"),
  ]);
  return running[0] ?? upcoming[0] ?? finished.find((event) => event.bannerImage) ?? finished[0] ?? null;
}

export default async function Home() {
  const [tagline, orgName, videoUrl, stats, featuredEvent, recentPosts, registration] = await Promise.all([
    getSiteContent("home_tagline"),
    getSiteContent("home_badge"),
    getSiteContent("home_video_url"),
    getQuickStats(),
    pickFeaturedEvent(),
    getRecentBlogPosts(3),
    getRegistrationSettings(),
  ]);

  return (
    <>
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
