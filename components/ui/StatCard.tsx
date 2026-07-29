import type { LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { IconChip, type ChipColor } from "./IconChip";

interface StatCardProps {
  icon: LucideIcon;
  color: ChipColor;
  value: number | string;
  label: string;
}

export function StatCard({ icon, color, value, label }: StatCardProps) {
  return (
    <GlassCard hover className="flex items-center gap-4 p-5">
      <IconChip icon={icon} color={color} />
      <div>
        <p className="text-2xl font-bold text-white sm:text-3xl">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </GlassCard>
  );
}
