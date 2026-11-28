import type { Metadata } from "next";
import Link from "next/link";
import { Award, Users } from "lucide-react";
import { MembersFilterView } from "@/components/members/MembersFilterView";
import { PanelByRole } from "@/components/members/PanelByRole";
import { ClosingCTA } from "@/components/shared/ClosingCTA";
import { PageHeader } from "@/components/ui/PageHeader";
import { getActivePanel, getPanelMembers } from "@/lib/data/members";
import { getTeams } from "@/lib/data/teams";
import { directoryRows } from "@/lib/contact-directory";
import type { Member, MemberTier } from "@/lib/types";

export const metadata: Metadata = {
  title: "Members",
  description: "The current NSU Games & Sports Club panel — faculty advisors, executive and sub-executive committees, and members.",
};

const TIERS: MemberTier[] = ["Faculty Advisor", "Executive", "Sub-Executive", "General"];

function MembersHeader({ label, intro }: { label: string; intro: string }) {
  return (
    <PageHeader
      icon={Users}
      eyebrow={label}
      title={
        <>
          The <span className="text-gradient-brand">panel</span>
        </>
      }
      intro={intro}
    />
  );
}

export default async function MembersPage() {
  const panel = await getActivePanel();

  if (!panel) {
    return (
      <>
        <MembersHeader label="Members" intro="The students running NSU SC this year." />
        <div className="px-4 pb-20">
          <div className="glass-panel mx-auto max-w-xl p-8 text-center">
            <h2 className="text-xl font-bold text-white">No panel is listed right now</h2>
            <p className="mt-2 text-sm text-slate-400">
              The new panel will appear here once it&rsquo;s announced. Until then, you can meet{" "}
              <Link href="/alumni" className="font-medium text-blue-400 hover:text-blue-300">
                past panels
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="font-medium text-blue-400 hover:text-blue-300">
                contact the club
              </Link>
              .
            </p>
          </div>
        </div>
      </>
    );
  }

  const [members, teams] = await Promise.all([getPanelMembers(panel.id), getTeams()]);
  const membersByTier = Object.fromEntries(
    TIERS.map((tier) => [tier, members.filter((member) => member.tier === tier)]),
  ) as Record<MemberTier, Member[]>;

  return (
    <>
      <MembersHeader
        label={panel.name}
        intro="The advisors, executives and members running NSU SC this year."
      />

      <MembersFilterView membersByTier={membersByTier} />

      <div className="px-4 pb-12 pt-20">
        <div className="mx-auto max-w-6xl">
          <PanelByRole rows={directoryRows(members, teams)} />
        </div>
      </div>

      <ClosingCTA
        icon={Award}
        eyebrow="Panel elections"
        title="Want to help run the club?"
        body="Panel elections are held every year. Ask the current panel how nominations work and what each role involves."
        primary={{ label: "Ask the panel", href: "/contact" }}
        secondary={{ label: "See past panels", href: "/alumni" }}
      />
    </>
  );
}
