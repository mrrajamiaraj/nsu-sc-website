import { createClient } from "@/lib/supabase/server";
import { mapMemberRow, mapPanelRow } from "@/lib/mappers";
import type { Member, Panel } from "@/lib/types";

export async function getActivePanel(): Promise<Panel | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("panels").select("*").eq("is_active", true).maybeSingle();
  return data ? mapPanelRow(data) : null;
}

// Every member of a panel, in admin-defined order; callers group by tier.
export async function getPanelMembers(panelId: string): Promise<Member[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("members").select("*").eq("panel_id", panelId).order("sort_order");
  return (data ?? []).map(mapMemberRow);
}
