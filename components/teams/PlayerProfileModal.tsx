"use client";

import { memberLinks } from "@/components/members/memberLinks";
import { parseRole, splitPosition } from "@/components/teams/PlayerCard";
import { ProfileModal } from "@/components/ui/ProfileModal";
import type { Player } from "@/lib/types";

// Profile popup opened from a player card: same layout as the member popup.
export function PlayerProfileModal({ player, onClose }: { player: Player | null; onClose: () => void }) {
  return <ProfileModal onClose={onClose} profile={player && toProfile(player)} />;
}

function toProfile(player: Player) {
  const { role, jersey } = splitPosition(player.position);
  const { captain, positions } = parseRole(role);
  const positionLabel = positions.map((position) => position.label).join(" / ");

  return {
    name: player.name,
    photo: player.photo,
    eyebrow: positionLabel || captain?.label || "Player",
    subtitle: [positionLabel && captain?.label, jersey && `#${jersey}`].filter(Boolean).join(" · "),
    links: memberLinks(player),
    body: player.bio && <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-300">{player.bio}</p>,
  };
}
