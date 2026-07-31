import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const INACTIVITY_COOKIE = "admin_last_active";
const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // FR-20: 60 minutes of inactivity

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/admin/dashboard");
  if (!isDashboardRoute) {
    return supabaseResponse;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  const lastActive = request.cookies.get(INACTIVITY_COOKIE)?.value;
  const now = Date.now();
  if (lastActive && now - Number(lastActive) > INACTIVITY_LIMIT_MS) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("reason", "timeout");
    const response = NextResponse.redirect(url);
    response.cookies.delete(INACTIVITY_COOKIE);
    return response;
  }

  supabaseResponse.cookies.set(INACTIVITY_COOKIE, String(now), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: INACTIVITY_LIMIT_MS / 1000,
    path: "/",
  });

  return supabaseResponse;
}
