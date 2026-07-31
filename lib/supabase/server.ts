import { createServerClient } from "@supabase/ssr";
import { createClient as createStaticClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Server Component / Server Action client, bound to the request's cookies.
export async function createClient() {
  try {
    const cookieStore = await cookies();

    return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component render — middleware refreshes the session instead.
          }
        },
      },
    });
  } catch {
    // No request context (e.g. generateStaticParams at build time) — fall back to a plain
    // anon-key client. Fine for public reads; admin routes always run within a request.
    return createStaticClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  }
}
