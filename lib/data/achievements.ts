import { createClient } from "@/lib/supabase/server";
import { mapAchievementRow } from "@/lib/mappers";
import type { Achievement } from "@/lib/types";

export async function getAchievements(): Promise<Achievement[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("achievements")
    .select("*, teams(name)")
    // Undated (historical) entries go after the dated ones; created_at keeps
    // entries that share a date in the order they were added.
    .order("date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: true });
  return (data ?? []).map(mapAchievementRow);
}

export async function getAchievementById(id: string): Promise<Achievement | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("achievements").select("*, teams(name)").eq("id", id).maybeSingle();
  return data ? mapAchievementRow(data) : null;
}
