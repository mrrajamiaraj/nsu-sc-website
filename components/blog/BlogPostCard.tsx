import Image from "next/image";
import Link from "next/link";
import { Newspaper, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/lib/types";

type Variant = "large" | "default" | "compact";

// Category in the accent colour beside the date, instead of per-category colour pills.
function PostMeta({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500", className)}>
      <span className="font-mono font-medium uppercase tracking-[0.1em] text-blue-400">{post.category}</span>
      <span aria-hidden>·</span>
      <span className="font-mono">{formatDate(post.date)}</span>
    </p>
  );
}

function Cover({ post, sizes, iconClassName }: { post: BlogPost; sizes: string; iconClassName: string }) {
  return post.coverImage ? (
    <Image
      src={post.coverImage}
      alt={post.title}
      fill
      sizes={sizes}
      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
      <Newspaper className={cn("text-night-950/40", iconClassName)} strokeWidth={1.5} />
    </div>
  );
}

// large: the lead post on the blog index (image beside text on desktop).
// default: grid card. compact: small thumbnail row for "more posts" lists.
// The whole card is one link in every layout.
export function BlogPostCard({ post, variant = "default" }: { post: BlogPost; variant?: Variant }) {
  const linkClass =
    "glass-panel group overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5";

  if (variant === "compact") {
    return (
      <Link href={`/blog/${post.id}`} className={cn(linkClass, "flex h-full items-center gap-4 p-3")}>
        <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl sm:w-24">
          <Cover post={post} sizes="96px" iconClassName="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <PostMeta post={post} />
          <h3 className="mt-1.5 line-clamp-2 font-semibold text-white">{post.title}</h3>
        </div>
      </Link>
    );
  }

  const large = variant === "large";

  return (
    <Link href={`/blog/${post.id}`} className={cn(linkClass, "flex h-full flex-col", large && "lg:flex-row")}>
      <div className={cn("relative aspect-[16/10] w-full shrink-0 overflow-hidden", large && "lg:aspect-auto lg:min-h-[22rem] lg:w-3/5")}>
        <Cover
          post={post}
          sizes={large ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          iconClassName={large ? "h-16 w-16" : "h-12 w-12"}
        />
      </div>

      <div className={cn("flex flex-1 flex-col p-5", large && "sm:p-8 lg:justify-center")}>
        <PostMeta post={post} />
        <h3 className={cn("mt-2 font-bold text-white", large ? "text-2xl sm:text-3xl" : "text-lg")}>{post.title}</h3>
        <p className={cn("mt-2 text-sm text-slate-400", large ? "line-clamp-4 sm:text-base" : "line-clamp-2")}>
          {post.excerpt}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            {post.author}
          </span>
          <span>{post.readTimeMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}
