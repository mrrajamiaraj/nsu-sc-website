import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Trophy } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { formatEventDate } from "@/lib/format";
import type { Event } from "@/lib/types";

// "wide" puts the image beside the text — used when a section holds a single event.
export function EventCard({ event, layout = "default" }: { event: Event; layout?: "default" | "wide" }) {
  const when = formatEventDate(event, { withRange: true });
  const wide = layout === "wide";

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        "glass-panel group flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5",
        wide && "lg:flex-row",
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/10] w-full shrink-0 overflow-hidden",
          wide && "lg:aspect-auto lg:min-h-[20rem] lg:w-3/5",
        )}
      >
        {event.bannerImage ? (
          <Image
            src={event.bannerImage}
            alt={event.name}
            fill
            sizes={wide ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
            <Trophy className="h-12 w-12 text-night-950/40" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={event.status} />
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col p-5", wide && "sm:p-8 lg:justify-center")}>
        {when && (
          <p className="flex items-center gap-2 font-mono text-xs text-blue-400">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {when}
          </p>
        )}
        <h3 className={cn("mt-2 font-bold text-white", wide ? "text-2xl sm:text-3xl" : "line-clamp-2 text-lg")}>
          {event.name}
        </h3>
        {event.venue && (
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </p>
        )}
        {event.description && (
          <p className={cn("mt-3 text-sm text-slate-400", wide ? "line-clamp-4" : "line-clamp-3")}>{event.description}</p>
        )}
        {wide && (
          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-blue-400">
            Event details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </Link>
  );
}
