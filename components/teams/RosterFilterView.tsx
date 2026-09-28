"use client";

import { useState } from "react";
import { PlayerCard } from "@/components/teams/PlayerCard";
import { FilterPill } from "@/components/ui/FilterPill";
import { Reveal } from "@/components/motion/Reveal";
import type { Player } from "@/lib/types";

type RosterFilter = "Male" | "Female" | "Other";

export function PlayerGrid({ players }: { players: Player[] }) {
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

// Mixed-team roster: Male/Female pills switch which squad is shown. Untagged
// players (usually staff) get their own "Other Members" pill when present.
export function RosterFilterView({ players }: { players: Player[] }) {
  const groups: Record<RosterFilter, Player[]> = {
    Male: players.filter((player) => player.gender === "Male"),
    Female: players.filter((player) => player.gender === "Female"),
    Other: players.filter((player) => !player.gender),
  };
  const filters: { value: RosterFilter; label: string }[] = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    ...(groups.Other.length > 0 ? [{ value: "Other" as const, label: "Other Members" }] : []),
  ];

  const [filter, setFilter] = useState<RosterFilter>(groups.Male.length > 0 ? "Male" : "Female");
  const visible = groups[filter];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {filters.map(({ value, label }) => (
          <FilterPill key={value} active={filter === value} onClick={() => setFilter(value)} layoutId="roster-filter-pill">
            {label} <span className="ml-1 opacity-70">({groups[value].length})</span>
          </FilterPill>
        ))}
      </div>

      {visible.length > 0 ? (
        <PlayerGrid key={filter} players={visible} />
      ) : (
        <p className="text-sm text-slate-500">No {filter === "Other" ? "other" : filter.toLowerCase()} members yet.</p>
      )}
    </>
  );
}
