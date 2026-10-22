import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { MembersFilterView } from "@/components/members/MembersFilterView";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { PageHeader } from "@/components/ui/PageHeader";
import { getActivePanel, getPanelMembers } from "@/lib/data/members";
import { getRegistrationSettings } from "@/lib/data/registration";
import type { Member, MemberTier } from "@/lib/types";

export const metadata: Metadata = {
  title: "Members",
  description: "The current NSU Games and Sports Club panel — faculty advisors, executive and sub-executive committees, and members.",
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
  const [panel, registrationSettings] = await Promise.all([getActivePanel(), getRegistrationSettings()]);

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

  const members = await getPanelMembers(panel.id);
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

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
