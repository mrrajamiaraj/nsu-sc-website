import { ArrowRight } from "lucide-react";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import type { BlogPost } from "@/lib/types";

export function HomeBlog({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionLabel
              eyebrow="Latest Updates"
              title="From Our Blog"
              description="Stay updated with the latest news, achievements, and stories from NSU Sports Club"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Button href="/blog" variant="secondary">
              View All Posts
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Reveal>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Reveal key={post.id} delay={0.1 + index * 0.08}>
              <BlogPostCard post={post} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
