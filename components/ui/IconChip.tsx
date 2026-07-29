import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChipColor = "purple" | "teal" | "amber" | "green" | "blue";

const colorClasses: Record<ChipColor, string> = {
  purple: "bg-purple-500/15 text-purple-300 ring-1 ring-inset ring-purple-400/20",
  teal: "bg-teal-500/15 text-teal-300 ring-1 ring-inset ring-teal-400/20",
  amber: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/20",
  green: "bg-green-500/15 text-green-300 ring-1 ring-inset ring-green-400/20",
  blue: "bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-400/20",
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
