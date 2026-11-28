import { GlassCard } from "@/components/ui/GlassCard";
import { BlogPostForm } from "@/components/admin/blog/BlogPostForm";
import { createBlogPost } from "../actions";
import { getBlogLinkOptions } from "@/lib/data/blog-options";

export default async function NewBlogPostPage() {
  const options = await getBlogLinkOptions();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Add Blog Post</h1>
      <GlassCard className="mt-6">
        <BlogPostForm action={createBlogPost} {...options} />
      </GlassCard>
    </div>
  );
}
