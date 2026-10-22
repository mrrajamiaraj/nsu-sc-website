import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { Reveal } from "@/components/motion/Reveal";
import type { BlogPost } from "@/lib/types";

// Newest post large on the left, the next two as compact rows beside it.
export function HomeBlog({ posts }: { posts: BlogPost[] }) {
  const [lead, ...rest] = posts;
  if (!lead) return null;

  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">From the blog</h2>
          <Link
            href="/blog"
            className="tap-target inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            All posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-5">
          <Reveal className={rest.length > 0 ? "h-full lg:col-span-3" : "h-full lg:col-span-5"}>
            <BlogPostCard post={lead} />
          </Reveal>
          {rest.length > 0 && (
            <div className="flex flex-col gap-4 lg:col-span-2">
              {rest.slice(0, 2).map((post, index) => (
                <Reveal key={post.id} delay={0.08 * (index + 1)}>
                  <BlogPostCard post={post} variant="compact" />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
