"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import type { Player } from "@/lib/types";

export function PlayerList({
  teamId,
  players,
  onReorder,
  onDelete,
}: {
  teamId: string;
  players: Player[];
  onReorder: (orderedIds: string[]) => Promise<void>;
  onDelete: (playerId: string) => Promise<void>;
}) {
  if (!players.length) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-slate-500">
        No players yet.
      </p>
    );
  }

  return (
    <SortableList
      items={players}
      onReorder={onReorder}
      renderItem={(player) => (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{player.name}</p>
            <p className="text-xs text-slate-500">{player.position}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/dashboard/teams/${teamId}/players/${player.id}/edit`}
              className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <ConfirmDeleteButton action={onDelete.bind(null, player.id)} itemLabel={player.name} />
          </div>
        </div>
      )}
    />
  );
}
