import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin, Trophy } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/format";
import type { Event } from "@/lib/types";

export function FeaturedEvent({ event }: { event: Event }) {
  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionLabel eyebrow="Don't miss out" title="Featured Event" className="mb-8" />
        </Reveal>

        <Reveal delay={0.1}>
          <GlassCard className="group grid gap-0 overflow-hidden p-0 sm:grid-cols-2">
            <div className="relative aspect-video overflow-hidden sm:aspect-auto">
              {event.bannerImage ? (
                <Image
                  src={event.bannerImage}
                  alt={event.name}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
                  <Trophy className="h-16 w-16 text-night-950/40" strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute left-4 top-4">
                <StatusBadge status={event.status} />
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-8">
              <h3 className="text-2xl font-bold text-white">{event.name}</h3>

              <div className="mt-4 flex flex-col gap-2 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-blue-400" />
                  {formatDate(event.date)}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  {event.venue}
                </span>
              </div>

              <p className="mt-4 text-slate-400">{event.description}</p>

              <Button href="/events" variant="secondary" className="mt-6 self-start">
                View All Events
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
