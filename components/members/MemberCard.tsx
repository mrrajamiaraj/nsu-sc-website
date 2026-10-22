import { BadgeCheck, Mail, Phone } from "lucide-react";
import { ContactLinks, ProfilePhoto } from "@/components/ui/ProfileCard";
import { FacebookIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { telHref } from "@/lib/utils";
import type { Member } from "@/lib/types";

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/members?$/, "");

// A designation that only restates the tier ("Sub-Executive", "General Member") adds nothing
// under a section heading that already says it; real titles like "President" still show.
function meaningfulDesignation(member: Member) {
  if (!member.designation) return null;
  return normalize(member.designation) === normalize(member.tier) ? null : member.designation;
}

// The tier is shown by the section heading, so the photo only carries a badge when one is
// passed explicitly.
export function MemberCard({ member, badge }: { member: Member; badge?: string }) {
  const designation = meaningfulDesignation(member);

  return (
    <div className="glass-panel group h-full overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5">
      <ProfilePhoto src={member.photo} alt={member.name} badge={badge} />

      <div className="p-5">
        <h3 className="text-lg font-bold text-white">{member.name}</h3>
        {designation && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-blue-400">
            <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
            {designation}
          </p>
        )}

        <ContactLinks
          links={[
            member.facebook && { key: "facebook", label: "Facebook", href: member.facebook, icon: FacebookIcon },
            member.linkedin && { key: "linkedin", label: "LinkedIn", href: member.linkedin, icon: LinkedinIcon },
            member.email && { key: "email", label: "Email", href: `mailto:${member.email}`, icon: Mail },
            member.phone && { key: "phone", label: "Phone", href: telHref(member.phone), icon: Phone },
          ]}
        />
      </div>
    </div>
  );
}
