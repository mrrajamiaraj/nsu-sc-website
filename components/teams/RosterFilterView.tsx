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
        <Reveal key={player.id} delay={Math.min(index, 6) * 0.08} className="h-full">
          <PlayerCard player={player} />
        </Reveal>
      ))}
    </div>
  );
}

// Mixed-team roster: Men/Women tabs switch which squad is shown. Untagged
// players (usually staff) get their own "Others" tab when present.
export function RosterFilterView({ players }: { players: Player[] }) {
  const groups: Record<RosterFilter, Player[]> = {
    Male: players.filter((player) => player.gender === "Male"),
    Female: players.filter((player) => player.gender === "Female"),
    Other: players.filter((player) => !player.gender),
  };
  const tabs = (
    [
      { value: "Male", label: "Men" },
      { value: "Female", label: "Women" },
      { value: "Other", label: "Others" },
    ] as const
  ).filter((tab) => groups[tab.value].length > 0);

  const [filter, setFilter] = useState<RosterFilter>(tabs[0]?.value ?? "Male");

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {tabs.map(({ value, label }) => (
          <FilterPill
            key={value}
            active={filter === value}
            onClick={() => setFilter(value)}
            layoutId="roster-filter-pill"
            count={groups[value].length}
          >
            {label}
          </FilterPill>
        ))}
      </div>

      <PlayerGrid key={filter} players={groups[filter]} />
    </>
  );
}
