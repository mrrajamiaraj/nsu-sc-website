import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ArticleView, type RelatedCard, type ResultRow } from "@/components/blog/article/ArticleView";
import { ContactStage } from "@/components/contact/interaction/ContactStage";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { gazettePosts, postHref } from "@/lib/blog";
import { enrichBody } from "@/lib/blog-blocks";
import { getAchievements } from "@/lib/data/achievements";
import { getBlogClaps, getBlogPosts } from "@/lib/data/blog";
import { getAllEvents } from "@/lib/data/events";
import { getActivePanel, getPanelMembers } from "@/lib/data/members";
import { getTeams } from "@/lib/data/teams";
import { hubEvents } from "@/lib/events-hub";
import { panelSheet } from "@/lib/members-sheet";
import { absoluteUrl } from "@/lib/seo";
import { teamSlug } from "@/lib/squads";
import { entryPath, trophyEntries } from "@/lib/trophy";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function load(param: string) {
  const posts = gazettePosts(await getBlogPosts());
  const post = posts.find((p) => p.slug === param.toLowerCase() || (UUID.test(param) && p.id === param)) ?? null;
  return { posts, post };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { post } = await load(params.slug);
  if (!post) return { title: "Story", robots: { index: false } };
  const images = post.cover ? [{ url: post.cover, alt: post.title }] : undefined;
  return {
    title: post.title,
    description: post.standfirst,
    authors: [{ name: post.author.name }],
    alternates: { canonical: postHref(post) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.standfirst,
      url: postHref(post),
      publishedTime: post.date,
      ...(post.updated ? { modifiedTime: post.updated } : {}),
      authors: [post.author.name],
      section: post.category,
      tags: post.tags,
      images,
    },
    twitter: { card: post.cover ? "summary_large_image" : "summary", title: post.title, description: post.standfirst, images: post.cover ? [post.cover] : undefined },
  };
}

// The current panel by profile slug, for portraits in a story's list of people.
async function panelPeople() {
  const panel = await getActivePanel();
  if (!panel) return new Map<string, { name: string; thumb: string | null }>();
  const people = panelSheet(await getPanelMembers(panel.id), {});
  return new Map(people.map((p) => [p.slug, { name: p.name, thumb: p.thumb }]));
}

// One story of the Gazette. Old links by id go on to the readable address, or to the
// Gazette when that story is gone; a post with no body isn't published, so it 404s.
export default async function StoryPage({ params }: { params: { slug: string } }) {
  const { posts, post: found } = await load(params.slug);
  if (!found) {
    if (UUID.test(params.slug)) permanentRedirect("/blog");
    notFound();
  }
  if (params.slug !== found.slug) permanentRedirect(postHref(found));

  const hasPeople = found.html.includes('<ul class="people">');
  const [events, achievements, teams, claps, people] = await Promise.all([
    getAllEvents(),
    getAchievements(),
    getTeams(),
    getBlogClaps(found.id),
    hasPeople ? panelPeople() : Promise.resolve(new Map()),
  ]);
  const hub = hubEvents(events);
  const post = { ...found, html: enrichBody(found.html, { events: new Map(hub.map((e) => [e.slug, { code: e.code, image: e.poster }])), people }) };

  // What the story is about: the event, achievement or team it links to.
  const related: RelatedCard[] = [];
  let results: ResultRow[] = [];
  let resultsCode: string | null = null;
  const event = post.related.eventId ? hub.find((e) => e.id === post.related.eventId) : undefined;
  if (event) {
    related.push({ kind: "event", href: `/events/${event.slug}`, title: event.name, image: event.poster, label: "The event" });
    // The scoreboard, unless the story already has its own results table.
    if (!post.html.includes("<table>")) resultsCode = event.code;
    results = event.champions.map((c) => ({
      category: c.category,
      champion: c.names,
      runnerUp: event.runnersUp.find((r) => r.category === c.category)?.names ?? null,
    }));
  }
  const achievement = post.related.achievementId ? trophyEntries(achievements).find((a) => a.id === post.related.achievementId) : undefined;
  if (achievement) related.push({ kind: "achievement", href: entryPath(achievement), title: achievement.title, image: achievement.photos[0] ?? null, label: "In the trophy room" });
  const team = post.related.teamId ? teams.find((t) => t.id === post.related.teamId) : undefined;
  if (team) related.push({ kind: "team", href: `/teams/${teamSlug(team)}`, title: team.name.replace(/ Male$/, " Men").replace(/ Female$/, " Women"), image: team.bannerImage, label: "The squad" });

  // Site pages the story points to: "Futsal events", "Join the club".
  for (const l of post.links) related.push({ kind: l.kind, href: l.href, title: l.label, image: null, label: l.kind === "join" ? "Get involved" : "On the site" });

  const i = posts.findIndex((p) => p.id === post.id);
  const others = posts.filter((p) => p.id !== post.id);
  const more = [...others.filter((p) => post.sport && p.sport === post.sport), ...others.filter((p) => !post.sport || p.sport !== post.sport)].slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.standfirst,
    datePublished: post.date,
    ...(post.updated ? { dateModified: post.updated } : {}),
    author: { "@type": post.author.name.startsWith("NSU SC") ? "Organization" : "Person", name: post.author.name },
    articleSection: post.category,
    ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
    ...(post.cover ? { image: [absoluteUrl(post.cover)] } : {}),
    publisher: { "@type": "Organization", name: "NSU Games & Sports Club" },
    mainEntityOfPage: absoluteUrl(postHref(post)),
  };

  return (
    <HomeMotionConfig>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="-mt-28 overflow-x-clip bg-[#0b2524] pb-4 pt-28 [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactStage progress={false}>
          <ArticleView
            post={post}
            related={related}
            results={results}
            resultsCode={resultsCode}
            more={more}
            byAuthor={posts.filter((p) => p.author.name === post.author.name)}
            prev={i > 0 ? posts[i - 1] : null}
            next={i < posts.length - 1 ? posts[i + 1] : null}
            claps={claps}
          />
        </ContactStage>
      </div>
    </HomeMotionConfig>
  );
}
