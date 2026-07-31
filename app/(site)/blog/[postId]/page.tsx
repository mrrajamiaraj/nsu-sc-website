import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft, CalendarDays, Newspaper, User } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/format";
import { getBlogPosts, getBlogPostById } from "@/lib/data/blog";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ postId: post.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ postId: string }> }): Promise<Metadata> {
  const { postId } = await params;
  const post = await getBlogPostById(postId);
  return { title: post?.title ?? "Blog Post" };
}

export default async function BlogPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const post = await getBlogPostById(postId);
  if (!post) notFound();

  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <>
      <div className="px-4 pb-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </div>

      <div className="px-4 pb-10">
        <Reveal className="mx-auto max-w-3xl">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl">
            {post.coverImage ? (
              <Image src={post.coverImage} alt={post.title} fill sizes="768px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
                <Newspaper className="h-12 w-12 text-night-950/40" strokeWidth={1.5} />
              </div>
            )}
          </div>
        </Reveal>
      </div>

      <div className="px-4 pb-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">{post.category}</span>
            <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl">{post.title}</h1>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-400" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-400" />
                {formatDate(post.date)}
              </span>
              <span>{post.readTimeMinutes} min read</span>
            </div>

            {sanitizedContent ? (
              <div
                className="prose-content mt-8 text-slate-300 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            ) : (
              <p className="mt-8 text-slate-400">{post.excerpt}</p>
            )}
          </Reveal>
        </div>
      </div>
    </>
  );
}
