import { mockMembers, mockPanel } from "@/lib/mock-data";
import type { Member, MemberTier, Panel } from "@/lib/types";

// FR-15: display the currently active panel only.
export async function getActivePanel(): Promise<Panel | null> {
  return mockPanel.isActive ? mockPanel : null;
}

// FR-16/FR-18: members within a tier, in admin-defined sort order.
export async function getMembersByTier(panelId: string, tier: MemberTier): Promise<Member[]> {
  return mockMembers
    .filter((member) => member.panelId === panelId && member.tier === tier)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
