"use client";

import { SportIcon } from "@/components/home/SportIcon";
import { sportIcon, sportLabel, typeLabel, type HubEvent, type HubStatus } from "@/lib/events-hub";
import { cn } from "@/lib/utils";

export const BLUR = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5'%3E%3Crect width='4' height='5' fill='%230f302e'/%3E%3C/svg%3E";
export const EASE = [0.25, 0.7, 0.3, 1] as const;

export const STATUS_TEXT: Record<HubStatus, string> = {
  live: "Live now",
  "registration-open": "Registration open",
  upcoming: "Upcoming",
  finished: "Finished",
};

/** Small status mark for the few events that aren't finished: a dot and a word, no pill. */
export function StatusMark({ status, className }: { status: HubStatus; className?: string }) {
  if (status === "finished") return null;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#3fcfca]", className)}>
      <span aria-hidden className="relative flex h-2 w-2">
        {status === "live" && <span className="absolute inline-flex h-full w-full rounded-full bg-[#3fcfca] opacity-70 motion-safe:animate-ping" />}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3fcfca]" />
      </span>
      {STATUS_TEXT[status]}
    </span>
  );
}

/** Sport icon + sport · type, as plain text. */
export function SportType({ event, className }: { event: Pick<HubEvent, "sport" | "type">; className?: string }) {
  const parts = [sportLabel(event.sport), typeLabel(event.type)].filter(Boolean);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#f5f1e8]/80", className)}>
      <SportIcon aria-hidden sport={sportIcon(event.sport)} strokeWidth={1.75} className="h-4 w-4 shrink-0" />
      {parts.join(" · ")}
    </span>
  );
}

/** "🏆 Shadow Hunters" or "Champions: Batch 21 (men), Senior Batch (women)". */
export function resultLine(e: Pick<HubEvent, "champions">): string | null {
  if (e.champions.length === 0) return null;
  if (e.champions.length === 1) return e.champions[0].names;
  return e.champions
    .slice(0, 2)
    .map((c) => (c.category ? `${c.names} (${c.category.toLowerCase()})` : c.names))
    .join(", ");
}

export const eventHref = (e: Pick<HubEvent, "slug">) => `/events/${e.slug}`;
