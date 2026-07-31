// Domain types mirroring the relational schema in SRS.md §6.
// Field names/shapes track the DB columns so mapping a Supabase row -> type is a no-op later.

export type EventStatus = "Upcoming" | "Running" | "Finished";

export interface Event {
  id: string;
  name: string;
  date: string; // ISO date
  venue: string;
  description: string;
  bannerImage: string | null;
  status: EventStatus;
  // Not in the documented SRS §6.3 schema (which scopes exactly the fields
  // above) — added for the event detail page's photo slider, overview
  // stats, and results panel. gallery falls back to [bannerImage] when
  // empty; endDate is null for single-day events; team/participant counts
  // and the result fields are null when not applicable or not yet known.
  gallery: string[];
  endDate: string | null; // ISO date — last day, for multi-day tournaments
  teamCount: number | null;
  participantCount: number | null;
  winners: string | null;
  runnersUp: string | null;
  prizePool: string | null;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  // Not in the documented SRS §6.2 schema (name/description only) — added to
  // match the reference design's team directory cards. bannerImage falls
  // back to a gradient placeholder when null; nickname/achievement fall
  // back to `name` / are hidden when null.
  bannerImage: string | null;
  nickname: string | null;
  achievement: string | null;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  photo: string | null;
  email: string;
  position: string;
  bio: string;
  sortOrder: number;
}

export type MemberTier = "Executive" | "Sub-Executive" | "General";

export interface Panel {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Member {
  id: string;
  panelId: string;
  name: string;
  photo: string | null;
  designation: string;
  tier: MemberTier;
  email: string;
  phone: string;
  additionalInfo: string | null;
  sortOrder: number;
}

export interface RegistrationSettings {
  isOpen: boolean;
  googleFormUrl: string | null;
  nextIntakeDate: string | null; // ISO date
}

export interface SiteContent {
  pageKey: string;
  content: string;
  featuredEventId: string | null;
}

// FR-3: Home quick-stats bar, computed from the DB (not hardcoded).
export interface QuickStats {
  memberCount: number;
  teamCount: number;
  eventCount: number;
  // Not DB-computed like the fields above — derived from the club's founding
  // year to fill the reference design's 4-stat layout (design reference/*.png).
  yearsOfExcellence: number;
}

// Not in the SRS §6 schema — the SRS scopes exactly 5 public pages (Home,
// Events, About Us, Team, Members) with no Alumni/Blog. Added on request;
// flag to product if these should become permanent, DB-backed sections.
export interface AlumniProfile {
  id: string;
  name: string;
  photo: string | null;
  graduationYear: number;
  // Which panel tier they served on while active — every graduating class
  // page groups its alumni into these two sections. No "General" tier here
  // (unlike MemberTier): alumni are shown by the panel role they held.
  tier: "Executive" | "Sub-Executive";
  team: string;
  currentRole: string;
  quote: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string | null;
  author: string;
  date: string; // ISO date
  readTimeMinutes: number;
}

// FR-52: admin action trail.
export interface AuditLogEntry {
  id: string;
  adminId: string | null;
  actorLabel: string | null;
  action: string;
  targetTable: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// Not in the SRS §6 schema — added for the About page's sponsors section.
export interface Sponsor {
  id: string;
  name: string;
  logo: string | null;
}
