import { Hero } from "@/components/home/Hero";
import { QuickStats } from "@/components/home/QuickStats";
import { FeaturedEvent } from "@/components/home/FeaturedEvent";
import { HomeBlog } from "@/components/home/HomeBlog";
import { Newsletter } from "@/components/home/Newsletter";
import { getQuickStats } from "@/lib/data/stats";
import { getFeaturedEvent } from "@/lib/data/events";
import { getSiteContent } from "@/lib/data/site-content";
import { getRecentBlogPosts } from "@/lib/data/blog";

export default async function Home() {
  const [tagline, orgName, videoUrl, stats, featuredEvent, recentPosts] = await Promise.all([
    getSiteContent("home_tagline"),
    getSiteContent("home_badge"),
    getSiteContent("home_video_url"),
    getQuickStats(),
    getFeaturedEvent(),
    getRecentBlogPosts(3),
  ]);

  return (
    <>
      <Hero
        tagline={tagline ?? "One club, every sport."}
        orgName={orgName ?? "North South University"}
        videoSrc={videoUrl || null}
      />
      <QuickStats stats={stats} />
      {featuredEvent && <FeaturedEvent event={featuredEvent} />}
      {recentPosts.length > 0 && <HomeBlog posts={recentPosts} />}
      <Newsletter />
    </>
  );
}
