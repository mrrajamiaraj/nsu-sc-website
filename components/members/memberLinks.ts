import type { ComponentType } from "react";
import { Mail, Phone } from "lucide-react";
import { FacebookIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { telHref } from "@/lib/utils";
import type { Member } from "@/lib/types";

export interface MemberLink {
  key: string;
  label: string;
  value: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

// Only the contact options that were actually filled in.
export function memberLinks(member: Member): MemberLink[] {
  const links: (MemberLink | null)[] = [
    member.facebook
      ? { key: "facebook", label: "Facebook", value: "Facebook profile", href: member.facebook, icon: FacebookIcon }
      : null,
    member.linkedin
      ? { key: "linkedin", label: "LinkedIn", value: "LinkedIn profile", href: member.linkedin, icon: LinkedinIcon }
      : null,
    member.email ? { key: "email", label: "Email", value: member.email, href: `mailto:${member.email}`, icon: Mail } : null,
    member.phone ? { key: "phone", label: "Phone", value: member.phone, href: telHref(member.phone), icon: Phone } : null,
  ];
  return links.filter((link): link is MemberLink => link !== null);
}

export const isExternal = (href: string) => href.startsWith("http");
