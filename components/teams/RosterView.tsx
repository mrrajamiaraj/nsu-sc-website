"use client";

import { useState } from "react";
import { ListFilter } from "lucide-react";
import { PlayerCard } from "@/components/teams/PlayerCard";
import { FilterPill } from "@/components/ui/FilterPill";
import { Reveal } from "@/components/motion/Reveal";
import type { Player } from "@/lib/types";

// Teams with a single squad (category null on every player) render as a flat
// grid, same as before. Teams with 2+ distinct categories (e.g. Volleyball's
// Boys/Female rosters) get filter pills and grouped sections instead.
export function RosterView({ players }: { players: Player[] }) {
  const categories = Array.from(new Set(players.map((p) => p.category).filter((c): c is string => Boolean(c))));

  const [filter, setFilter] = useState<string>("All");

  if (players.length === 0) {
    return <p className="text-sm text-slate-500">Roster coming soon.</p>;
  }

  if (categories.length < 2) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player, index) => (
          <Reveal key={player.id} delay={index * 0.08}>
            <PlayerCard player={player} />
          </Reveal>
        ))}
      </div>
    );
  }

  const visibleCategories = filter === "All" ? categories : [filter];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <ListFilter className="mr-1 h-4 w-4 text-slate-500" />
        {["All", ...categories].map((value) => (
          <FilterPill key={value} active={filter === value} onClick={() => setFilter(value)} layoutId="roster-filter-pill">
            {value}
          </FilterPill>
        ))}
      </div>

      {visibleCategories.map((category) => {
        const categoryPlayers = players.filter((p) => p.category === category);
        if (categoryPlayers.length === 0) return null;

        return (
          <div key={category} className="mb-10 last:mb-0">
            <h3 className="mb-5 text-lg font-bold text-white">{category}</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categoryPlayers.map((player, index) => (
                <Reveal key={player.id} delay={index * 0.08}>
                  <PlayerCard player={player} />
                </Reveal>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
