import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// "Send congrats" on a Gazette story: adds one to its count, once per visitor (a cookie here,
// plus localStorage in the page).
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!UUID.test(id)) return NextResponse.json({ error: "Unknown story" }, { status: 404 });

  const cookie = `clap_${id.slice(0, 8)}`;
  if (request.cookies.get(cookie)) return NextResponse.json({ error: "Already sent", already: true }, { status: 409 });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("clap_blog_post", { p_post: id });
  if (error) return NextResponse.json({ error: "Congrats aren't available yet" }, { status: 503 });
  if (data === null) return NextResponse.json({ error: "Unknown story" }, { status: 404 });

  const response = NextResponse.json({ count: data as number });
  response.cookies.set(cookie, "1", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return response;
}
