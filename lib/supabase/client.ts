import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. RLS enforces public-read/admin-write regardless
// of this being the anon key — never use the service-role key client-side.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
