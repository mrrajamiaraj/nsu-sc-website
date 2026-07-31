import { createClient } from "@/lib/supabase/server";
import { mapBlogPostRow } from "@/lib/mappers";
import type { BlogPost } from "@/lib/types";

export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("*").order("date", { ascending: false });
  return (data ?? []).map(mapBlogPostRow);
}

// Home page teaser: latest N posts, same ordering as the full blog listing.
export async function getRecentBlogPosts(count = 3): Promise<BlogPost[]> {
  return (await getBlogPosts()).slice(0, count);
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  return data ? mapBlogPostRow(data) : null;
}
