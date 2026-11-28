import type { CutoutFrame } from "@/lib/team-sheet";
import type { Member, MemberTier } from "@/lib/types";

// "The squad sheet": the active panel shaped for the Members page, built on the server.
// Phone numbers and emails never leave this file: the page only gets names, roles, photos
// and the social links each tier is allowed to show.

export type TierKey = "advisor" | "executive" | "sub-executive" | "general";
export const TIER_KEYS: TierKey[] = ["advisor", "executive", "sub-executive", "general"];

export const TIER_LABEL: Record<TierKey, { one: string; many: string; short: string }> = {
  advisor: { one: "Faculty advisor", many: "Advisor", short: "Advisor" },
  executive: { one: "Executive", many: "Executive", short: "Executive" },
  "sub-executive": { one: "Sub-executive", many: "Sub-executive", short: "Sub-exec" },
  general: { one: "General member", many: "General", short: "General" },
};

const TIER_OF: Record<MemberTier, TierKey> = {
  "Faculty Advisor": "advisor",
  Executive: "executive",
  "Sub-Executive": "sub-executive",
  General: "general",
};

export interface PanelSocial {
  key: "facebook" | "linkedin";
  href: string;
}

export interface PanelPerson {
  id: string;
  slug: string; // ?person=<slug>
  name: string; // "Md. Sayedul Karim Sikder"
  tier: TierKey;
  role: string | null; // "President"; null when the designation only repeats the tier
  department: string | null;
  sport: string | null;
  study: string | null; // batch / department of study
  askAbout: string[]; // "partnerships", "finance"
  photo: string | null; // full cut-out (drawer, formation)
  thumb: string | null; // small round head-and-shoulders WebP (grids, list)
  frame: CutoutFrame | null;
  socials: PanelSocial[];
  messageTo: string; // greeting name for /contact?to=
}

// ---- Names

const HONORIFIC: Record<string, string> = { md: "Md.", mr: "Mr.", mrs: "Mrs.", ms: "Ms.", dr: "Dr." };

function fixWord(word: string): string {
  const bare = word.replace(/\.$/, "").toLowerCase();
  if (HONORIFIC[bare]) return HONORIFIC[bare];
  if (/^[A-Za-z]\.?$/.test(word)) return word.toUpperCase(); // initials: "N", "A."
  const letters = word.replace(/[^A-Za-z]/g, "");
  // Shouted or all-lowercase words get title case; mixed case ("McKenzie") is left alone.
  if (letters === letters.toUpperCase() || letters === letters.toLowerCase()) {
    return word.toLowerCase().replace(/(^|[-'(])([a-z])/g, (_, a: string, b: string) => a + b.toUpperCase());
  }
  return word;
}

/** "MD SAYEDUL KARIM SIKDER" -> "Md. Sayedul Karim Sikder", "Md.Shamiul" -> "Md. Shamiul". */
export function normaliseMemberName(name: string): string {
  return name
    .replace(/\b([A-Za-z]{1,3})\.(?=[A-Za-z])/g, "$1. ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(fixWord)
    .join(" ");
}

const SKIP_FOR_GREETING = new Set(["md.", "mr.", "mrs.", "ms.", "dr.", "mohammad", "mohammed", "muhammad", "muhammed"]);

// "Md. Sayedul Karim Sikder" -> "Sayedul". Single initials are skipped too ("S M Nayeem" -> "Nayeem").
export function greetingName(name: string): string {
  const words = name.split(" ");
  return words.find((w) => !SKIP_FOR_GREETING.has(w.toLowerCase()) && w.replace(/\./g, "").length > 1) ?? words[0];
}

const slugOf = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ---- Roles

function roleOf(designation: string | null, tier: TierKey): string | null {
  if (!designation) return null;
  const role = normaliseMemberName(designation).replace(/Joint-Secretary/i, "Joint Secretary").replace(/ And /g, " & ");
  // "Sub-Executive" and "General Member" only repeat the tier.
  if (/^(sub-executive|general member|member)$/i.test(role)) return null;
  if (tier === "advisor") return "Faculty Advisor";
  return role;
}

// What each office handles, from its title. A guide for who to ask, not a job description;
// replace with what the panel actually agrees.
function askAboutFor(role: string | null): string[] {
  if (!role) return [];
  const out: string[] = [];
  if (/faculty advisor/i.test(role)) out.push("university approvals", "the club's faculty contact");
  if (/president/i.test(role)) out.push("the club's direction", "partnerships");
  if (/general secretary/i.test(role)) out.push("club operations", "panel matters");
  if (/treasurer/i.test(role)) out.push("finance", "payments and receipts");
  if (/joint secretary/i.test(role)) out.push("events", "day-to-day coordination");
  return Array.from(new Set(out));
}

// Department, sport and study aren't recorded yet. Fill these by member id once the panel
// confirms them; the page groups and filters by them automatically.
const DETAILS: Record<string, { department?: string; sport?: string; study?: string }> = {};

// ---- Socials

// Sub-executives and general members show social links only once they opt in (by member id).
// Advisor and executives hold public office, so theirs show.
const SOCIALS_OPT_IN = new Set<string>([]);

const TRACKING = /^(utm_|fbclid$|mibextid$|igshid$|si$|ref$|rdid$|share_url$)/i;

/** Full canonical profile URL, or null for links that can't be made canonical (facebook.com/share/…). */
export function canonicalSocial(url: string | null, key: PanelSocial["key"]): string | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`);
  } catch {
    return null;
  }
  if (key === "facebook") {
    if (!/(^|\.)facebook\.com$|(^|\.)fb\.com$/i.test(u.hostname)) return null;
    // Share links are opaque redirects with no profile in them.
    if (/^\/share\//.test(u.pathname)) return null;
    u.hostname = "www.facebook.com";
    const id = u.pathname === "/profile.php" ? u.searchParams.get("id") : null;
    u.search = id ? `?id=${id}` : "";
  } else {
    if (!/(^|\.)linkedin\.com$/i.test(u.hostname)) return null;
    u.hostname = "www.linkedin.com";
    Array.from(u.searchParams.keys()).forEach((k) => TRACKING.test(k) && u.searchParams.delete(k));
    u.search = "";
  }
  u.hash = "";
  u.protocol = "https:";
  return u.toString().replace(/\/$/, "");
}

// ---- Portrait thumbnails

export const thumbUrl = (photo: string | null, size = 176) => (photo ? `/api/portrait?src=${encodeURIComponent(photo)}&s=${size}` : null);

// ---- The sheet

const TIER_RANK: Record<TierKey, number> = { advisor: 0, executive: 1, "sub-executive": 2, general: 3 };

// Leadership order for the formation: president first, then general secretary, then the rest.
const OFFICE_RANK = (role: string | null) => (!role ? 9 : /president/i.test(role) ? 0 : /general secretary/i.test(role) ? 1 : /treasurer/i.test(role) ? 2 : /joint/i.test(role) ? 3 : 5);

export function panelSheet(members: Member[], frames: Record<string, CutoutFrame>): PanelPerson[] {
  const used = new Set<string>();
  return members
    .map((m) => {
      const tier = TIER_OF[m.tier];
      const name = normaliseMemberName(m.name);
      let slug = slugOf(name) || "member";
      for (let n = 2; used.has(slug); n++) slug = `${slugOf(name)}-${n}`;
      used.add(slug);
      const role = roleOf(m.designation, tier);
      const showSocials = tier === "advisor" || tier === "executive" || SOCIALS_OPT_IN.has(m.id);
      const socials = showSocials
        ? ([
            { key: "facebook", href: canonicalSocial(m.facebook, "facebook") },
            { key: "linkedin", href: canonicalSocial(m.linkedin, "linkedin") },
          ].filter((s) => s.href) as PanelSocial[])
        : [];
      const details = DETAILS[m.id] ?? {};
      const last = name.split(" ").pop() ?? name;
      return {
        id: m.id,
        slug,
        name,
        tier,
        role,
        department: details.department ?? null,
        sport: details.sport ?? null,
        study: details.study ?? null,
        askAbout: askAboutFor(role),
        photo: m.photo,
        thumb: thumbUrl(m.photo),
        frame: m.photo ? (frames[m.photo] ?? null) : null,
        socials,
        messageTo: tier === "advisor" ? `Mr. ${last}` : greetingName(name),
        sortOrder: m.sortOrder,
      };
    })
    .sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || OFFICE_RANK(a.role) - OFFICE_RANK(b.role) || a.name.localeCompare(b.name))
    .map(({ sortOrder: _sortOrder, ...person }) => person);
}
