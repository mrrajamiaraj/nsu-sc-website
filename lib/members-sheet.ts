import type { CutoutFrame } from "@/lib/team-sheet";
import type { Member, MemberTier } from "@/lib/types";

// "The Panel Album": the active panel shaped for the Members page, built on the server.
// Each card back shows the details the member has on record. Phone and WhatsApp leave this
// file only for members with "Show phone publicly" on.

export type TierKey = "advisor" | "executive" | "sub-executive" | "general";
export const TIER_KEYS: TierKey[] = ["advisor", "executive", "sub-executive", "general"];
export type TierFilter = TierKey | "all";
/** Hero counters and the 1-5 keys, in this order. */
export const TIER_FILTERS: TierFilter[] = ["all", "advisor", "executive", "sub-executive", "general"];

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

/** The three album pages. The advisor sits with the executives on Leadership. */
export type AlbumPage = "leadership" | "sub-executive" | "general";
export const ALBUM_PAGES: { key: AlbumPage; title: string; intro: string }[] = [
  { key: "leadership", title: "Leadership", intro: "The people steering the club." },
  { key: "sub-executive", title: "Sub-Executives", intro: "The team behind every event." },
  { key: "general", title: "General Members", intro: "The squad that makes it happen." },
];

export interface PanelContact {
  key: "facebook" | "instagram" | "linkedin" | "email" | "phone" | "whatsapp";
  value: string; // what the row shows: "facebook.com/eraj.chowdhury", the address, the number
  href: string;
  copy: string | null; // what Copy puts on the clipboard (email and phone only)
}

/** A squad the member plays for, from the admin's Sport field or the squad rosters. */
export interface PanelSquad {
  sport: string; // "Football"
  href: string | null; // the team page, when the squad is on the roster
}

export interface PanelPerson {
  id: string;
  slug: string; // ?person=<slug>
  name: string; // "Md. Sayedul Karim Sikder"
  tier: TierKey;
  page: AlbumPage;
  role: string | null; // "President"; null when the designation only repeats the tier
  captain: boolean; // the president wears the armband
  department: string | null;
  batch: string | null;
  squads: PanelSquad[]; // the admin's Sport first, then every squad roster they're on
  bio: string | null;
  photo: string | null; // full cut-out
  thumb: string | null; // small round head-and-shoulders WebP
  frame: CutoutFrame | null;
  contacts: PanelContact[];
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

// ---- Socials

const TRACKING = /^(utm_|fbclid$|mibextid$|igshid$|si$|ref$|rdid$|share_url$)/i;

/** Full canonical profile URL, or null for links that can't be made canonical (facebook.com/share/…). */
export function canonicalSocial(url: string | null, key: "facebook" | "linkedin" | "instagram"): string | null {
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
  } else if (key === "instagram") {
    if (!/(^|\.)instagram\.com$/i.test(u.hostname)) return null;
    u.hostname = "www.instagram.com";
    u.search = "";
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

// What a profile row shows: "facebook.com/eraj.chowdhury".
const shortUrl = (href: string) => decodeURIComponent(href.replace(/^https:\/\/(www\.)?/, ""));

// "+880 1712-345678" or "01712345678" -> "8801712345678" for wa.me; null if it isn't a number.
function waNumber(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) digits = `88${digits}`;
  return digits.length >= 11 && digits.length <= 15 ? digits : null;
}

function contactsOf(m: Member): PanelContact[] {
  const out: PanelContact[] = [];
  const social = (key: "facebook" | "instagram" | "linkedin", raw: string | null) => {
    const href = canonicalSocial(raw, key);
    if (href) out.push({ key, value: shortUrl(href), href, copy: null });
  };
  social("facebook", m.facebook);
  social("instagram", m.instagram);
  social("linkedin", m.linkedin);
  const email = m.email?.trim();
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) out.push({ key: "email", value: email, href: `mailto:${email}`, copy: email });
  if (m.showPhonePublicly) {
    const phone = m.phone?.trim();
    if (phone) out.push({ key: "phone", value: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}`, copy: phone });
    const wa = waNumber(m.whatsapp?.trim() || phone || "");
    if (wa) out.push({ key: "whatsapp", value: m.whatsapp?.trim() || phone || wa, href: `https://wa.me/${wa}`, copy: null });
  }
  return out;
}

// ---- Squads

/** Name key for matching a member to a squad roster: "MD Sayedul Karim Sikder" -> "sayedulkarimsikder". */
export const rosterKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/^(md\.?|mohammad|mohammed|muhammad)\s*/, "")
    .replace(/[^a-z]/g, "");

// ---- Portrait thumbnails

export const thumbUrl = (photo: string | null, size = 176) => (photo ? `/api/portrait?src=${encodeURIComponent(photo)}&s=${size}` : null);

// ---- The sheet

const TIER_RANK: Record<TierKey, number> = { advisor: 0, executive: 1, "sub-executive": 2, general: 3 };

// Leadership order for the formation: president first, then general secretary, then the rest.
const OFFICE_RANK = (role: string | null) => (!role ? 9 : /president/i.test(role) ? 0 : /general secretary/i.test(role) ? 1 : /treasurer/i.test(role) ? 2 : /joint/i.test(role) ? 3 : 5);

/**
 * The panel, in album order. `rosters` maps rosterKey(player name) to the squads they play
 * for, so a member who is also on a squad gets its sport icon and team link.
 */
export function panelSheet(members: Member[], frames: Record<string, CutoutFrame>, rosters: Map<string, PanelSquad[]> = new Map()): PanelPerson[] {
  const used = new Set<string>();
  return members
    .map((m) => {
      const tier = TIER_OF[m.tier];
      const name = normaliseMemberName(m.name);
      let slug = slugOf(name) || "member";
      for (let n = 2; used.has(slug); n++) slug = `${slugOf(name)}-${n}`;
      used.add(slug);
      const role = roleOf(m.designation, tier);
      const onRoster = rosters.get(rosterKey(m.name)) ?? [];
      const sport = m.sport?.trim();
      const own = sport ? [{ sport, href: onRoster.find((s) => s.sport.toLowerCase() === sport.toLowerCase())?.href ?? null }] : [];
      const squads = [...own, ...onRoster.filter((s) => !own.some((o) => o.sport.toLowerCase() === s.sport.toLowerCase()))];
      const last = name.split(" ").pop() ?? name;
      return {
        id: m.id,
        slug,
        name,
        tier,
        page: (tier === "advisor" || tier === "executive" ? "leadership" : tier) as AlbumPage,
        role,
        captain: /^president$/i.test(role ?? ""),
        department: m.department?.trim() || null,
        batch: m.batch?.trim() || null,
        squads,
        bio: m.additionalInfo?.trim() || null,
        photo: m.photo,
        thumb: thumbUrl(m.photo),
        frame: m.photo ? (frames[m.photo] ?? null) : null,
        contacts: contactsOf(m),
        messageTo: tier === "advisor" ? `Mr. ${last}` : greetingName(name),
        sortOrder: m.sortOrder,
      };
    })
    .sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || OFFICE_RANK(a.role) - OFFICE_RANK(b.role) || a.name.localeCompare(b.name))
    .map((person) => {
      const { sortOrder, ...rest } = person;
      void sortOrder;
      return rest;
    });
}
