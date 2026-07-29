import { mockAlumni } from "@/lib/mock-data";
import type { AlumniProfile } from "@/lib/types";

// Swap for `supabase.from("alumni").select("*")` once that table exists.
export async function getAlumni(): Promise<AlumniProfile[]> {
  return mockAlumni;
}
