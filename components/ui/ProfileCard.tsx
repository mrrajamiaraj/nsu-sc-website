import Image from "next/image";
import type { ComponentType } from "react";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared pieces of the member, alumni and player cards.

export function ProfilePhoto({
  src,
  alt,
  badge,
  imageClassName,
  quality,
}: {
  src: string | null;
  alt: string;
  badge?: string | null;
  imageClassName?: string;
  quality?: number;
}) {
  return (
    <div className="photo-backdrop aspect-[16/10] w-full">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          quality={quality}
          className={cn("object-cover transition-transform duration-700 ease-out group-hover:scale-105", imageClassName)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <UserRound className="h-10 w-10 text-white/30" strokeWidth={1.5} />
        </div>
      )}
      {badge && (
        <div className="absolute right-3 top-3 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {badge}
        </div>
      )}
      <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 p-1.5 backdrop-blur-md">
        <Image
          src="/images/branding/nsu-sc-logo.png"
          alt="NSU SC"
          width={64}
          height={64}
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}

interface ContactLink {
  key: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  title?: string;
}

// Only the contact options that were actually filled in get an icon.
export function ContactLinks({ links }: { links: (ContactLink | false | null | undefined | "")[] }) {
  const visible = links.filter((link): link is ContactLink => Boolean(link));
  if (visible.length === 0) return null;

  return (
    <div className="mt-4 flex justify-center gap-2 border-t border-white/10 pt-4">
      {visible.map((link) => {
        const external = link.href.startsWith("http");
        return (
          <a
            key={link.key}
            href={link.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            aria-label={link.label}
            title={link.title}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-white/25 hover:text-white"
          >
            <link.icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
