import Image from "next/image";
import { Phone, UserRound } from "lucide-react";
import { ContactLinks } from "@/components/ui/ProfileCard";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { cn, telHref } from "@/lib/utils";
import type { AlumniProfile } from "@/lib/types";

// Portrait-first "directory" layout: a full-width 4:5 photo with crest + tier
// on top, then centered name, panel and current role, with contacts pinned to
// the bottom so cards in a row line up.
export function AlumniCard({ alumni }: { alumni: AlumniProfile }) {
  const executive = alumni.tier === "Executive";

  return (
    <div className="glass-panel group relative flex h-full flex-col overflow-hidden text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300/30">
      <div className="photo-backdrop aspect-[4/5] w-full">
        {alumni.photo ? (
          // Sources are already lossy WebP; the default quality of 75 re-compresses them visibly.
          <Image
            src={alumni.photo}
            alt={alumni.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            quality={90}
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserRound className="h-16 w-16 text-white/30" strokeWidth={1.5} />
          </div>
        )}

        {/* Fade the photo into the card body */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-slate-900/70 to-transparent" />

        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 p-1.5 backdrop-blur-md">
            <Image
              src="/images/branding/nsu-sc-logo.png"
              alt="NSU SC"
              width={64}
              height={64}
              className="h-full w-full object-contain"
            />
          </div>
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] backdrop-blur-md",
              executive ? "border-blue-300/40 bg-blue-900/50 text-blue-200" : "border-white/20 bg-black/30 text-slate-200",
            )}
          >
            {alumni.tier}
          </span>
        </div>
      </div>

      {/* Thin brand rule between photo and details */}
      <div aria-hidden className="h-[2px] bg-brand-gradient opacity-60" />

      <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
        <h3 className="font-display text-2xl font-semibold uppercase leading-none tracking-wide text-white">
          {alumni.name}
        </h3>
        <p className="mt-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-blue-400">
          {alumni.team ? `${alumni.team} · Panel ${alumni.classYear}` : `Panel ${alumni.classYear}`}
        </p>

        {(alumni.currentRole || alumni.quote) && (
          <div className="mt-5 border-t border-white/10 pt-4">
            {alumni.currentRole && (
              <>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">Currently</p>
                <p className="mt-1 text-sm font-medium text-slate-200">{alumni.currentRole}</p>
              </>
            )}
            {alumni.quote && (
              <p className={cn("text-sm italic leading-relaxed text-slate-400", alumni.currentRole && "mt-3")}>
                &ldquo;{alumni.quote}&rdquo;
              </p>
            )}
          </div>
        )}

        <div className="mt-auto">
          <ContactLinks
            links={[
              alumni.facebook && { key: "facebook", label: "Facebook", href: alumni.facebook, icon: FacebookIcon },
              alumni.phone && {
                key: "phone",
                label: "Phone",
                href: telHref(alumni.phone),
                icon: Phone,
                title: alumni.phone,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
