import { getAchievements } from "@/lib/data/achievements";
import { getAllEvents } from "@/lib/data/events";
import { getTeams } from "@/lib/data/teams";
import { trophyEntries } from "@/lib/trophy";

// Choices for the blog editor's "About an event / achievement / squad" fields.
export async function getBlogLinkOptions() {
  const [events, achievements, teams] = await Promise.all([getAllEvents(), getAchievements(), getTeams()]);
  return {
    events: events.map((e) => ({ id: e.id, label: e.name })),
    achievements: trophyEntries(achievements).map((a) => ({ id: a.id, label: a.title })),
    teams: teams.map((t) => ({ id: t.id, label: t.name })),
  };
}
