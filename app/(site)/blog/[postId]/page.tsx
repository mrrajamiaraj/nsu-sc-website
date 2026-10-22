import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Newspaper } from "lucide-react";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/format";
import { getBlogPosts, getBlogPostById } from "@/lib/data/blog";
import { sanitizeHtml } from "@/lib/sanitize";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ postId: post.id }));
}

// Author and date go into the article Open Graph / Twitter tags so link
// previews and search results show who wrote it and when.
export async function generateMetadata({ params }: { params: Promise<{ postId: string }> }): Promise<Metadata> {
  const { postId } = await params;
  const post = await getBlogPostById(postId);
  if (!post) return { title: "Blog Post" };

  const images = post.coverImage ? [{ url: post.coverImage, alt: post.title }] : undefined;
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    alternates: { canonical: `/blog/${post.id}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.id}`,
      publishedTime: post.date,
      authors: [post.author],
      section: post.category,
      images,
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

// Reading typography for the sanitized post HTML: ~68ch measure, relaxed
// leading, display-font headings, accent links.
const bodyClasses = [
  "mx-auto max-w-[68ch] text-[1.0625rem] leading-8 text-slate-300",
  "[&_p]:mb-6",
  "[&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:leading-tight [&_h2]:text-white",
  "[&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white",
  "[&_a]:font-medium [&_a]:text-blue-400 [&_a]:underline [&_a]:decoration-blue-400/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-blue-400",
  "[&_strong]:font-semibold [&_strong]:text-white",
  "[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_li]:pl-1 [&_li::marker]:text-blue-400",
  "[&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-blue-400 [&_blockquote]:pl-5 [&_blockquote]:text-lg [&_blockquote]:italic [&_blockquote]:text-slate-200",
  "[&_img]:my-8 [&_img]:rounded-2xl",
  "[&_hr]:my-10 [&_hr]:border-white/10",
  "[&>*:first-child]:mt-0",
].join(" ");

function absoluteUrl(url: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  return site && url.startsWith("/") ? new URL(url, site).href : url;
}

export default async function BlogPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const post = await getBlogPostById(postId);
  if (!post) notFound();

  const sanitizedContent = sanitizeHtml(post.content);
  const morePosts = (await getBlogPosts()).filter((other) => other.id !== post.id).slice(0, 4);

  // schema.org data so search engines pick up author and publish date.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    articleSection: post.category,
    // Search engines want absolute image URLs; local /images/... paths need the site origin.
    ...(post.coverImage ? { image: [absoluteUrl(post.coverImage)] } : {}),
    publisher: { "@type": "Organization", name: "NSU Games and Sports Club" },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        // Escape "<" so post text can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="px-4 pb-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Category, title, excerpt as the intro, then byline. */}
      <header className="px-4 pb-10">
        <Reveal className="mx-auto max-w-3xl">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-blue-400">{post.category}</p>
          <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-6xl">{post.title}</h1>
          {post.excerpt && <p className="mt-5 text-lg leading-relaxed text-slate-300 sm:text-xl">{post.excerpt}</p>}
          <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
            <span className="font-medium text-slate-200">{post.author}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.date} className="font-mono">
              {formatDate(post.date)}
            </time>
            <span aria-hidden>·</span>
            <span>{post.readTimeMinutes} min read</span>
          </p>
        </Reveal>
      </header>

      <div className="px-4 pb-12">
        <Reveal className="mx-auto max-w-5xl">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl">
            {post.coverImage ? (
              <Image src={post.coverImage} alt={post.title} fill priority sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
                <Newspaper className="h-12 w-12 text-night-950/40" strokeWidth={1.5} />
              </div>
            )}
          </div>
        </Reveal>
      </div>

      <div className="px-4 pb-20">
        {/* The excerpt is the intro above, so it isn't repeated here when there's no body. */}
        {sanitizedContent && <div className={bodyClasses} dangerouslySetInnerHTML={{ __html: sanitizedContent }} />}

        {morePosts.length > 0 && (
          <Reveal className="mx-auto mt-16 max-w-3xl border-t border-white/10 pt-10">
            <h2 className="mb-6 text-2xl font-bold text-white">More from the blog</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {morePosts.map((other) => (
                <BlogPostCard key={other.id} post={other} variant="compact" />
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </article>
  );
}
