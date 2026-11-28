import { hasVisibleContent, sanitizeHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/squads";
import type { BlogPost } from "@/lib/types";

// "The NSU SC Gazette": blog posts as newspaper stories. A post without a body isn't
// published (it never appears, not even as a summary), so placeholder posts stay out.

export const CATEGORIES = ["Match report", "Results", "Profiles", "Club news", "Behind the scenes", "Announcements"] as const;
export type Category = (typeof CATEGORIES)[number];
export const categoryKey = (c: string) => slugify(c); // "match-report"

// Older posts used free-text categories ("Football", "Events"); they read as Club news.
function categoryOf(raw: string): Category {
  const hit = CATEGORIES.find((c) => c.toLowerCase() === raw.trim().toLowerCase());
  if (hit) return hit;
  if (/report/i.test(raw)) return "Match report";
  if (/result/i.test(raw)) return "Results";
  if (/profile|spotlight/i.test(raw)) return "Profiles";
  if (/behind/i.test(raw)) return "Behind the scenes";
  if (/announce/i.test(raw)) return "Announcements";
  return "Club news";
}

export const SPORTS = ["Football", "Futsal", "Cricket", "Basketball", "Badminton", "Table tennis", "Chess & carrom", "Volleyball", "Multi-sport"];

export interface Heading {
  id: string;
  text: string;
}

export interface GazettePost {
  id: string;
  slug: string;
  title: string;
  standfirst: string;
  category: Category;
  sport: string | null;
  author: { name: string; role: string | null; photo: string | null };
  date: string; // ISO date
  updated: string | null; // ISO date, only when edited after the publish date
  readTime: number; // minutes, from the text
  cover: string | null;
  coverCredit: string;
  tags: string[];
  related: { eventId: string | null; achievementId: string | null; teamId: string | null };
  html: string; // sanitised, with ids on h2s
  headings: Heading[];
  opening: string; // first paragraph as plain text
  words: number;
}

const strip = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

/** Sanitise, give each h2 an id for "In this story", and pull out the opening paragraph. */
function prepare(content: string) {
  const clean = sanitizeHtml(content);
  const headings: Heading[] = [];
  const used = new Set<string>();
  const html = clean.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    const text = strip(inner);
    let id = slugify(text) || "section";
    for (let n = 2; used.has(id); n++) id = `${slugify(text)}-${n}`;
    used.add(id);
    headings.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  const first = clean.match(/<p>([\s\S]*?)<\/p>/);
  const words = strip(clean).split(" ").filter(Boolean).length;
  return { html, headings, opening: first ? strip(first[1]) : "", words };
}

export function postSlug(p: Pick<BlogPost, "slug" | "title">): string {
  return p.slug || slugify(p.title.replace(/[’']/g, "")) || "story";
}

export function gazettePosts(posts: BlogPost[]): GazettePost[] {
  const used = new Set<string>();
  return posts
    .filter((p) => hasVisibleContent(p.content))
    .map((p): GazettePost => {
      const { html, headings, opening, words } = prepare(p.content);
      let slug = postSlug(p);
      for (let n = 2; used.has(slug); n++) slug = `${postSlug(p)}-${n}`;
      used.add(slug);
      const updated = p.updatedAt ? p.updatedAt.slice(0, 10) : null;
      return {
        id: p.id,
        slug,
        title: p.title,
        standfirst: p.excerpt,
        category: categoryOf(p.category),
        sport: p.sport,
        author: { name: p.author || "NSU SC Media Team", role: p.authorRole, photo: p.authorPhoto },
        date: p.date,
        // "Updated" only when it was edited at least a day after it was published.
        updated: updated && updated > p.date && Date.parse(updated) - Date.parse(p.date) >= 86400000 ? updated : null,
        readTime: Math.max(1, Math.round(words / 220)),
        cover: p.coverImage,
        coverCredit: p.coverCredit || "NSU Games & Sports Club",
        tags: p.tags,
        related: { eventId: p.relatedEventId, achievementId: p.relatedAchievementId, teamId: p.relatedTeamId },
        html,
        headings,
        opening,
        words,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const postHref = (p: Pick<GazettePost, "slug">) => `/blog/${p.slug}`;

/** "28 Nov 2026" */
export function dateline(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00+06:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" });
}
