import { ASK_ABOUT, ROLE_TOPICS, type DirectoryTopic } from "@/lib/contact-extras";
import { firstName } from "@/lib/contact-directory";
import { normaliseName, type CutoutFrame } from "@/lib/team-sheet";
import type { Member } from "@/lib/types";

// The panel as the Contact page shows it: header faces and "Who to contact".
// Names and photos only (never personal phone numbers or email addresses).

export interface PanelPerson {
  id: string;
  name: string; // "Md Sayedul Karim Sikder"
  firstName: string; // "Sayedul", for "Hi Sayedul, "
  role: string; // "Joint Secretary"
  askAbout: string | null;
  topics: DirectoryTopic[]; // filter tags, from the role
  photo: string | null;
  frame: CutoutFrame | null;
}

// A squad lead or department head: a member whose role names one. Plain "Sub-Executive" or
// "General Member" rows aren't contacts.
const LEAD = /\b(lead|head|captain|coordinator|director|manager|in[- ]charge|convenor)\b/i;

function toPerson(m: Member, frames: Record<string, CutoutFrame>): PanelPerson {
  const role = (m.designation ?? "Panel member").replace(/(\w)-(\w)/g, "$1 $2").trim();
  return {
    id: m.id,
    name: normaliseName(m.name),
    firstName: firstName(m.name),
    role,
    askAbout: ASK_ABOUT.find(([re]) => re.test(role))?.[1] ?? null,
    topics: Array.from(new Set(ROLE_TOPICS.filter(([re]) => re.test(role)).flatMap(([, topics]) => topics))),
    photo: m.photo,
    frame: m.photo ? (frames[m.photo] ?? null) : null,
  };
}

/** The executive committee, in panel order (header faces). */
export function panelPeople(members: Member[], frames: Record<string, CutoutFrame>, limit = 4): PanelPerson[] {
  return members
    .filter((m) => m.tier === "Executive")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit)
    .map((m) => toPerson(m, frames));
}

/** Members whose role makes them a contact (squad leads, department heads), after the executives. */
export function contactLeads(members: Member[]): Member[] {
  return members
    .filter((m) => m.tier !== "Executive" && m.tier !== "Faculty Advisor" && LEAD.test(m.designation ?? ""))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Everyone "Who to contact" lists: the executives, then any squad leads and department heads. */
export function contactPeople(members: Member[], frames: Record<string, CutoutFrame>): PanelPerson[] {
  return [...panelPeople(members, frames, 99), ...contactLeads(members).map((m) => toPerson(m, frames))].filter((p) => p.name.trim());
}
