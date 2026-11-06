import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Only our own image hosts — without this the route would be an open proxy (SSRF).
function allowedOrigins() {
  return [process.env.R2_PUBLIC_URL, process.env.NEXT_PUBLIC_SUPABASE_URL].flatMap((url) =>
    url ? [new URL(url).origin] : [],
  );
}

function isAllowedImageUrl(raw: string) {
  try {
    return allowedOrigins().includes(new URL(raw).origin);
  } catch {
    return false;
  }
}

// Serves an already-uploaded image same-origin so ImageUploader can re-crop it: the R2
// bucket sends no CORS headers, and the image optimizer is off (images.unoptimized).
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Defense in depth — middleware already enforces this for /admin/dashboard/**.
  if (!user) return new NextResponse(null, { status: 401 });

  const url = request.nextUrl.searchParams.get("url");
  if (!url || !isAllowedImageUrl(url)) return new NextResponse(null, { status: 400 });

  // redirect: "error" — an allowed host must not be able to bounce this fetch elsewhere.
  const upstream = await fetch(url, { cache: "no-store", redirect: "error" }).catch(() => null);
  const contentType = upstream?.headers.get("content-type")?.split(";")[0].trim() ?? "";
  if (!upstream?.ok || !ACCEPTED_TYPES.includes(contentType)) {
    return new NextResponse(null, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: { "Content-Type": contentType, "Cache-Control": "private, no-store" },
  });
}
