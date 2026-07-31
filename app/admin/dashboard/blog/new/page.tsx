import { GlassCard } from "@/components/ui/GlassCard";
import { BlogPostForm } from "@/components/admin/blog/BlogPostForm";
import { createBlogPost } from "../actions";

export default function NewBlogPostPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Add Blog Post</h1>
      <GlassCard className="mt-6">
        <BlogPostForm action={createBlogPost} />
      </GlassCard>
    </div>
  );
}
