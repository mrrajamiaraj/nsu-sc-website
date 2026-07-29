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
}

export interface Team {
  id: string;
  name: string;
  description: string;
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
}
