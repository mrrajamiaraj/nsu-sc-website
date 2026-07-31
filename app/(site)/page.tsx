import { Hero } from "@/components/home/Hero";
import { QuickStats } from "@/components/home/QuickStats";
import { FeaturedEvent } from "@/components/home/FeaturedEvent";
import { HomeBlog } from "@/components/home/HomeBlog";
import { Newsletter } from "@/components/home/Newsletter";
import { TrustedBy } from "@/components/home/TrustedBy";
import { getQuickStats } from "@/lib/data/stats";
import { getFeaturedEvent } from "@/lib/data/events";
import { getSiteContent } from "@/lib/data/site-content";
import { getRecentBlogPosts } from "@/lib/data/blog";
import { getSponsors } from "@/lib/data/sponsors";

export default async function Home() {
  const [tagline, stats, featuredEvent, recentPosts, sponsors] = await Promise.all([
    getSiteContent("home_tagline"),
    getQuickStats(),
    getFeaturedEvent(),
    getRecentBlogPosts(3),
    getSponsors(),
  ]);

  return (
    <>
      <Hero tagline={tagline ?? "One club, every sport."} />
      <QuickStats stats={stats} />
      {featuredEvent && <FeaturedEvent event={featuredEvent} />}
      {recentPosts.length > 0 && <HomeBlog posts={recentPosts} />}
      <Newsletter />
      <TrustedBy sponsors={sponsors} />
    </>
  );
}
