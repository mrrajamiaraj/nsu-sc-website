// "Needs attention" checks for the admin home page. Pure functions over data the
// admin already manages: they never change anything, they only list records that
// would show up broken or incomplete on the public site, each with a link to fix it.
// Kept free of runtime imports so the checks can be exercised in isolation.
import type { BlogPost, Event, RegistrationSettings, Team } from "@/lib/types";

export interface AttentionItem {
  id: string;
  label: string;
  detail?: string;
  href: string;
}

export interface AttentionCheck {
  id: string;
  title: string;
  /** What to do about it, shown under the title. */
  hint: string;
  items: AttentionItem[];
  /** The data for this check couldn't be loaded, so it must not read as clear. */
  failed?: boolean;
}

/** Records older than this are legacy; their gaps aren't flagged so new ones stand out. */
export const RECENT_DAYS = 365;

const EVENT_EDIT = (id: string) => `/admin/dashboard/events/${id}/edit`;

/** ISO date `days` before `today` (both YYYY-MM-DD). */
export function daysBefore(today: string, days: number): string {
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function isRecent(event: Event, today: string): boolean {
  if (event.status !== "Finished") return true;
  return Boolean(event.date && event.date >= daysBefore(today, RECENT_DAYS));
}

function eventLabel(event: Event): string {
  return event.date ? `${event.name} (${event.date.slice(0, 4)})` : event.name;
}

/** Real Google Forms links: docs.google.com/forms/… or forms.gle/…. */
export function isGoogleFormUrl(url: string): boolean {
  try {
    const { protocol, hostname, pathname } = new URL(url);
    if (protocol !== "https:") return false;
    if (hostname === "forms.gle") return pathname.length > 1;
    return hostname === "docs.google.com" && pathname.startsWith("/forms/");
  } catch {
    return false;
  }
}

export function checkRegistrationLink(settings: RegistrationSettings): AttentionItem[] {
  if (!settings.isOpen) return [];
  const url = settings.googleFormUrl?.trim();
  if (url && isGoogleFormUrl(url)) return [];
  return [
    {
      id: "registration",
      label: url ? url : "No form link set",
      detail: "Sign-ups are open, so every “Join the club” button points here.",
      href: "/admin/dashboard/registration",
    },
  ];
}

/** Post body is empty once tags, &nbsp; and whitespace are removed. */
export function isEmptyHtml(html: string | null | undefined): boolean {
  return !(html ?? "")
    .replace(/<(img|iframe|video)\b/gi, "x") // embedded media counts as content
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;/g, " ")
    .trim();
}

export function checkEmptyBlogPosts(posts: Pick<BlogPost, "id" | "title" | "content">[]): AttentionItem[] {
  return posts
    .filter((post) => isEmptyHtml(post.content))
    .map((post) => ({
      id: post.id,
      label: post.title,
      detail: "Only the summary shows; the article page has no body.",
      href: `/admin/dashboard/blog/${post.id}/edit`,
    }));
}

export function checkResultsMissing(events: Event[], today: string): AttentionItem[] {
  return events
    .filter((event) => event.status === "Finished" && isRecent(event, today) && !event.winners?.trim())
    .map((event) => ({ id: event.id, label: eventLabel(event), detail: "Finished with no winners recorded.", href: EVENT_EDIT(event.id) }));
}

/** Still marked Upcoming or Running after its last day (or, for year-only dates, its year). */
export function checkStaleStatus(events: Event[], today: string): AttentionItem[] {
  return events
    .filter((event) => {
      if (event.status === "Finished" || !event.date) return false;
      if (event.yearOnly) return event.date.slice(0, 4) < today.slice(0, 4);
      return (event.endDate ?? event.date) < today;
    })
    .map((event) => ({
      id: event.id,
      label: eventLabel(event),
      detail: `Still marked ${event.status}, but its date has passed.`,
      href: EVENT_EDIT(event.id),
    }));
}

export function checkMissingBanner(events: Event[], today: string): AttentionItem[] {
  return events
    .filter((event) => isRecent(event, today) && !event.bannerImage)
    .map((event) => ({ id: event.id, label: eventLabel(event), detail: "No banner image; cards show a placeholder.", href: EVENT_EDIT(event.id) }));
}

export function checkEmptySquads(teams: Pick<Team, "id" | "name">[], teamIdsWithPlayers: Set<string>): AttentionItem[] {
  return teams
    .filter((team) => !teamIdsWithPlayers.has(team.id))
    .map((team) => ({
      id: team.id,
      label: team.name,
      detail: "No players listed; the public page says the roster is coming soon.",
      href: `/admin/dashboard/teams/${team.id}/edit`,
    }));
}

export function needsAttentionCount(checks: AttentionCheck[]): number {
  return checks.filter((check) => check.failed || check.items.length > 0).length;
}
