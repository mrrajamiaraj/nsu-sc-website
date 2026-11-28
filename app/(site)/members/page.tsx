import type { Metadata } from "next";
import Link from "next/link";
import { SquadSheet } from "@/components/members/sheet/SquadSheet";
import { ContactStage } from "@/components/contact/interaction/ContactStage";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { getCutoutFrames } from "@/lib/data/cutouts";
import { getActivePanel, getPanelMembers } from "@/lib/data/members";
import { TIER_FILTERS, panelSheet, type TierFilter } from "@/lib/members-sheet";

const TITLE = "Members: the panel";
const DESCRIPTION = "The NSU Games & Sports Club panel this year: the faculty advisor, the executives, the sub-executive committee and every member, searchable.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/members" },
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: "/members" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

// "The squad sheet": the current panel as a formation, a committee and a searchable roster.
export default async function MembersPage({ searchParams }: { searchParams: Search }) {
  const panel = await getActivePanel();

  if (!panel) {
    return (
      <div className="contact-page -mt-28 bg-[#0b2524] pb-24 pt-40 text-[#f5f1e8] [font-family:var(--font-home),system-ui,sans-serif]">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
          <h1 className="text-[56px] !leading-[0.9] md:text-[88px]">The panel</h1>
          <p className="mt-4 max-w-xl text-[18px] text-[#f5f1e8]/70">
            The new panel will appear here once it&rsquo;s announced. Until then, meet{" "}
            <Link href="/alumni" className="font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
              past panels
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
              contact the club
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  const members = await getPanelMembers(panel.id);
  // Where each person sits in their cut-out, for the formation and the profile drawer.
  const frames = await getCutoutFrames(members.map((m) => m.photo).filter(Boolean) as string[]);
  const people = panelSheet(members, frames);

  const tier = one(searchParams.tier) as TierFilter;
  const view = one(searchParams.view);
  const sort = one(searchParams.sort);
  const initial = {
    tier: TIER_FILTERS.includes(tier) ? tier : "all",
    q: one(searchParams.q).slice(0, 60),
    view: view === "list" ? ("list" as const) : ("faces" as const),
    sort: sort === "tier" || sort === "department" ? (sort as "tier" | "department") : ("az" as const),
    sport: one(searchParams.sport),
    person: people.some((p) => p.slug === one(searchParams.person)) ? one(searchParams.person) : null,
  };

  return (
    <HomeMotionConfig>
      <div className="-mt-28 bg-[#0b2524] pt-28 text-[#f5f1e8] [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactStage>
          <SquadSheet people={people} panelName={panel.name} initial={initial} />
        </ContactStage>
      </div>
    </HomeMotionConfig>
  );
}
