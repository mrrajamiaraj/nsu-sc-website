import { createClient } from "@/lib/supabase/server";
import { mapRegistrationRow } from "@/lib/mappers";
import type { RegistrationSettings } from "@/lib/types";

export async function getRegistrationSettings(): Promise<RegistrationSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("registration_settings").select("*").eq("id", 1).single();
  return mapRegistrationRow(data);
}
