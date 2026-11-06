import Image from "next/image";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlumniProfile } from "@/lib/types";

// Portrait-first "directory" layout: a full-width 4:5 photo with crest + tier on
// top, then centered name and panel. The whole card opens the alumni's profile
// popup, which holds their current role and contact details.
export function AlumniCard({ alumni, onOpen }: { alumni: AlumniProfile; onOpen: (alumni: AlumniProfile) => void }) {
  const executive = alumni.tier === "Executive";

  return (
    <div className="glass-panel group relative flex h-full flex-col overflow-hidden text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300/30">
      {/* Same crest watermark as the executive member cards (MemberPortraitCard). */}
      <div className="photo-backdrop aspect-[4/5] w-full before:[background-position:center_top_-40px] before:[background-size:115%_auto] before:opacity-5">
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
      </div>

      {/* Full-card hit area. */}
      <button
        type="button"
        onClick={() => onOpen(alumni)}
        aria-label={`View ${alumni.name}'s profile`}
        className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-400"
      />
    </div>
  );
}
