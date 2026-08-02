import { notFound } from "next/navigation";
import { getAchievementById } from "@/lib/data/achievements";
import { getTeams } from "@/lib/data/teams";
import { GlassCard } from "@/components/ui/GlassCard";
import { AchievementForm } from "@/components/admin/achievements/AchievementForm";
import { updateAchievement } from "../../actions";

export default async function EditAchievementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [achievement, teams] = await Promise.all([getAchievementById(id), getTeams()]);
  if (!achievement) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Edit Achievement</h1>
      <GlassCard className="mt-6">
        <AchievementForm achievement={achievement} teams={teams} action={updateAchievement.bind(null, id)} />
      </GlassCard>
    </div>
  );
}
