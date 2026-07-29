import Image from "next/image";
import { CalendarDays, Newspaper, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/lib/types";

const categoryClasses: Record<string, string> = {
  Football: "bg-purple-600",
  Cricket: "bg-amber-500",
  Basketball: "bg-orange-500",
  Events: "bg-cyan-500",
  Profiles: "bg-teal-400",
};

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <div className="glass-panel flex flex-col overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5">
      <div className="relative aspect-[16/10] w-full">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
            <Newspaper className="h-12 w-12 text-night-950/40" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold text-white",
              categoryClasses[post.category] ?? "bg-blue-500",
            )}
          >
            {post.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-white">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-400">{post.excerpt}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            {post.author}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {formatDate(post.date)}
          </span>
          <span>{post.readTimeMinutes} min read</span>
        </div>
      </div>
    </div>
  );
}
