import Image from "next/image";
import { CalendarDays, MapPin, Trophy } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/format";
import type { Event } from "@/lib/types";

export function EventCard({ event }: { event: Event }) {
  return (
    <div className="glass-panel group flex flex-col overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {event.bannerImage ? (
          <Image
            src={event.bannerImage}
            alt={event.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
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

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-white">{event.name}</h3>

        <div className="mt-3 flex flex-col gap-1.5 text-sm text-slate-400">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-blue-400" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
            {event.venue}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm text-slate-400">{event.description}</p>
      </div>
    </div>
  );
}
