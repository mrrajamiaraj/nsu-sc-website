import { Award, Calendar, Trophy, Users } from "lucide-react";
import { IconChip } from "@/components/ui/IconChip";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { Reveal } from "@/components/motion/Reveal";

export function AboutStats({ sportsOffered }: { sportsOffered: number }) {
  const stats = [
    { icon: Calendar, color: "purple" as const, value: "1992", label: "Established" },
    { icon: Users, color: "blue" as const, value: "500+", label: "Active Members" },
    { icon: Trophy, color: "teal" as const, value: "8+", label: "Championships" },
    { icon: Award, color: "amber" as const, value: sportsOffered, label: "Sports Offered" },
  ];

  return (
    <section className="px-4 pb-16">
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.08}>
            <div className="glass-panel flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <AnimatedCounter value={stat.value} className="mt-1 block text-2xl font-bold text-white" />
              </div>
              <IconChip icon={stat.icon} color={stat.color} />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
