import { createClient } from "@/lib/supabase/server";
import { getActivePanel } from "@/lib/data/members";
import { getSiteContent } from "@/lib/data/site-content";
import { todayInDhaka } from "@/lib/events";
import type { QuickStats } from "@/lib/types";

// Count definitions (shown on Home):
// - memberCount: members of the active panel only. Filtered explicitly so a
//   signed-in admin (whose RLS also sees archived panels) gets the same figure.
// - teamCount: every squad listed on /teams.
// - eventCount: every event on /events, any status.
// - foundedYear: the About page's "Established" figure (admin: About settings),
//   so Home and About can't disagree. Null when that field holds no year.
export async function getQuickStats(): Promise<QuickStats> {
  const supabase = await createClient();
  const [panel, established, { count: teamCount }, { count: eventCount }] = await Promise.all([
    getActivePanel(),
    getSiteContent("about_stat_established"),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
  ]);
  const { count: memberCount } = panel
    ? await supabase.from("members").select("*", { count: "exact", head: true }).eq("panel_id", panel.id)
    : { count: 0 };

  const foundedYear = Number(established?.match(/\b(1[89]|20)\d{2}\b/)?.[0]) || null;
  const currentYear = Number(todayInDhaka().slice(0, 4));

  return {
    memberCount: memberCount ?? 0,
    teamCount: teamCount ?? 0,
    eventCount: eventCount ?? 0,
    yearsAsClub: foundedYear && foundedYear <= currentYear ? currentYear - foundedYear : null,
  };
}
