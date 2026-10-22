"use client";

import { useState } from "react";
import Link from "next/link";
import { ListFilter } from "lucide-react";
import { FilterPill } from "@/components/ui/FilterPill";
import { EventCard } from "@/components/events/EventCard";
import { EventResultRow } from "@/components/events/EventResultRow";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { Event, EventStatus } from "@/lib/types";

type FilterValue = "All" | EventStatus;

const SECTIONS: { status: EventStatus; tab: string; title: string }[] = [
  { status: "Running", tab: "Live now", title: "Live now" },
  { status: "Upcoming", tab: "Upcoming", title: "Coming up" },
  { status: "Finished", tab: "Results", title: "Results" },
];

function CardSection({ events }: { events: Event[] }) {
  if (events.length === 1) {
    return (
      <Reveal>
        <EventCard event={events[0]} layout="wide" />
      </Reveal>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) => (
        <Reveal key={event.id} delay={Math.min(index, 6) * 0.08} className="h-full">
          <EventCard event={event} />
        </Reveal>
      ))}
    </div>
  );
}

export function EventsFilterView({ eventsByStatus }: { eventsByStatus: Record<EventStatus, Event[]> }) {
  const [filter, setFilter] = useState<FilterValue>("All");

  const sections = SECTIONS.filter((section) => eventsByStatus[section.status].length > 0);
  const visibleSections = sections.filter((section) => filter === "All" || filter === section.status);
  const total = sections.reduce((sum, section) => sum + eventsByStatus[section.status].length, 0);

  if (sections.length === 0) {
    return (
      <div className="px-4 pb-20">
        <div className="glass-panel mx-auto max-w-xl p-8 text-center">
          <h2 className="text-xl font-bold text-white">No events listed yet</h2>
          <p className="mt-2 text-sm text-slate-400">
            Fixtures and results will appear here as the panel adds them. Want to know what&rsquo;s planned?{" "}
            <Link href="/contact" className="font-medium text-blue-400 hover:text-blue-300">
              Ask the panel
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  const tabs: { value: FilterValue; label: string; count: number }[] = [
    { value: "All", label: "All", count: total },
    ...sections.map((section) => ({
      value: section.status,
      label: section.tab,
      count: eventsByStatus[section.status].length,
    })),
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 pb-12">
        <ListFilter className="mr-1 h-4 w-4 text-slate-500" />
        {tabs.map((tab) => (
          <FilterPill
            key={tab.value}
            active={filter === tab.value}
            onClick={() => setFilter(tab.value)}
            layoutId="events-filter-pill"
          >
            <span className="inline-flex items-center gap-2">
              {tab.label}
              <span className={cn("font-mono text-xs", filter === tab.value ? "text-night-950/70" : "text-slate-500")}>
                {tab.count}
              </span>
            </span>
          </FilterPill>
        ))}
      </div>

      {visibleSections.map((section) => {
        const events = eventsByStatus[section.status];
        return (
          <section key={section.status} className="px-4 pb-16">
            <div className="mx-auto max-w-6xl">
              <Reveal>
                <h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl">{section.title}</h2>
              </Reveal>
              {section.status === "Finished" ? (
                <div className="flex flex-col gap-3">
                  {events.map((event) => (
                    <Reveal key={event.id}>
                      <EventResultRow event={event} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <CardSection events={events} />
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
