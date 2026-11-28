import type { Metadata } from "next";
import { GazetteListing } from "@/components/blog/gazette/GazetteListing";
import { ContactStage } from "@/components/contact/interaction/ContactStage";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { gazettePosts } from "@/lib/blog";
import { getBlogPosts } from "@/lib/data/blog";
import { getEventsGroupedByStatus } from "@/lib/data/events";
import { eventSlug } from "@/lib/events-hub";
import { FOUNDED, scoreLines } from "@/lib/gazette";

const DESCRIPTION = "The NSU SC Gazette: match reports, results and profiles from NSU Games & Sports Club, the student sports club of North South University.";

export const metadata: Metadata = {
  title: "The NSU SC Gazette",
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: { title: "The NSU SC Gazette | NSU Games & Sports Club", description: DESCRIPTION, url: "/blog", type: "website" },
};

type Search = Record<"cat" | "sport" | "year" | "sort" | "tag", string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

// The Blog as the club's newspaper: front page on a newsprint sheet, back issues below.
// Only stories with a body are published.
export default async function BlogPage({ searchParams }: { searchParams: Search }) {
  const [raw, grouped] = await Promise.all([getBlogPosts(), getEventsGroupedByStatus()]);
  const posts = gazettePosts(raw);
  const finished = grouped.Finished;
  const scores = scoreLines(finished).map((line) => {
    const event = finished.find((e) => e.id === line.id);
    return { ...line, href: event ? `/events/${eventSlug(event)}` : `/events/${line.id}` };
  });
  const year = Number(new Date().toLocaleDateString("en-CA", { year: "numeric", timeZone: "Asia/Dhaka" }));

  return (
    <HomeMotionConfig>
      <div className="-mt-28 overflow-x-clip bg-[#0b2524] pb-4 pt-28 [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactStage>
          <GazetteListing
            posts={posts}
            scores={scores}
            volume={year - FOUNDED}
            initial={{ cat: one(searchParams.cat), sport: one(searchParams.sport), year: one(searchParams.year), sort: one(searchParams.sort) === "oldest" ? "oldest" : "newest", tag: one(searchParams.tag) }}
          />
        </ContactStage>
      </div>
    </HomeMotionConfig>
  );
}
