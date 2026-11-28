import { SportIcon } from "@/components/home/SportIcon";
import { TYPE_LABEL, type EntryType } from "@/lib/trophy";
import { cn } from "@/lib/utils";

// Tiny dark-teal blur shown while a photo loads.
export const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc4JyBoZWlnaHQ9JzUnPjxyZWN0IHdpZHRoPSc4JyBoZWlnaHQ9JzUnIGZpbGw9JyMxMjNhMzgnLz48L3N2Zz4=";

// Scoreboard-style result tag: boxed caps, no fill. Wins in teal, everything else quieter.
const TAG_TONE: Record<EntryType, string> = {
  title: "border-[#3fcfca] text-[#3fcfca]",
  individual: "border-[#3fcfca] text-[#3fcfca]",
  podium: "border-[#f5f1e8]/70 text-[#f5f1e8]",
  milestone: "border-[#f5f1e8]/30 text-[#f5f1e8]/60",
  moment: "border-[#f5f1e8]/25 text-[#f5f1e8]/45",
};

export function ResultTag({ type, className }: { type: EntryType; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center border px-2 text-[12px] font-bold uppercase leading-none tracking-[0.14em]", TAG_TONE[type], className)}>
      {TYPE_LABEL[type].tag}
    </span>
  );
}

export function SportLabel({ sport }: { sport: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-[#f5f1e8]/60">
      <SportIcon aria-hidden sport={sport} strokeWidth={1.75} className="h-4 w-4" />
      {sport}
    </span>
  );
}

