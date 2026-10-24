import Image from "next/image";
import { Mail, Phone, UserRound } from "lucide-react";
import { ContactLinks } from "@/components/ui/ProfileCard";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { telHref } from "@/lib/utils";
import type { Player } from "@/lib/types";

// Jersey numbers are stored at the end of the position, e.g. "Libero (L) · #19".
function splitPosition(position: string) {
  const match = position.match(/^(.*?)\s*·\s*#(.+)$/);
  return match ? { role: match[1], jersey: match[2] } : { role: position, jersey: null };
}

// "Captain, Libero (L)" -> captaincy badge + positions with their short codes.
function parseRole(role: string) {
  const parts = role.split(",").map((part) => part.trim()).filter(Boolean);
  const captaincy = parts.find((part) => /captain/i.test(part));
  const positions = parts
    .filter((part) => part !== captaincy)
    .map((part) => {
      const match = part.match(/^(.*?)\s*\(([^)]+)\)$/);
      return match ? { label: match[1], code: match[2] } : { label: part, code: null };
    });
  return {
    captain: captaincy ? { short: /vice/i.test(captaincy) ? "VC" : "C", label: captaincy } : null,
    positions,
  };
}

export function PlayerCard({ player }: { player: Player }) {
  const { role, jersey } = splitPosition(player.position);
  const { captain, positions } = parseRole(role);
  const eyebrow = positions.map((position) => position.label).join(" / ") || captain?.label;
  const code = positions.find((position) => position.code)?.code;

  return (
    <article className="glass-panel group relative flex h-full flex-col overflow-hidden transition-[transform,border-color,box-shadow] duration-500 ease-out hover:border-blue-400/40 hover:shadow-glow focus-within:border-blue-400/40 motion-safe:hover:-translate-y-1">
      <div className="photo-backdrop aspect-[4/5] w-full">
        {player.photo ? (
          <Image
            src={player.photo}
            alt={player.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserRound className="h-12 w-12 text-white/30" strokeWidth={1.25} />
          </div>
        )}

        {/* Outlined jersey number, set like a kit print. */}
        {jersey && (
          <span
            aria-hidden
            className="pointer-events-none absolute -right-1 top-1 select-none font-display text-[7.5rem] font-bold leading-none text-transparent opacity-70 transition-opacity duration-500 [-webkit-text-stroke:1.5px_rgba(255,255,255,0.45)] group-hover:opacity-100"
          >
            {jersey}
          </span>
        )}

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-night-950/40 p-1.5 backdrop-blur-md">
            <Image
              src="/images/branding/nsu-sc-logo.png"
              alt="NSU SC"
              width={64}
              height={64}
              className="h-full w-full object-contain"
            />
          </div>
          {captain && (
            <span
              title={captain.label}
              className="flex h-9 min-w-9 items-center justify-center rounded-full bg-brand-gradient px-2 font-display text-base font-bold text-night-950 shadow-glow"
            >
              {captain.short}
              <span className="sr-only"> ({captain.label})</span>
            </span>
          )}
        </div>

        {/* Scrim so the name stays legible over any photo. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-night-950 via-night-950/70 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5">
          {eyebrow && (
            <p className="flex items-center gap-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-blue-300">
              {code && (
                <span className="rounded border border-blue-400/40 bg-blue-400/10 px-1.5 py-px text-blue-200">{code}</span>
              )}
              <span className="truncate">{eyebrow}</span>
            </p>
          )}
          <h3 className="mt-2 line-clamp-2 font-display text-[1.75rem] font-semibold uppercase leading-[0.95] tracking-[0.01em] text-white">
            {player.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5">
        <div className="mt-auto pt-4">
          <ContactLinks
            className="mt-0 justify-start border-t-0 pt-0"
            links={[
              player.facebook && { key: "facebook", label: `${player.name} on Facebook`, href: player.facebook, icon: FacebookIcon },
              { key: "email", label: `Email ${player.name}`, href: `mailto:${player.email}`, icon: Mail },
              player.phone && { key: "phone", label: `Call ${player.name}`, href: telHref(player.phone), icon: Phone },
            ]}
          />
        </div>
      </div>

      {/* Brand-gradient underline that draws in on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-brand-gradient transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
    </article>
  );
}
