import Image from "next/image";
import { BadgeCheck, Mail, Phone, UserRound } from "lucide-react";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import type { Player } from "@/lib/types";

function getContactLinks(player: Player) {
  return [
    player.facebook && { key: "facebook", label: "Facebook", href: player.facebook, icon: FacebookIcon },
    { key: "email", label: "Email", href: `mailto:${player.email}`, icon: Mail },
    player.phone && { key: "phone", label: "Phone", href: `tel:${player.phone}`, icon: Phone },
  ].filter((link): link is { key: string; label: string; href: string; icon: typeof Mail } => Boolean(link));
}

// Jersey numbers are stored at the end of the position, e.g. "Libero (L) · #19".
function splitPosition(position: string) {
  const match = position.match(/^(.*?)\s*·\s*#(.+)$/);
  return match ? { role: match[1], jersey: match[2] } : { role: position, jersey: null };
}

// Mirrors MemberCard so the roster and the members page share one card style.
export function PlayerCard({ player }: { player: Player }) {
  const { role, jersey } = splitPosition(player.position);

  return (
    <div className="glass-panel group overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5">
      <div className="photo-backdrop aspect-[16/10] w-full">
        {player.photo ? (
          <Image
            src={player.photo}
            alt={player.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserRound className="h-10 w-10 text-white/30" strokeWidth={1.5} />
          </div>
        )}
        {jersey && (
          <div className="absolute right-3 top-3 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            #{jersey}
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

      <div className="p-5">
        <h3 className="text-lg font-bold text-white">{player.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-blue-400">
          <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
          {role}
        </p>

        <div className="mt-4 flex justify-center gap-2 border-t border-white/10 pt-4">
          {getContactLinks(player).map((link) => (
            <a
              key={link.key}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={link.label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-white/25 hover:text-white"
            >
              <link.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
