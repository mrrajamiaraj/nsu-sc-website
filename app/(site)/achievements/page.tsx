import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAchievements } from "@/lib/data/achievements";
import { getRegistrationSettings } from "@/lib/data/registration";
import { formatYear } from "@/lib/format";
import type { Achievement } from "@/lib/types";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Championships, medals and milestones won by NSU Games and Sports Club teams, year by year.",
};

const UNDATED = "undated";

export default async function AchievementsPage() {
  const [achievements, registrationSettings] = await Promise.all([
    getAchievements(),
    getRegistrationSettings(),
  ]);

  // Already sorted newest first with undated last, so grouping in order keeps that.
  const byYear: { year: string; items: Achievement[] }[] = [];
  for (const achievement of achievements) {
    const year = achievement.date ? formatYear(achievement.date) : UNDATED;
    const group = byYear[byYear.length - 1];
    if (group?.year === year) group.items.push(achievement);
    else byYear.push({ year, items: [achievement] });
  }

  return (
    <>
      <PageHeader
        icon={Trophy}
        iconClassName="text-amber-300"
        eyebrow="Record book"
        title={
          <>
            Our <span className="text-gradient-brand">Achievements</span>
          </>
        }
        intro="Championships, medals, and milestones earned by our teams over the years."
      />

      <div className="px-4 pb-20">
        {byYear.length > 0 ? (
          <div className="mx-auto max-w-5xl space-y-14">
            {byYear.map(({ year, items }) => (
              <section key={year} className="lg:grid lg:grid-cols-[9rem_1fr] lg:gap-10">
                {/* Year stays in view while its entries scroll past (desktop); top clears the fixed navbar. */}
                <div className="mb-5 lg:sticky lg:top-28 lg:mb-0 lg:self-start">
                  <h2 className="font-display text-4xl font-semibold text-white sm:text-5xl">
                    {year === UNDATED ? <span className="text-slate-400">Undated</span> : year}
                  </h2>
                  <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-slate-500">
                    {items.length} {items.length === 1 ? "entry" : "entries"}
                  </p>
                </div>

                <ol className="relative space-y-6 border-l border-white/10 pl-6 sm:pl-8">
                  {items.map((achievement, index) => (
                    <li key={achievement.id} className="relative">
                      <span
                        aria-hidden
                        className="absolute -left-[1.9rem] top-6 h-3 w-3 rounded-full border-2 border-blue-400 bg-night-950 sm:-left-[2.4rem]"
                      />
                      <Reveal delay={Math.min(index, 4) * 0.06}>
                        <AchievementCard achievement={achievement} />
                      </Reveal>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        ) : (
          <div className="glass-panel mx-auto max-w-md p-8 text-center">
            <p className="text-slate-300">No achievements recorded yet.</p>
            <p className="mt-2 text-sm text-slate-500">
              Our teams are out competing — see what&apos;s happening on the{" "}
              <Link href="/events" className="font-medium text-blue-400 hover:text-blue-300">
                events page
              </Link>
              .
            </p>
          </div>
        )}
      </div>

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
