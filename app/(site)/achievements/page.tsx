import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { Reveal } from "@/components/motion/Reveal";
import { getAchievements } from "@/lib/data/achievements";
import { getRegistrationSettings } from "@/lib/data/registration";

export const metadata: Metadata = {
  title: "Achievements",
};

export default async function AchievementsPage() {
  const [achievements, registrationSettings] = await Promise.all([
    getAchievements(),
    getRegistrationSettings(),
  ]);

  return (
    <>
      <div className="px-4 pb-12 pt-4 text-center">
        <Reveal y={16}>
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
            <Trophy className="h-3.5 w-3.5 text-amber-300" />
            Hall of Fame
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
            Our <span className="text-gradient-brand">Achievements</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Championships, medals, and milestones earned by our teams over the years.
          </p>
        </Reveal>
      </div>

      <div className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement, index) => (
            <Reveal key={achievement.id} delay={index * 0.08}>
              <AchievementCard achievement={achievement} />
            </Reveal>
          ))}
        </div>
        {!achievements.length && (
          <p className="mx-auto max-w-md pt-6 text-center text-sm text-slate-500">
            No achievements posted yet — check back soon.
          </p>
        )}
      </div>

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
