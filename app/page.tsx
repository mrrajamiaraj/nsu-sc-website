import { Hero } from "@/components/home/Hero";
import { QuickStats } from "@/components/home/QuickStats";
import { FeaturedEvent } from "@/components/home/FeaturedEvent";
import { getQuickStats } from "@/lib/data/stats";
import { getFeaturedEvent } from "@/lib/data/events";
import { getSiteContent } from "@/lib/data/site-content";

export default async function Home() {
  const [tagline, stats, featuredEvent] = await Promise.all([
    getSiteContent("home_tagline"),
    getQuickStats(),
    getFeaturedEvent(),
  ]);

  return (
    <>
      <Hero tagline={tagline ?? "One club, every sport."} />
      <QuickStats stats={stats} />
      {featuredEvent && <FeaturedEvent event={featuredEvent} />}
    </>
  );
}
