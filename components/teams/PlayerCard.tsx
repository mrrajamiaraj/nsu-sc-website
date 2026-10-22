import { BadgeCheck, Mail, Phone } from "lucide-react";
import { ContactLinks, ProfilePhoto } from "@/components/ui/ProfileCard";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { telHref } from "@/lib/utils";
import type { Player } from "@/lib/types";

// Jersey numbers are stored at the end of the position, e.g. "Libero (L) · #19".
function splitPosition(position: string) {
  const match = position.match(/^(.*?)\s*·\s*#(.+)$/);
  return match ? { role: match[1], jersey: match[2] } : { role: position, jersey: null };
}

export function PlayerCard({ player }: { player: Player }) {
  const { role, jersey } = splitPosition(player.position);

  return (
    <div className="glass-panel group h-full overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5">
      <ProfilePhoto src={player.photo} alt={player.name} badge={jersey && `#${jersey}`} imageClassName="object-top" />

      <div className="p-5">
        <h3 className="text-lg font-bold text-white">{player.name}</h3>
        {/* The jersey number is the "#19" tag on the photo; here just the position. */}
        <p className="mt-1 flex items-center gap-1.5 text-sm text-blue-400">
          <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
          {jersey ? role.replace(/\s*\([^)]*\)$/, "") : role}
        </p>

        <ContactLinks
          links={[
            player.facebook && { key: "facebook", label: "Facebook", href: player.facebook, icon: FacebookIcon },
            { key: "email", label: "Email", href: `mailto:${player.email}`, icon: Mail },
            player.phone && { key: "phone", label: "Phone", href: telHref(player.phone), icon: Phone },
          ]}
        />
      </div>
    </div>
  );
}
