import { Reveal } from "@/components/motion/Reveal";

interface StatItem {
  label: string;
  value: string | number | null;
}

// A plain row of figures. Items without a value are dropped, so nothing is invented.
export function StatRow({ items, className }: { items: StatItem[]; className?: string }) {
  const stats = items.filter((item) => item.value !== null && item.value !== "");
  if (stats.length === 0) return null;

  return (
    <section className={className ?? "px-4 pb-16"}>
      <Reveal className="mx-auto max-w-5xl">
        <dl className="glass-panel flex flex-wrap justify-around gap-x-8 gap-y-6 px-6 py-8 text-center sm:divide-x sm:divide-white/10">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-[8rem] flex-1 sm:px-6">
              <dd className="text-4xl font-semibold text-white sm:text-5xl">{stat.value}</dd>
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
