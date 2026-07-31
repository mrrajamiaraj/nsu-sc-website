import { createClient } from "@/lib/supabase/server";
import { mapSponsorRow } from "@/lib/mappers";
import type { Sponsor } from "@/lib/types";

export async function getSponsors(): Promise<Sponsor[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("sponsors").select("*").order("name");
  return (data ?? []).map(mapSponsorRow);
}
