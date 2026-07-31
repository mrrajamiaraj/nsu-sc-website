import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapMemberRow, mapPanelRow } from "@/lib/mappers";
import { Button } from "@/components/ui/Button";
import { MemberTierGroup } from "@/components/admin/members/MemberTierGroup";
import { deleteMember, reorderMembers } from "./actions";
import type { Member, MemberTier } from "@/lib/types";

const TIERS: MemberTier[] = ["Executive", "Sub-Executive", "General"];

export default async function AdminMembersPage() {
  const supabase = await createClient();
  const { data: panelRow } = await supabase.from("panels").select("*").eq("is_active", true).maybeSingle();
  const activePanel = panelRow ? mapPanelRow(panelRow) : null;

  const membersByTier: Record<MemberTier, Member[]> = {
    Executive: [],
    "Sub-Executive": [],
    General: [],
  };

  if (activePanel) {
    const { data: memberRows } = await supabase
      .from("members")
      .select("*")
      .eq("panel_id", activePanel.id)
      .order("sort_order");
    const members = (memberRows ?? []).map(mapMemberRow);
    for (const tier of TIERS) {
      membersByTier[tier] = members.filter((m) => m.tier === tier);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Members</h1>
          <p className="mt-1 text-sm text-slate-400">
            {activePanel ? `Active panel: ${activePanel.name}` : "No active panel set."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/dashboard/members/panels"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
            Manage Panels
          </Link>
          {activePanel && (
            <Button href="/admin/dashboard/members/new" size="sm">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          )}
        </div>
      </div>

      {!activePanel && (
        <p className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 text-sm text-amber-300">
          No panel is currently active. Create and activate a panel under &quot;Manage Panels&quot; before adding
          members.
        </p>
      )}

      {activePanel && (
        <div className="mt-8 space-y-8">
          {TIERS.map((tier) => (
            <MemberTierGroup
              key={tier}
              tier={tier}
              members={membersByTier[tier]}
              onReorder={reorderMembers.bind(null, activePanel.id, tier)}
              onDelete={deleteMember}
            />
          ))}
        </div>
      )}
    </div>
  );
}
