import { getTeams } from "@/lib/data/teams";
import { GlassCard } from "@/components/ui/GlassCard";
import { AchievementForm } from "@/components/admin/achievements/AchievementForm";
import { createAchievement } from "../actions";

export default async function NewAchievementPage() {
  const teams = await getTeams();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Add Achievement</h1>
      <GlassCard className="mt-6">
        <AchievementForm teams={teams} action={createAchievement} />
      </GlassCard>
    </div>
  );
}
