import { GlassCard } from "@/components/ui/GlassCard";
import { TeamForm } from "@/components/admin/teams/TeamForm";
import { createTeam } from "../actions";

export default function NewTeamPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Add Team</h1>
      <GlassCard className="mt-6">
        <TeamForm action={createTeam} />
      </GlassCard>
    </div>
  );
}
