import { mockBlogPosts } from "@/lib/mock-data";
import type { BlogPost } from "@/lib/types";

// Swap for `supabase.from("blog_posts").select("*").order("date", { ascending: false })`.
export async function getBlogPosts(): Promise<BlogPost[]> {
  return [...mockBlogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
