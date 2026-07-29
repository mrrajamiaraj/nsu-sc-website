import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChipColor = "purple" | "teal" | "amber" | "green" | "blue";

// Solid vivid gradient fills + colored glow, matching the reference design
// (design reference/*.png) — not translucent tinted chips.
const colorClasses: Record<ChipColor, string> = {
  purple: "bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-[0_0_22px_-4px_rgba(168,85,247,0.65)]",
  teal: "bg-gradient-to-br from-cyan-400 to-teal-500 text-white shadow-[0_0_22px_-4px_rgba(45,212,191,0.65)]",
  amber: "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_0_22px_-4px_rgba(251,146,60,0.65)]",
  green: "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-[0_0_22px_-4px_rgba(52,211,153,0.65)]",
  blue: "bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-[0_0_22px_-4px_rgba(96,165,250,0.65)]",
};

interface IconChipProps {
  icon: LucideIcon;
  color?: ChipColor;
  className?: string;
}

export function IconChip({ icon: Icon, color = "blue", className }: IconChipProps) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
        colorClasses[color],
        className,
      )}
    >
      <Icon className="h-6 w-6" strokeWidth={2} />
    </div>
  );
}
