import { StatRow } from "@/components/ui/StatRow";
import type { QuickStats as QuickStatsData } from "@/lib/types";

// Definitions live in lib/data/stats.ts. Zero or unknown figures are dropped.
export function QuickStats({ stats }: { stats: QuickStatsData }) {
  return (
    <StatRow
      className="px-4 pb-20"
      items={[
        { label: "Panel members", value: stats.memberCount || null },
        { label: "Squads", value: stats.teamCount || null },
        { label: "Events on record", value: stats.eventCount || null },
        { label: "Years as a club", value: stats.yearsAsClub },
      ]}
    />
  );
}
