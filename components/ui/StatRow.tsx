import { Reveal } from "@/components/motion/Reveal";

interface StatItem {
  label: string;
  value: string | number | null;
}

// A plain row of figures. Items without a value are dropped, so nothing is invented.
// Phones get a 2×2 grid (a leftover odd item spans the row); wider screens one divided row.
export function StatRow({ items, className }: { items: StatItem[]; className?: string }) {
  const stats = items.filter((item) => item.value !== null && item.value !== "");
  if (stats.length === 0) return null;

  return (
    <section className={className ?? "px-4 pb-16"}>
      <Reveal className="mx-auto max-w-5xl">
        <dl className="glass-panel grid grid-cols-2 gap-x-4 gap-y-7 px-5 py-7 text-center sm:flex sm:flex-wrap sm:justify-around sm:gap-x-8 sm:gap-y-6 sm:divide-x sm:divide-white/10 sm:px-6 sm:py-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={
                index === stats.length - 1 && stats.length % 2 === 1
                  ? "col-span-2 min-w-0 sm:min-w-[8rem] sm:flex-1 sm:px-6"
                  : "min-w-0 sm:min-w-[8rem] sm:flex-1 sm:px-6"
              }
            >
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
