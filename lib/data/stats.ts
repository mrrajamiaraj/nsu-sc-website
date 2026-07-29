import { mockEvents, mockMembers, mockTeams } from "@/lib/mock-data";
import type { QuickStats } from "@/lib/types";

// Matches the "since 1995" copy in the footer (components/layout/Footer.tsx).
const FOUNDING_YEAR = 1995;

// FR-3: quick-stats bar is computed from the DB, not hardcoded.
// Swap for real counts once Supabase exists, e.g.:
//   const [{ count: memberCount }, { count: teamCount }, { count: eventCount }] = await Promise.all([
//     supabase.from("members").select("*", { count: "exact", head: true }),
//     supabase.from("teams").select("*", { count: "exact", head: true }),
//     supabase.from("events").select("*", { count: "exact", head: true }),
//   ]);
export async function getQuickStats(): Promise<QuickStats> {
  return {
    memberCount: mockMembers.length,
    teamCount: mockTeams.length,
    eventCount: mockEvents.length,
    yearsOfExcellence: new Date().getFullYear() - FOUNDING_YEAR,
  };
}
