import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { Reveal } from "@/components/motion/Reveal";

// A plain row of figures. Each one is shown only when it's set — nothing is invented.
export function AboutStats({
  squads,
  founded,
  members,
  championships,
}: {
  squads: number;
  founded: string | null;
  members: string | null;
  championships: string | null;
}) {
  const candidates: { value: string | number | null; label: string }[] = [
    { value: founded, label: "Founded" },
    { value: members, label: "Members" },
    { value: championships, label: "Championships" },
    { value: squads > 0 ? squads : null, label: "Squads" },
  ];
  const stats = candidates.filter(
    (stat): stat is { value: string | number; label: string } => stat.value !== null && stat.value !== "",
  );

  if (stats.length === 0) return null;

  return (
    <section className="px-4 pb-16">
      <Reveal className="mx-auto max-w-6xl">
        <dl className="glass-panel flex flex-wrap justify-around gap-x-8 gap-y-6 px-6 py-8 text-center sm:divide-x sm:divide-white/10">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-[8rem] flex-1 sm:px-6">
              <dd>
                <AnimatedCounter value={stat.value} className="block text-4xl font-semibold text-white sm:text-5xl" />
              </dd>
              <dt className="mt-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-400">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
