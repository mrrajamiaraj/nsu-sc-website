import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Stub client for when the Supabase project exists (SRS §2.1, TECH_STACK.md §2.2).
// Not called anywhere yet — lib/data/*.ts currently reads mock data. Once the
// project is created, set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
// and swap the mock reads in lib/data/*.ts for calls through this client.

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars are not set. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "once the Supabase project is created; until then use the mock data in lib/data/*.ts.",
    );
  }

  cachedClient = createClient(url, anonKey);
  return cachedClient;
}
