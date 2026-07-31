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

  return (
    <>
      <div className="px-4 pb-12 pt-4 text-center">
        <Reveal y={16}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
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
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Reveal key={post.id} delay={index * 0.08}>
              <BlogPostCard post={post} />
            </Reveal>
          ))}
        </div>
      </div>

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
