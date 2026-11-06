"use client";

import { meaningfulDesignation } from "@/components/members/MemberCard";
import { memberLinks } from "@/components/members/memberLinks";
import { ProfileModal } from "@/components/ui/ProfileModal";
import type { Member } from "@/lib/types";

const TIER_LABEL: Record<Member["tier"], string> = {
  "Faculty Advisor": "Faculty advisor",
  Executive: "Executive committee",
  "Sub-Executive": "Sub-executive committee",
  General: "General member",
};

// Profile popup opened from a member card.
export function MemberProfileModal({ member, onClose }: { member: Member | null; onClose: () => void }) {
  return (
    <ProfileModal
      onClose={onClose}
      profile={
        member && {
          name: member.name,
          photo: member.photo,
          eyebrow: TIER_LABEL[member.tier],
          subtitle: meaningfulDesignation(member),
          links: memberLinks(member),
          body: member.additionalInfo && (
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-300">{member.additionalInfo}</p>
          ),
        }
      }
    />
  );
}
