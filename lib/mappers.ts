// Maps snake_case Supabase rows to the camelCase types in lib/types.ts.
import type {
  Achievement,
  AlumniProfile,
  BlogPost,
  Event,
  Member,
  Panel,
  Player,
  RegistrationSettings,
  Sponsor,
  Team,
} from "./types";

export function mapEventRow(row: Record<string, unknown>): Event {
  return {
    id: row.id as string,
    name: row.name as string,
    date: row.date as string,
    venue: row.venue as string,
    description: row.description as string,
    bannerImage: (row.banner_image as string | null) ?? null,
    status: row.status as Event["status"],
    gallery: (row.gallery as string[] | null) ?? [],
    endDate: (row.end_date as string | null) ?? null,
    teamCount: (row.team_count as number | null) ?? null,
    participantCount: (row.participant_count as number | null) ?? null,
    winners: (row.winners as string | null) ?? null,
    runnersUp: (row.runners_up as string | null) ?? null,
    prizePool: (row.prize_pool as string | null) ?? null,
  };
}

export function mapTeamRow(row: Record<string, unknown>): Team {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    bannerImage: (row.banner_image as string | null) ?? null,
    nickname: (row.nickname as string | null) ?? null,
    achievement: (row.achievement as string | null) ?? null,
  };
}

export function mapPlayerRow(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    teamId: row.team_id as string,
    name: row.name as string,
    photo: (row.photo as string | null) ?? null,
    email: row.email as string,
    position: row.position as string,
    bio: row.bio as string,
    sortOrder: row.sort_order as number,
  };
}

export function mapPanelRow(row: Record<string, unknown>): Panel {
  return {
    id: row.id as string,
    name: row.name as string,
    isActive: row.is_active as boolean,
  };
}

export function mapMemberRow(row: Record<string, unknown>): Member {
  return {
    id: row.id as string,
    panelId: row.panel_id as string,
    name: row.name as string,
    photo: (row.photo as string | null) ?? null,
    designation: row.designation as string,
    tier: row.tier as Member["tier"],
    email: row.email as string,
    phone: row.phone as string,
    additionalInfo: (row.additional_info as string | null) ?? null,
    sortOrder: row.sort_order as number,
  };
}

export function mapRegistrationRow(row: Record<string, unknown>): RegistrationSettings {
  return {
    isOpen: row.is_open as boolean,
    googleFormUrl: (row.google_form_url as string | null) ?? null,
    nextIntakeDate: (row.next_intake_date as string | null) ?? null,
  };
}

export function mapAlumniRow(row: Record<string, unknown>): AlumniProfile {
  return {
    id: row.id as string,
    name: row.name as string,
    photo: (row.photo as string | null) ?? null,
    graduationYear: row.graduation_year as number,
    tier: row.tier as AlumniProfile["tier"],
    team: row.team as string,
    currentRole: row.current_role_title as string,
    quote: (row.quote as string | null) ?? null,
  };
}

export function mapBlogPostRow(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    title: row.title as string,
    excerpt: row.excerpt as string,
    content: (row.content as string | null) ?? "",
    category: row.category as string,
    coverImage: (row.cover_image as string | null) ?? null,
    author: row.author as string,
    date: row.date as string,
    readTimeMinutes: row.read_time_minutes as number,
  };
}

export function mapSponsorRow(row: Record<string, unknown>): Sponsor {
  return {
    id: row.id as string,
    name: row.name as string,
    logo: (row.logo as string | null) ?? null,
  };
}

// Expects the row's `teams` field to be a joined { name } object (see
// lib/data/achievements.ts's `select("*, teams(name)")`).
export function mapAchievementRow(row: Record<string, unknown>): Achievement {
  const team = row.teams as { name?: string } | null;
  return {
    id: row.id as string,
    teamId: row.team_id as string,
    teamName: team?.name ?? "",
    title: row.title as string,
    description: row.description as string,
    photo: (row.photo as string | null) ?? null,
    date: row.date as string,
  };
}
