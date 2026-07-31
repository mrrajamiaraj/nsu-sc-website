import { GlassCard } from "@/components/ui/GlassCard";
import { PlayerForm } from "@/components/admin/teams/PlayerForm";
import { createPlayer } from "../../../actions";

export default async function NewPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Add Player</h1>
      <GlassCard className="mt-6">
        <PlayerForm action={createPlayer.bind(null, id)} />
      </GlassCard>
    </div>
  );
}
