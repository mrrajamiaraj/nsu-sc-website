"use client";

import { Cutout, Silhouette, initials } from "@/components/teams/announcement/Cutout";
import type { RelayPerson } from "@/lib/alumni-relay";
import { cn } from "@/lib/utils";

// "Is this you? Update your details": the drawer and the line-up hand a name and panel to the
// update form at the bottom of the page.
export const UPDATE_EVENT = "nsusc:alumni-update"; // detail: { name, role, panel }
export type UpdateDetail = { name: string; role: string; panel: string };
export function askForUpdate(detail: UpdateDetail) {
  window.dispatchEvent(new CustomEvent<UpdateDetail>(UPDATE_EVENT, { detail }));
  document.getElementById("update-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Baton({ className, spin = false }: { className?: string; spin?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn(className, spin && "motion-safe:animate-[spin_0.9s_ease-in-out_1]")}>
      <g transform="rotate(-35 12 12)">
        <rect x="3" y="9.5" width="18" height="5" rx="2.5" fill="#3fcfca" />
        <rect x="9" y="9.5" width="6" height="5" fill="#002e2c" opacity="0.35" />
      </g>
    </svg>
  );
}

/**
 * Round portrait: the cut-out framed head-and-shoulders inside a circle. Duotone green by
 * default; full colour when `colour` is on (the parent's hover or focus).
 */
export function RoundPortrait({ person, size, colour = false, className }: { person: Pick<RelayPerson, "photo" | "frame" | "name">; size: number; colour?: boolean; className?: string }) {
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-full bg-[#13312d]", className)} style={{ width: size, height: size }}>
      {person.photo ? (
        <>
          <span className={cn("absolute inset-0 block transition-[filter] duration-300", !colour && "grayscale")}>
            <Cutout person={person} boxRatio={1} fill={1.7} align="top" sizes={`${size * 2}px`} />
          </span>
          {/* Duotone: a teal wash over the greyscale cut-out, lifted on hover. */}
          <span aria-hidden className={cn("absolute inset-0 bg-[#3fcfca] mix-blend-multiply transition-opacity duration-300", colour ? "opacity-0" : "opacity-50")} />
        </>
      ) : (
        <>
          <Silhouette />
          <span aria-hidden className="absolute inset-0 flex items-center justify-center pb-[8%] font-display font-extrabold text-[#f5f1e8]/60" style={{ fontSize: size * 0.26 }}>
            {initials(person.name)}
          </span>
        </>
      )}
    </span>
  );
}

export const nowLine = (p: Pick<RelayPerson, "now">) => (p.now ? `Now: ${p.now}` : null);
