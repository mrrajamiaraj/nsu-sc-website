"use client";

import { memberLinks } from "@/components/members/memberLinks";
import { ProfileModal } from "@/components/ui/ProfileModal";
import type { AlumniProfile } from "@/lib/types";

const TIER_LABEL: Record<AlumniProfile["tier"], string> = {
  Executive: "Executive committee",
  "Sub-Executive": "Sub-executive committee",
};

// Profile popup opened from an alumni card: same layout as the member popup.
export function AlumniProfileModal({ alumni, onClose }: { alumni: AlumniProfile | null; onClose: () => void }) {
  return (
    <ProfileModal
      onClose={onClose}
      profile={
        alumni && {
          name: alumni.name,
          photo: alumni.photo,
          eyebrow: `${TIER_LABEL[alumni.tier]} · Panel ${alumni.classYear}`,
          subtitle: alumni.team,
          links: memberLinks(alumni),
          body: (alumni.currentRole || alumni.quote) && (
            <div className="mt-5">
              {alumni.currentRole && (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">Currently</p>
                  <p className="mt-1 text-sm font-medium text-slate-200">{alumni.currentRole}</p>
                </>
              )}
              {alumni.quote && (
                <p className={`text-sm italic leading-relaxed text-slate-400 ${alumni.currentRole ? "mt-3" : ""}`}>
                  &ldquo;{alumni.quote}&rdquo;
                </p>
              )}
            </div>
          ),
        }
      }
    />
  );
}
