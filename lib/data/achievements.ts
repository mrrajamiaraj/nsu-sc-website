import { createClient } from "@/lib/supabase/server";
import { mapAchievementRow } from "@/lib/mappers";
import type { Achievement } from "@/lib/types";

export async function getAchievements(): Promise<Achievement[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("achievements")
    .select("*, teams(name)")
    .order("date", { ascending: false });
  return (data ?? []).map(mapAchievementRow);
}

export async function getAchievementById(id: string): Promise<Achievement | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("achievements").select("*, teams(name)").eq("id", id).maybeSingle();
  return data ? mapAchievementRow(data) : null;
}
