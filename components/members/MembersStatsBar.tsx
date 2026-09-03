import { Crown, GraduationCap, ShieldCheck, UserCheck, Users } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";

interface MembersStatsBarProps {
  total: number;
  executive: number;
  subExecutive: number;
  general: number;
  facultyAdvisor: number;
}

export function MembersStatsBar({ total, executive, subExecutive, general, facultyAdvisor }: MembersStatsBarProps) {
  const stats = [
    { icon: Users, value: total, label: "Total Members" },
    { icon: Crown, value: executive, label: "Executive" },
    { icon: ShieldCheck, value: subExecutive, label: "Sub-Executive" },
    { icon: UserCheck, value: general, label: "General Members" },
    { icon: GraduationCap, value: facultyAdvisor, label: "Faculty Advisor" },
  ];

  return (
    <div className="px-4 pb-16">
      <Reveal className="mx-auto max-w-5xl">
        <div className="glass-panel p-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <stat.icon className="h-6 w-6 text-blue-400" strokeWidth={2} />
                <AnimatedCounter value={stat.value} className="mt-2 text-2xl font-bold text-white sm:text-3xl" />
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
