import Image from "next/image";
import { BadgeCheck, Briefcase, Phone, UserRound } from "lucide-react";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import type { AlumniProfile } from "@/lib/types";

function getContactLinks(alumni: AlumniProfile) {
  return [
    alumni.facebook && { key: "facebook", label: "Facebook", href: alumni.facebook, icon: FacebookIcon },
    alumni.phone && { key: "phone", label: "Phone", href: `tel:${alumni.phone.replace(/[^0-9+]/g, "")}`, icon: Phone },
  ].filter((link): link is { key: string; label: string; href: string; icon: typeof Phone } => Boolean(link));
}

// Same template as MemberCard (EB / Sub-EB): wide photo with tier badge + club logo, then details.
export function AlumniCard({ alumni }: { alumni: AlumniProfile }) {
  const contactLinks = getContactLinks(alumni);

  return (
    <div className="glass-panel group h-full overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5">
      <div className="photo-backdrop aspect-[16/10] w-full">
        {alumni.photo ? (
          <Image
            src={alumni.photo}
            alt={alumni.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserRound className="h-10 w-10 text-white/30" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {alumni.tier}
        </div>
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
        <h3 className="text-lg font-bold text-white">{alumni.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-blue-400">
          <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
          {alumni.team} · {alumni.classYear}
        </p>
        {alumni.currentRole && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-400">
            <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {alumni.currentRole}
          </p>
        )}

        {alumni.quote && <p className="mt-3 text-sm italic text-slate-400">&ldquo;{alumni.quote}&rdquo;</p>}

        {contactLinks.length > 0 && (
          <div className="mt-4 flex justify-center gap-2 border-t border-white/10 pt-4">
            {contactLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={link.label}
                title={link.key === "phone" ? alumni.phone ?? undefined : undefined}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-white/25 hover:text-white"
              >
                <link.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
