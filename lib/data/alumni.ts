import { createClient } from "@/lib/supabase/server";
import { mapAlumniRow } from "@/lib/mappers";
import type { AlumniProfile } from "@/lib/types";

export async function getAlumni(): Promise<AlumniProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("alumni").select("*").order("graduation_year", { ascending: false });
  return (data ?? []).map(mapAlumniRow);
}
