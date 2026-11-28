import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAllEvents } from "@/lib/data/events";
import { getTeams } from "@/lib/data/teams";
import { teamSlug } from "@/lib/squads";
import { getAchievements } from "@/lib/data/achievements";
import { entryPath, trophyEntries } from "@/lib/trophy";
import { getBlogPosts } from "@/lib/data/blog";

const STATIC_PATHS = ["", "/events", "/about", "/teams", "/achievements", "/alumni", "/members", "/blog", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, teams, achievements, posts] = await Promise.all([
    getAllEvents(),
    getTeams(),
    getAchievements(),
    getBlogPosts(),
  ]);

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...events.map((event) => ({ url: `${SITE_URL}/events/${event.id}` })),
    ...teams.map((team) => ({ url: `${SITE_URL}/teams/${teamSlug(team)}` })),
    ...trophyEntries(achievements).map((entry) => ({ url: `${SITE_URL}${entryPath(entry)}` })),
    ...posts.map((post) => ({ url: `${SITE_URL}/blog/${post.id}`, lastModified: post.date })),
  ];
}
