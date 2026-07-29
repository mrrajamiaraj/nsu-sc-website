import { CalendarDays, ShieldCheck, Users } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Reveal } from "@/components/motion/Reveal";
import type { QuickStats as QuickStatsData } from "@/lib/types";

export function QuickStats({ stats }: { stats: QuickStatsData }) {
  const items = [
    { icon: Users, color: "purple" as const, value: stats.memberCount, label: "Active Members" },
    { icon: ShieldCheck, color: "teal" as const, value: stats.teamCount, label: "Sports Teams" },
    { icon: CalendarDays, color: "amber" as const, value: stats.eventCount, label: "Events Held" },
  ];

  return (
    <section className="px-4 pb-20">
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
        {items.map((item, index) => (
          <Reveal key={item.label} delay={index * 0.1}>
            <StatCard {...item} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
