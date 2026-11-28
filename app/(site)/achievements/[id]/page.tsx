import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAchievementById } from "@/lib/data/achievements";
import { detailPageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const achievement = await getAchievementById(params.id);
  if (!achievement) return { title: "Achievement" };
  return detailPageMetadata({
    title: achievement.title,
    description: achievement.description,
    path: `/achievements/${achievement.id}`,
    image: achievement.photo ?? achievement.gallery[0],
  });
}

// Each achievement's own link: the layout's Trophy Room opens this story from the path.
export default async function AchievementDetailPage({ params }: { params: { id: string } }) {
  const achievement = await getAchievementById(params.id);
  if (!achievement) notFound();
  return null;
}
