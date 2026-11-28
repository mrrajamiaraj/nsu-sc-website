"use client";

import { createContext, useContext } from "react";
import { initials } from "@/components/teams/announcement/Cutout";
import { thumbUrl, type PanelPerson } from "@/lib/members-sheet";
import { cn } from "@/lib/utils";

export { ANTON } from "@/components/achievements/report/shared";

export { TIER_FILTERS, type TierFilter } from "@/lib/members-sheet";

// Opening a profile: which person, and the list ←/→ should move through.
type Opener = (person: PanelPerson, scope: PanelPerson[], from: HTMLElement | null) => void;
const OpenCtx = createContext<Opener>(() => {});
export const OpenProvider = OpenCtx.Provider;
export const useOpenPerson = () => useContext(OpenCtx);

/**
 * Round head-and-shoulders portrait from the small thumbnail endpoint (a few KB each).
 * `size` is the displayed size in px; the image is fetched at 2x.
 */
export function Face({ person, size, className, lazy = true }: { person: Pick<PanelPerson, "photo" | "name">; size: number; className?: string; lazy?: boolean }) {
  const src = thumbUrl(person.photo, size <= 40 ? 80 : size <= 56 ? 112 : size <= 88 ? 176 : 240);
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-full bg-[#13312d]", className)} style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- already a sized thumbnail
        <img src={src} alt="" width={size} height={size} loading={lazy ? "lazy" : "eager"} decoding="async" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center font-semibold text-[#f5f1e8]/60" style={{ fontSize: size * 0.3 }}>
          {initials(person.name)}
        </span>
      )}
    </span>
  );
}

// Wraps the parts of `text` that match the search in teal.
export function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-transparent font-semibold text-[#3fcfca]">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export const contactHref = (person: Pick<PanelPerson, "messageTo">) => `/contact?to=${encodeURIComponent(person.messageTo)}`;
