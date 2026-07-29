import { mockRegistrationSettings } from "@/lib/mock-data";
import type { RegistrationSettings } from "@/lib/types";

// Swap for `supabase.from("registration_settings").select("*").single()` once Supabase exists.
export async function getRegistrationSettings(): Promise<RegistrationSettings> {
  return mockRegistrationSettings;
}
