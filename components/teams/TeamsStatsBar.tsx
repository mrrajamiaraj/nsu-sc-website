import { Medal, Target, Trophy, Users } from "lucide-react";

interface TeamsStatsBarProps {
  championships: string;
  medals: string;
  members: number;
  winRate: string;
}

export function TeamsStatsBar({ championships, medals, members, winRate }: TeamsStatsBarProps) {
  const stats = [
    { icon: Trophy, value: championships, label: "Total Championships" },
    { icon: Medal, value: medals, label: "Medals Won" },
    { icon: Users, value: members, label: "Team Members" },
    { icon: Target, value: winRate, label: "Win Rate" },
  ];

  return (
    <div className="px-4 pb-16">
      <div className="glass-panel mx-auto max-w-5xl p-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <stat.icon className="h-6 w-6 text-blue-400" strokeWidth={2} />
              <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
