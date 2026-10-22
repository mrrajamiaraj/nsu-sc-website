import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

type SiteContentRow = { content: string | null; images: string[] | null; featured_event_id: string | null };

// Pages read many site_content keys; load the whole (small) table once per request.
const getSiteContentRows = cache(async (): Promise<Map<string, SiteContentRow>> => {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("page_key, content, images, featured_event_id");
  return new Map((data ?? []).map(({ page_key, ...row }) => [page_key as string, row as SiteContentRow]));
});

export async function getSiteContent(pageKey: string): Promise<string | null> {
  return (await getSiteContentRows()).get(pageKey)?.content ?? null;
}

export async function getSiteContentImages(pageKey: string): Promise<string[]> {
  return (await getSiteContentRows()).get(pageKey)?.images ?? [];
}

export async function getSiteContentJson<T>(pageKey: string, fallback: T): Promise<T> {
  const raw = await getSiteContent(pageKey);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getFeaturedEventId(): Promise<string | null> {
  return (await getSiteContentRows()).get("home_featured_event")?.featured_event_id ?? null;
}
