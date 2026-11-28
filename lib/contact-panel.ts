import { ASK_ABOUT } from "@/lib/contact-extras";
import { firstName } from "@/lib/contact-directory";
import { normaliseName, type CutoutFrame } from "@/lib/team-sheet";
import type { Member } from "@/lib/types";

// The executive committee as the Contact page shows it: header faces and "Who to contact".
// Names and photos only (never personal phone numbers or email addresses).

export interface PanelPerson {
  id: string;
  name: string; // "Md Sayedul Karim Sikder"
  firstName: string; // "Sayedul", for "Hi Sayedul, "
  role: string; // "Joint Secretary"
  askAbout: string | null;
  photo: string | null;
  frame: CutoutFrame | null;
}

export function panelPeople(members: Member[], frames: Record<string, CutoutFrame>, limit = 4): PanelPerson[] {
  return members
    .filter((m) => m.tier === "Executive")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit)
    .map((m) => {
      const role = (m.designation ?? "Panel member").replace(/(\w)-(\w)/g, "$1 $2").trim();
      return {
        id: m.id,
        name: normaliseName(m.name),
        firstName: firstName(m.name),
        role,
        askAbout: ASK_ABOUT.find(([re]) => re.test(role))?.[1] ?? null,
        photo: m.photo,
        frame: m.photo ? (frames[m.photo] ?? null) : null,
      };
    });
}
