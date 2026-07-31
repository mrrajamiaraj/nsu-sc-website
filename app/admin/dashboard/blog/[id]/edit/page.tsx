import { notFound } from "next/navigation";
import { getBlogPostById } from "@/lib/data/blog";
import { GlassCard } from "@/components/ui/GlassCard";
import { BlogPostForm } from "@/components/admin/blog/BlogPostForm";
import { updateBlogPost } from "../../actions";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Edit Blog Post</h1>
      <GlassCard className="mt-6">
        <BlogPostForm post={post} action={updateBlogPost.bind(null, id)} />
      </GlassCard>
    </div>
  );
}
