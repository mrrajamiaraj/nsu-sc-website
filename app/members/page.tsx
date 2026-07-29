import type { Metadata } from "next";
import { Users } from "lucide-react";
import { MembersFilterView } from "@/components/members/MembersFilterView";
import { MembersStatsBar } from "@/components/members/MembersStatsBar";
import { Reveal } from "@/components/motion/Reveal";
import { getActivePanel, getMembersByTier } from "@/lib/data/members";
import type { Member, MemberTier } from "@/lib/types";

export const metadata: Metadata = {
  title: "Members",
};

const TIERS: MemberTier[] = ["Executive", "Sub-Executive", "General"];

export default async function MembersPage() {
  const panel = await getActivePanel();

  if (!panel) {
    return (
      <div className="px-4 pb-20 pt-4 text-center">
        <p className="text-slate-400">No active panel to display right now — check back soon.</p>
      </div>
    );
  }

  const [executive, subExecutive, general] = await Promise.all(
    TIERS.map((tier) => getMembersByTier(panel.id, tier)),
  );
  const membersByTier: Record<MemberTier, Member[]> = {
    Executive: executive,
    "Sub-Executive": subExecutive,
    General: general,
  };
  const total = executive.length + subExecutive.length + general.length;

  return (
    <>
      <div className="px-4 pb-12 pt-4 text-center">
        <Reveal y={16}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
            <Users className="h-3.5 w-3.5 text-blue-400" />
            Our Panel
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
            Meet Our <span className="text-gradient-brand">Panel</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            The dedicated executives and members leading NSU SC for {panel.name}.
          </p>
        </Reveal>
      </div>

      <MembersStatsBar
        total={total}
        executive={executive.length}
        subExecutive={subExecutive.length}
        general={general.length}
      />

      <MembersFilterView membersByTier={membersByTier} />
    </>
  );
}
