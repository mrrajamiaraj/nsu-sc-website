import { mockBlogPosts } from "@/lib/mock-data";
import type { BlogPost } from "@/lib/types";

// Swap for `supabase.from("blog_posts").select("*").order("date", { ascending: false })`.
export async function getBlogPosts(): Promise<BlogPost[]> {
  return [...mockBlogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Home page teaser: latest N posts, same ordering as the full blog listing.
// Swap for `.order("date", { ascending: false }).limit(count)` alongside getBlogPosts.
export async function getRecentBlogPosts(count = 3): Promise<BlogPost[]> {
  return (await getBlogPosts()).slice(0, count);
}
