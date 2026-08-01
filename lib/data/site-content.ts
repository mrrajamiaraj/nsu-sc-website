import { createClient } from "@/lib/supabase/server";

export async function getSiteContent(pageKey: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("content").eq("page_key", pageKey).maybeSingle();
  return (data?.content as string | null) ?? null;
}

export async function getSiteContentImages(pageKey: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("images").eq("page_key", pageKey).maybeSingle();
  return (data?.images as string[] | null) ?? [];
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
