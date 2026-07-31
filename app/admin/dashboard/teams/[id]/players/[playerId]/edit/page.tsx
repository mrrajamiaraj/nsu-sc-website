import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapPlayerRow } from "@/lib/mappers";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlayerForm } from "@/components/admin/teams/PlayerForm";
import { updatePlayer } from "../../../../actions";

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string; playerId: string }>;
}) {
  const { id, playerId } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase.from("players").select("*").eq("id", playerId).maybeSingle();
  if (!row) notFound();
  const player = mapPlayerRow(row);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Edit Player</h1>
      <GlassCard className="mt-6">
        <PlayerForm player={player} action={updatePlayer.bind(null, id, playerId)} />
      </GlassCard>
    </div>
  );
}
