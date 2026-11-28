import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { SEED_BLOG_ROWS } from "@/lib/data/blog-seed";
import { mapBlogPostRow } from "@/lib/mappers";
import type { BlogPost } from "@/lib/types";

export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("*").order("date", { ascending: false }).order("created_at", { ascending: false });
  const rows = data ?? [];
  // The bundled first stories, for any the database doesn't have yet (matched by slug).
  const stored = new Set(rows.map((r) => r.slug).filter(Boolean));
  const merged = [...rows, ...SEED_BLOG_ROWS.filter((r) => !stored.has(r.slug))]
    .map(mapBlogPostRow)
    .sort((a, b) => b.date.localeCompare(a.date));
  return limit ? merged.slice(0, limit) : merged;
}

export const getBlogPostById = cache(async (id: string): Promise<BlogPost | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  return data ? mapBlogPostRow(data) : null;
});

// "Send congrats" count for a story, or null when the count table isn't there yet
// (docs/proposals/blog-gazette.sql), so the page can leave the reaction out.
export async function getBlogClaps(postId: string): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_claps").select("count").eq("post_id", postId).maybeSingle();
  if (error) return null;
  return (data?.count as number | undefined) ?? 0;
}
