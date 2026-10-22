import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { EventGallerySlider } from "@/components/events/EventGallerySlider";
import { Reveal } from "@/components/motion/Reveal";
import { formatYear } from "@/lib/format";
import { getAchievementById } from "@/lib/data/achievements";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const achievement = await getAchievementById(params.id);
  return { title: achievement?.title ?? "Achievement" };
}

export default async function AchievementDetailPage({ params }: { params: { id: string } }) {
  const achievement = await getAchievementById(params.id);
  if (!achievement) notFound();

  // Cover photo leads the slider, followed by the extra gallery photos.
  const images = [...(achievement.photo ? [achievement.photo] : []), ...achievement.gallery];

  return (
    <>
      <div className="px-4 pb-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/achievements"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Achievements
          </Link>
        </div>
      </div>

      <div className="px-4 pb-10">
        <Reveal className="mx-auto max-w-5xl">
          <EventGallerySlider images={images} alt={achievement.title} />
        </Reveal>
      </div>

      <div className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
              {achievement.teamName || "NSU SC"}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl">{achievement.title}</h1>

            {achievement.date && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                <CalendarDays className="h-4 w-4 text-blue-400" />
                <span className="font-mono">{formatYear(achievement.date)}</span>
              </div>
            )}

            <p className="mt-6 max-w-3xl whitespace-pre-line text-slate-300">{achievement.description}</p>
          </Reveal>
        </div>
      </div>
    </>
  );
}
