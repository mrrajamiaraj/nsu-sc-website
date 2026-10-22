// Domain types. Field names follow the database columns (camelCased by lib/mappers.ts).

export type EventStatus = "Upcoming" | "Running" | "Finished";

export interface Event {
  id: string;
  name: string;
  date: string | null; // ISO date; null when unknown (older imported events)
  yearOnly: boolean; // only the year of `date` is known
  endDate: string | null; // last day of a multi-day event; null for single-day events
  venue: string | null;
  description: string;
  bannerImage: string | null;
  gallery: string[];
  status: EventStatus;
  teamCount: number | null;
  participantCount: number | null;
  winners: string | null;
  runnersUp: string | null;
  secondRunnerUp: string | null;
  manOfTournament: string | null;
  prizePool: string | null;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  bannerImage: string | null;
  nickname: string | null;
  achievement: string | null;
}

export type PlayerGender = "Male" | "Female";

export interface Player {
  id: string;
  teamId: string;
  name: string;
  photo: string | null;
  email: string;
  phone: string | null;
  facebook: string | null;
  position: string; // free text; may carry a jersey number ("Libero (L) · #19") or a staff role
  bio: string;
  sortOrder: number;
  gender: PlayerGender | null; // set on mixed teams to split the roster; null otherwise
}

export type MemberTier = "Executive" | "Sub-Executive" | "General" | "Faculty Advisor";

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
  designation: string | null;
  tier: MemberTier;
  email: string | null;
  phone: string | null;
  facebook: string | null;
  linkedin: string | null;
  additionalInfo: string | null;
  sortOrder: number;
}

export interface RegistrationSettings {
  isOpen: boolean;
  googleFormUrl: string | null;
  nextIntakeDate: string | null; // ISO date
}

export interface QuickStats {
  memberCount: number;
  teamCount: number;
  eventCount: number;
  yearsOfExcellence: number; // derived from FOUNDING_YEAR, not stored
}

// Admin-managed year labels (e.g. "2022-2025"); sortOrder sets tab and section order.
export interface AlumniClassYear {
  id: string;
  label: string;
  sortOrder: number;
}

export interface AlumniProfile {
  id: string;
  name: string;
  photo: string | null;
  classYearId: string;
  classYear: string; // the class year's label, joined for display
  tier: "Executive" | "Sub-Executive"; // the panel tier they served on
  team: string | null;
  currentRole: string | null;
  quote: string | null;
  facebook: string | null;
  phone: string | null;
  sortOrder: number; // order within its (class year, tier) group
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

export type SponsorCategory = "Corporate" | "Media";

export interface Sponsor {
  id: string;
  name: string;
  logo: string | null;
  category: SponsorCategory;
  sortOrder: number;
}

export interface Achievement {
  id: string;
  teamId: string | null; // null for a club-wide achievement
  teamName: string;
  title: string;
  description: string;
  photo: string | null;
  gallery: string[]; // extra photos for the detail page slider
  date: string | null; // ISO date; null when unknown
}
