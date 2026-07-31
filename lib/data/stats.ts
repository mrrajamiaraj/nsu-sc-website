import { createClient } from "@/lib/supabase/server";
import { FOUNDING_YEAR } from "@/lib/constants";
import type { QuickStats } from "@/lib/types";

// FR-3: quick-stats bar computed from the DB, not hardcoded.
export async function getQuickStats(): Promise<QuickStats> {
  const supabase = await createClient();
  const [{ count: memberCount }, { count: teamCount }, { count: eventCount }] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
  ]);

  return {
    memberCount: memberCount ?? 0,
    teamCount: teamCount ?? 0,
    eventCount: eventCount ?? 0,
    yearsOfExcellence: new Date().getFullYear() - FOUNDING_YEAR,
  };
}
