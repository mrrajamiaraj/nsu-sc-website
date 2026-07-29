import { Eye, Target } from "lucide-react";
import { IconChip } from "@/components/ui/IconChip";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/motion/Reveal";

const MISSION_POINTS = [
  "Promote holistic student development",
  "Foster sportsmanship and fair play",
  "Build a winning athletic tradition",
];

const VISION_POINTS = [
  "Lead sports innovation in Bangladesh",
  "Produce national-level athletes",
  "Create lasting impact in the community",
];

export function MissionVision() {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Our <span className="text-gradient-brand">Mission &amp; Vision</span>
          </h2>
          <p className="mt-3 text-slate-400">
            Guiding principles that drive us toward excellence in sports and student development.
          </p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <GlassCard className="h-full p-6 sm:p-8">
              <IconChip icon={Target} color="purple" />
              <h3 className="mt-4 text-xl font-bold text-white">Our Mission</h3>
              <p className="mt-3 text-slate-400">
                To cultivate a vibrant sports culture at NSU that promotes physical fitness, mental well-being, and
                competitive excellence. We are committed to providing world-class facilities, professional coaching,
                and opportunities for students to excel in their chosen sports while maintaining academic success.
              </p>
              <ul className="mt-5 space-y-2.5">
                {MISSION_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-2.5 text-sm text-slate-200">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                    {point}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>

          <Reveal delay={0.1}>
            <GlassCard className="h-full p-6 sm:p-8">
              <IconChip icon={Eye} color="blue" />
              <h3 className="mt-4 text-xl font-bold text-white">Our Vision</h3>
              <p className="mt-3 text-slate-400">
                To be recognized as the leading university sports club in Bangladesh, setting benchmarks for athletic
                excellence, innovation in sports management, and student engagement. We envision creating champions
                who excel not just in sports, but in life.
              </p>
              <ul className="mt-5 space-y-2.5">
                {VISION_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-2.5 text-sm text-slate-200">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    {point}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
