import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/motion/Reveal";

function Column({ title, text, points }: { title: string; text: string; points: string[] }) {
  return (
    <div>
      <h3 className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-blue-400">{title}</h3>
      <p className="mt-4 text-lg leading-relaxed text-slate-200">{text}</p>
      {points.length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {points.map((point) => (
            <li key={point} className="flex items-baseline gap-2.5 text-sm text-slate-400">
              <span className="h-1 w-1 shrink-0 translate-y-[-0.2em] rounded-full bg-slate-500" />
              {point}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Two text columns split by a rule; no icons.
export function MissionVision({
  missionText,
  missionPoints,
  visionText,
  visionPoints,
}: {
  missionText: string;
  missionPoints: string[];
  visionText: string;
  visionPoints: string[];
}) {
  return (
    <section className="px-4 pb-16">
      <Reveal className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">Mission &amp; Vision</h2>
        <GlassCard className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-white/10">
          <div className="lg:pr-10">
            <Column title="Our Mission" text={missionText} points={missionPoints} />
          </div>
          <div className="border-t border-white/10 pt-10 lg:border-t-0 lg:pl-10 lg:pt-0">
            <Column title="Our Vision" text={visionText} points={visionPoints} />
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}
