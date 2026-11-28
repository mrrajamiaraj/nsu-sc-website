import { FacebookIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import type { PanelSocial } from "@/lib/members-sheet";

export function SocialIcon({ kind, className }: { kind: PanelSocial["key"]; className?: string }) {
  return kind === "facebook" ? <FacebookIcon className={className} /> : <LinkedinIcon className={className} />;
}

export const SOCIAL_LABEL: Record<PanelSocial["key"], string> = { facebook: "Facebook", linkedin: "LinkedIn" };
