import { Heart, Trophy, Users, Zap } from "lucide-react";
import { IconChip, type ChipColor } from "@/components/ui/IconChip";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/motion/Reveal";

// Icon + color are fixed per position by design; title/description come from the backend.
const VALUE_STYLES: { icon: typeof Heart; color: ChipColor }[] = [
  { icon: Heart, color: "red" },
  { icon: Users, color: "blue" },
  { icon: Trophy, color: "amber" },
  { icon: Zap, color: "teal" },
];

export interface CoreValueContent {
  title: string;
  description: string;
}

export function CoreValues({ values }: { values: CoreValueContent[] }) {
  const items = VALUE_STYLES.map((style, index) => ({ ...style, ...values[index] }));

  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Our Core Values</h2>
          <p className="mt-3 text-slate-400">The fundamental principles that guide our actions and decisions.</p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((value, index) => (
            <Reveal key={value.title} delay={index * 0.08}>
              <GlassCard hover className="flex h-full flex-col items-center p-6 text-center">
                <IconChip icon={value.icon} color={value.color} />
                <h3 className="mt-4 text-lg font-bold text-white">{value.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{value.description}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
