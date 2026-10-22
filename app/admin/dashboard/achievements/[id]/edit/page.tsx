import { notFound } from "next/navigation";
import { getAchievementById } from "@/lib/data/achievements";
import { getTeams } from "@/lib/data/teams";
import { GlassCard } from "@/components/ui/GlassCard";
import { AchievementForm } from "@/components/admin/achievements/AchievementForm";
import { AboutGalleryManager } from "@/components/admin/about/AboutGalleryManager";
import { addAchievementGalleryImage, removeAchievementGalleryImage, updateAchievement } from "../../actions";

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

      <h2 className="mt-10 text-xl font-bold text-white">Slider Photos</h2>
      <p className="mt-1 text-sm text-slate-400">
        Shown in the slider on the achievement page, after the main photo above.
      </p>
      <GlassCard className="mt-4">
        <AboutGalleryManager
          images={achievement.gallery}
          onAdd={addAchievementGalleryImage.bind(null, id)}
          onRemove={removeAchievementGalleryImage.bind(null, id)}
        />
      </GlassCard>
    </div>
  );
}
