import { DIRECTORY_ROLES, type DirectoryTopic } from "@/lib/contact-extras";
import { titleCase } from "@/lib/matchday";
import type { Member, Team } from "@/lib/types";

// "Who to contact" rows: each role is filled from the active panel when a member's
// designation matches it; otherwise the name stays a placeholder. Contact details are
// only those the Members page already shows publicly.

export interface DirectoryRow {
  key: string;
  role: string;
  name: string | null;
  photo: string | null;
  topics: DirectoryTopic[];
  email: string | null;
  whatsapp: string | null; // wa.me link built from the member's published phone
  linkedin: string | null;
  firstName: string | null; // for greetings: "Hi Sayedul, "
  bio: string | null; // the member's "additional info" from the panel list
  sports: string[]; // squads this role covers (known for squad leads)
}

// The name to greet someone by, skipping honorific prefixes ("MD SAYEDUL …" -> "Sayedul").
const PREFIXES = new Set(["md", "md.", "mohammad", "mohammed", "muhammad", "mohd", "mr", "mr.", "ms", "ms.", "mrs", "mrs.", "dr", "dr."]);
export function firstName(name: string): string {
  const words = titleCase(name).split(/\s+/).filter(Boolean);
  return words.find((word) => !PREFIXES.has(word.toLowerCase())) ?? words[0] ?? name;
}

// "+880 1712-345678" or "01712345678" -> "https://wa.me/8801712345678"
function whatsappLink(phone: string | null): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) digits = `88${digits}`;
  return digits.length >= 11 ? `https://wa.me/${digits}` : null;
}

function fromMember(member: Member | undefined) {
  return {
    name: member ? titleCase(member.name) : null, // names typed in capitals read as names
    photo: member?.photo ?? null,
    email: member?.email ?? null,
    whatsapp: whatsappLink(member?.phone ?? null),
    linkedin: member?.linkedin ?? null,
    firstName: member ? firstName(member.name) : null,
    bio: member?.additionalInfo?.trim() || null,
  };
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Squad names without the Male/Female suffix, in roster order: "Football", "Cricket", …
function sports(teams: Team[]): string[] {
  return Array.from(new Set(teams.map((team) => team.name.replace(/\s+(Male|Female)$/i, "").trim())));
}

export function directoryRows(members: Member[], teams: Team[]): DirectoryRow[] {
  const used = new Set<string>();
  const find = (match: RegExp | null) => {
    if (!match) return undefined;
    const member = members.find((m) => m.designation && match.test(m.designation) && !used.has(m.id));
    if (member) used.add(member.id);
    return member;
  };

  const roles = DIRECTORY_ROLES.map((entry) => ({
    key: entry.role,
    role: entry.role,
    topics: entry.topics,
    sports: [] as string[],
    ...fromMember(find(entry.match)),
  }));

  const leads = sports(teams).map((sport) => {
    const pattern = new RegExp(`${escapeRegExp(sport)}.*(lead|captain)`, "i");
    return {
      key: `lead-${sport}`,
      role: `${sport} squad lead`,
      topics: ["squads", "trials"] as DirectoryTopic[],
      sports: [sport],
      ...fromMember(find(pattern)),
    };
  });

  return [...roles, ...leads];
}
