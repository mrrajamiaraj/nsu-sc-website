import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { RevealOnView } from "@/components/home/HomeMotion";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/lib/types";

function Chip({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-full bg-[#3fcfca] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#002e2c]">
      {children}
    </span>
  );
}

function Cover({ post, sizes }: { post: BlogPost; sizes: string }) {
  return post.coverImage ? (
    <Image src={post.coverImage} alt="" fill sizes={sizes} className="object-cover transition-transform duration-500 group-hover:scale-105" />
  ) : (
    <span className="flex h-full w-full items-center justify-center bg-[#123a38]">
      <Newspaper aria-hidden className="h-10 w-10 text-slate-500" strokeWidth={1.5} />
    </span>
  );
}

// Magazine layout: one large feature (picture left, words right), then two smaller cards.
export function HomeBlog({ posts }: { posts: BlogPost[] }) {
  const [lead, ...rest] = posts;
  if (!lead) return null;

  return (
    <section aria-labelledby="blog-heading" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 id="blog-heading" className="text-5xl !font-extrabold text-white sm:text-6xl">
            From the blog
          </h2>
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#79d8d5] hover:text-white">
            All posts
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <RevealOnView>
          <Link href={`/blog/${lead.id}`} className="group grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-12">
            <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-[#0f302e]">
              <Cover post={lead} sizes="(min-width: 1024px) 50vw, 100vw" />
            </span>
            <span className="flex flex-col items-start gap-4">
              <span className="flex flex-wrap items-center gap-3">
                <Chip>{lead.category}</Chip>
                <time dateTime={lead.date} className="text-sm text-slate-400">
                  {formatDate(lead.date)}
                </time>
              </span>
              <span className="text-balance font-display text-4xl font-extrabold uppercase leading-[0.92] text-white group-hover:text-[#79d8d5] sm:text-5xl">
                {lead.title}
              </span>
              {lead.excerpt && <span className="max-w-prose text-lg text-slate-300">{lead.excerpt}</span>}
              <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                Read the story
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </span>
          </Link>
        </RevealOnView>

        {rest.length > 0 && (
          <ul className="mt-14 grid gap-10 sm:grid-cols-2">
            {rest.slice(0, 2).map((post, index) => (
              <li key={post.id}>
                <RevealOnView delay={0.06 * index}>
                  <Link href={`/blog/${post.id}`} className="group block">
                    <span className="relative block aspect-[16/9] overflow-hidden rounded-xl bg-[#0f302e]">
                      <Cover post={post} sizes="(min-width: 640px) 50vw, 100vw" />
                    </span>
                    <span className="mt-4 flex flex-wrap items-center gap-3">
                      <Chip>{post.category}</Chip>
                      <time dateTime={post.date} className="text-sm text-slate-400">
                        {formatDate(post.date)}
                      </time>
                    </span>
                    <span className="mt-3 block text-balance text-2xl font-semibold leading-snug text-white group-hover:text-[#79d8d5]">
                      {post.title}
                    </span>
                  </Link>
                </RevealOnView>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
