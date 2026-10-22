import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { MembersFilterView } from "@/components/members/MembersFilterView";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { Reveal } from "@/components/motion/Reveal";
import { getActivePanel, getMembersByTier } from "@/lib/data/members";
import { getRegistrationSettings } from "@/lib/data/registration";
import type { Member, MemberTier } from "@/lib/types";

export const metadata: Metadata = {
  title: "Members",
};

const TIERS: MemberTier[] = ["Faculty Advisor", "Executive", "Sub-Executive", "General"];

function MembersHeader({ label, intro }: { label: string; intro: string }) {
  return (
    <div className="px-4 pb-12 pt-4 text-center">
      <Reveal y={16}>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-300">
          <Users className="h-3.5 w-3.5 text-blue-400" />
          {label}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
          The <span className="text-gradient-brand">panel</span>
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">{intro}</p>
      </Reveal>
    </div>
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

  const [facultyAdvisor, executive, subExecutive, general] = await Promise.all(
    TIERS.map((tier) => getMembersByTier(panel.id, tier)),
  );
  const membersByTier: Record<MemberTier, Member[]> = {
    Executive: executive,
    "Sub-Executive": subExecutive,
    General: general,
    "Faculty Advisor": facultyAdvisor,
  };

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
