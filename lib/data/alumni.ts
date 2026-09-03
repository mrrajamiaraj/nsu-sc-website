import { createClient } from "@/lib/supabase/server";
import { mapAlumniClassYearRow, mapAlumniRow } from "@/lib/mappers";
import type { AlumniClassYear, AlumniProfile } from "@/lib/types";

export async function getAlumni(): Promise<AlumniProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("alumni").select("*, alumni_class_years(label)");
  return (data ?? []).map(mapAlumniRow);
}

// Admin-ordered — controls both the filter pill order and the section order
// on the public Alumni page.
export async function getAlumniClassYears(): Promise<AlumniClassYear[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("alumni_class_years").select("*").order("sort_order");
  return (data ?? []).map(mapAlumniClassYearRow);
}
