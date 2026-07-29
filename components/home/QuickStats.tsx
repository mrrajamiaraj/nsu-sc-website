import { CalendarDays, ShieldCheck, Users } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { QuickStats as QuickStatsData } from "@/lib/types";

export function QuickStats({ stats }: { stats: QuickStatsData }) {
  return (
    <section className="px-4 pb-20">
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
        <StatCard icon={Users} color="purple" value={stats.memberCount} label="Active Members" />
        <StatCard icon={ShieldCheck} color="teal" value={stats.teamCount} label="Sports Teams" />
        <StatCard icon={CalendarDays} color="amber" value={stats.eventCount} label="Events Held" />
      </div>
    </section>
  );
}
