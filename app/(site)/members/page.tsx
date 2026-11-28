import type { Metadata } from "next";
import Link from "next/link";
import { PanelAlbum } from "@/components/members/album/PanelAlbum";
import { ContactStage } from "@/components/contact/interaction/ContactStage";
import { HomeMotionConfig } from "@/components/home/HomeMotion";
import { getCutoutFrames } from "@/lib/data/cutouts";
import { getActivePanel, getPanelMembers } from "@/lib/data/members";
import { getPlayersGroupedByTeam, getTeams } from "@/lib/data/teams";
import { panelSheet, rosterKey, type PanelSquad } from "@/lib/members-sheet";
import { teamSlug, teamSport } from "@/lib/squads";

const TITLE = "Members: the Panel Album";
const DESCRIPTION = "The NSU Games & Sports Club panel this year as a sticker album: the faculty advisor, the executives, the sub-executives and the general members.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/members" },
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: "/members" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

// "Panel 2025-26" -> "2025–26".
const yearOf = (name: string) => name.match(/(\d{4})\s*[-–/]\s*(\d{2,4})/)?.slice(1, 3).join("–") ?? null;

// "The Panel Album": every member of the active panel as a card, on one album page per tier.
export default async function MembersPage({ searchParams }: { searchParams: Search }) {
  const panel = await getActivePanel();

  if (!panel) {
    return (
      <div className="contact-page -mt-28 bg-[#0b2524] pb-24 pt-40 text-[#f5f1e8] [font-family:var(--font-home),system-ui,sans-serif]">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8">
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

  const [members, teams, rosters] = await Promise.all([getPanelMembers(panel.id), getTeams(), getPlayersGroupedByTeam()]);
  // Where each person sits in their cut-out, so every card frames them the same way.
  const frames = await getCutoutFrames(members.map((m) => m.photo).filter(Boolean) as string[]);

  // A member who is also on a squad's roster (same full name) gets its sport and team link.
  const squads = new Map<string, PanelSquad[]>();
  for (const team of teams) {
    for (const player of rosters.get(team.id) ?? []) {
      const key = rosterKey(player.name);
      const list = squads.get(key) ?? [];
      if (!list.some((s) => s.href === `/teams/${teamSlug(team)}`)) list.push({ sport: teamSport(team).sport, href: `/teams/${teamSlug(team)}` });
      squads.set(key, list);
    }
  }
  const people = panelSheet(members, frames, squads);

  // ?member=<slug> opens that card; older links used ?person=<slug>.
  const wanted = one(searchParams.member) || one(searchParams.person);
  const initialMember = people.some((p) => p.slug === wanted) ? wanted : null;

  return (
    <HomeMotionConfig>
      <div className="-mt-28 overflow-x-clip bg-[#0b2524] pb-20 pt-28 text-[#f5f1e8] [font-family:var(--font-home),system-ui,sans-serif]">
        <ContactStage>
          <PanelAlbum people={people} year={yearOf(panel.name)} initialMember={initialMember} />
        </ContactStage>
      </div>
    </HomeMotionConfig>
  );
}
