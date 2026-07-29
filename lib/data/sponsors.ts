import { mockSponsors } from "@/lib/mock-data";
import type { Sponsor } from "@/lib/types";

// Swap for `supabase.from("sponsors").select("*")` once that table exists.
export async function getSponsors(): Promise<Sponsor[]> {
  return mockSponsors;
}
