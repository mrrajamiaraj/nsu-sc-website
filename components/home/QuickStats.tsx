import { CalendarDays, ShieldCheck, Trophy, Users } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { IconChip } from "@/components/ui/IconChip";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { Reveal } from "@/components/motion/Reveal";
import type { QuickStats as QuickStatsData } from "@/lib/types";

export function QuickStats({ stats }: { stats: QuickStatsData }) {
  const items = [
    { icon: Users, color: "purple" as const, value: stats.memberCount, label: "Active Members" },
    { icon: ShieldCheck, color: "teal" as const, value: stats.teamCount, label: "Sports Teams" },
    { icon: CalendarDays, color: "green" as const, value: stats.eventCount, label: "Events Held" },
    { icon: Trophy, color: "amber" as const, value: stats.yearsOfExcellence, label: "Years of Excellence" },
  ];

  return (
    <section className="px-4 pb-20">
      <Reveal className="mx-auto max-w-5xl">
        <GlassCard className="grid grid-cols-2 gap-y-8 divide-white/10 p-6 sm:gap-8 lg:grid-cols-4 lg:divide-x lg:p-8">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-3 text-center">
              <IconChip icon={item.icon} color={item.color} />
              <AnimatedCounter value={item.value} className="text-3xl font-bold text-white" />
              <p className="text-sm text-slate-400">{item.label}</p>
            </div>
          ))}
        </GlassCard>
      </Reveal>
    </section>
  );
}
