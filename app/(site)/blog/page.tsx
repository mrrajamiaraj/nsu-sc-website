import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBlogPosts } from "@/lib/data/blog";
import { getRegistrationSettings } from "@/lib/data/registration";

export const metadata: Metadata = {
  title: "Blog",
  description: "News, match reports and stories from NSU Games and Sports Club.",
};

export default async function BlogPage() {
  const [posts, registrationSettings] = await Promise.all([getBlogPosts(), getRegistrationSettings()]);
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHeader
        icon={CalendarDays}
        eyebrow="Latest Updates"
        title={
          <>
            From Our <span className="text-gradient-brand">Blog</span>
          </>
        }
        intro="Stay updated with the latest news, achievements, and stories from NSU SC."
      />

      <div className="px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          {/* Posts come newest first: the newest leads large, the rest go in the grid. */}
          {lead && (
            <Reveal>
              <BlogPostCard post={lead} variant="large" />
            </Reveal>
          )}
          {rest.length > 0 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, index) => (
                <Reveal key={post.id} delay={Math.min(index, 5) * 0.08} className="h-full">
                  <BlogPostCard post={post} />
                </Reveal>
              ))}
            </div>
          )}
          {!lead && <p className="text-center text-sm text-slate-500">No posts yet — check back soon.</p>}
        </div>
      </div>

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
