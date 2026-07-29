import { mockSiteContent } from "@/lib/mock-data";

// Swap for `supabase.from("site_content").select("content").eq("page_key", key).single()`.
export async function getSiteContent(pageKey: string): Promise<string | null> {
  return mockSiteContent.find((entry) => entry.pageKey === pageKey)?.content ?? null;
}
