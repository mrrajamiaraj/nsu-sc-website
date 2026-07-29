"use client";

import { useState } from "react";
import { ListFilter } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FilterPill } from "@/components/ui/FilterPill";
import { EventCard } from "@/components/events/EventCard";
import { Reveal } from "@/components/motion/Reveal";
import type { Event, EventStatus } from "@/lib/types";

type FilterValue = "All" | EventStatus;

const SECTIONS: { status: EventStatus; title: string; description: string }[] = [
  { status: "Running", title: "Running", description: "Happening right now." },
  { status: "Upcoming", title: "Upcoming", description: "Mark your calendar." },
  { status: "Finished", title: "Finished", description: "Recent results and highlights." },
];

const FILTERS: FilterValue[] = ["All", "Running", "Upcoming", "Finished"];

export function EventsFilterView({ eventsByStatus }: { eventsByStatus: Record<EventStatus, Event[]> }) {
  const [filter, setFilter] = useState<FilterValue>("All");

  const visibleSections = SECTIONS.filter(
    (section) => (filter === "All" || filter === section.status) && eventsByStatus[section.status].length > 0,
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 pb-12">
        <ListFilter className="mr-1 h-4 w-4 text-slate-500" />
        {FILTERS.map((value) => (
          <FilterPill key={value} active={filter === value} onClick={() => setFilter(value)} layoutId="events-filter-pill">
            {value === "All" ? "All Events" : value}
          </FilterPill>
        ))}
      </div>

      {visibleSections.length === 0 ? (
        <p className="px-4 pb-16 text-center text-slate-400">No events to show yet — check back soon.</p>
      ) : (
        visibleSections.map((section) => (
          <section key={section.status} className="px-4 pb-16">
            <div className="mx-auto max-w-6xl">
              <Reveal>
                <SectionLabel
                  eyebrow={section.status}
                  title={section.title}
                  description={section.description}
                  className="mb-8"
                />
              </Reveal>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {eventsByStatus[section.status].map((event, index) => (
                  <Reveal key={event.id} delay={index * 0.08}>
                    <EventCard event={event} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        ))
      )}
    </>
  );
}
