import { Heart, Trophy, Users, Zap } from "lucide-react";
import { IconChip, type ChipColor } from "@/components/ui/IconChip";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/motion/Reveal";

const VALUES: { icon: typeof Heart; color: ChipColor; title: string; description: string }[] = [
  {
    icon: Heart,
    color: "red",
    title: "Passion",
    description: "We fuel athletic excellence through dedication and love for sports.",
  },
  {
    icon: Users,
    color: "blue",
    title: "Teamwork",
    description: "Together we achieve more, building bonds that last a lifetime.",
  },
  {
    icon: Trophy,
    color: "amber",
    title: "Excellence",
    description: "We strive for the highest standards in every game we play.",
  },
  {
    icon: Zap,
    color: "teal",
    title: "Innovation",
    description: "Embracing new training methods and sports technologies.",
  },
];

export function CoreValues() {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Our Core Values</h2>
          <p className="mt-3 text-slate-400">The fundamental principles that guide our actions and decisions.</p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value, index) => (
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
