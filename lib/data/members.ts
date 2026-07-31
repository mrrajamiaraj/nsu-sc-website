import { createClient } from "@/lib/supabase/server";
import { mapMemberRow, mapPanelRow } from "@/lib/mappers";
import type { Member, MemberTier, Panel } from "@/lib/types";

// FR-15: display the currently active panel only.
export async function getActivePanel(): Promise<Panel | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("panels").select("*").eq("is_active", true).maybeSingle();
  return data ? mapPanelRow(data) : null;
}

// FR-16/FR-18: members within a tier, in admin-defined sort order.
export async function getMembersByTier(panelId: string, tier: MemberTier): Promise<Member[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("panel_id", panelId)
    .eq("tier", tier)
    .order("sort_order");
  return (data ?? []).map(mapMemberRow);
}
