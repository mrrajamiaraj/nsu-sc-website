import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapTeamRow, mapPlayerRow } from "@/lib/mappers";
import { GlassCard } from "@/components/ui/GlassCard";
import { TeamForm } from "@/components/admin/teams/TeamForm";
import { PlayerList } from "@/components/admin/teams/PlayerList";
import { updateTeam, deletePlayer, reorderPlayers } from "../../actions";

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: teamRow } = await supabase.from("teams").select("*").eq("id", id).maybeSingle();
  if (!teamRow) notFound();
  const team = mapTeamRow(teamRow);

  const { data: playerRows } = await supabase.from("players").select("*").eq("team_id", id).order("sort_order");
  const players = (playerRows ?? []).map(mapPlayerRow);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Team</h1>
        <GlassCard className="mt-6">
          <TeamForm team={team} action={updateTeam.bind(null, id)} />
        </GlassCard>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Players</h2>
          <Link
            href={`/admin/dashboard/teams/${id}/players/new`}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
            Add Player
          </Link>
        </div>
        <div className="mt-4">
          <PlayerList
            teamId={id}
            players={players}
            onReorder={reorderPlayers.bind(null, id)}
            onDelete={deletePlayer.bind(null, id)}
          />
        </div>
      </div>
    </div>
  );
}
