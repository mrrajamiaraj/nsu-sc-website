import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { Reveal } from "@/components/motion/Reveal";
import { getBlogPosts } from "@/lib/data/blog";
import { getRegistrationSettings } from "@/lib/data/registration";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function BlogPage() {
  const [posts, registrationSettings] = await Promise.all([getBlogPosts(), getRegistrationSettings()]);
  const [lead, ...rest] = posts;

  return (
    <>
      <div className="px-4 pb-12 pt-4 text-center">
        <Reveal y={16}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-300">
            <CalendarDays className="h-3.5 w-3.5 text-blue-400" />
            Latest Updates
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
            From Our <span className="text-gradient-brand">Blog</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Stay updated with the latest news, achievements, and stories from NSU SC.
          </p>
        </Reveal>
      </div>

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
