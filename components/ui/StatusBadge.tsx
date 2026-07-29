import { cn } from "@/lib/utils";
import type { EventStatus } from "@/lib/types";

const statusClasses: Record<EventStatus, string> = {
  Upcoming: "bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-400/20",
  Running: "bg-green-500/15 text-green-300 ring-1 ring-inset ring-green-400/20",
  Finished: "bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-400/20",
};

export function StatusBadge({ status, className }: { status: EventStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        statusClasses[status],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "Running" ? "bg-green-400 animate-pulse" : "bg-current")} />
      {status}
    </span>
  );
}
