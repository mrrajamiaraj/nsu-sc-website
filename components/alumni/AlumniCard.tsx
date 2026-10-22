import { BadgeCheck, Briefcase, Phone } from "lucide-react";
import { ContactLinks, ProfilePhoto } from "@/components/ui/ProfileCard";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { telHref } from "@/lib/utils";
import type { AlumniProfile } from "@/lib/types";

export function AlumniCard({ alumni }: { alumni: AlumniProfile }) {
  return (
    <div className="glass-panel group h-full overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5">
      {/* Sources are already lossy WebP; the default quality of 75 re-compresses them visibly. */}
      <ProfilePhoto src={alumni.photo} alt={alumni.name} badge={alumni.tier} quality={90} />

      <div className="p-5">
        <h3 className="text-lg font-bold text-white">{alumni.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-blue-400">
          <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
          {alumni.team ? `${alumni.team} · ${alumni.classYear}` : alumni.classYear}
        </p>
        {alumni.currentRole && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-400">
            <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {alumni.currentRole}
          </p>
        )}

        {alumni.quote && <p className="mt-3 text-sm italic text-slate-400">&ldquo;{alumni.quote}&rdquo;</p>}

        <ContactLinks
          links={[
            alumni.facebook && { key: "facebook", label: "Facebook", href: alumni.facebook, icon: FacebookIcon },
            alumni.phone && {
              key: "phone",
              label: "Phone",
              href: telHref(alumni.phone),
              icon: Phone,
              title: alumni.phone,
            },
          ]}
        />
      </div>
    </div>
  );
}
