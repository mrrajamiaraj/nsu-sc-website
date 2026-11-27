import { CountUp } from "@/components/home/HomeMotion";
import type { QuickStats as QuickStatsData } from "@/lib/types";

// Definitions live in lib/data/stats.ts. Zero or unknown figures are dropped.
// The one bright-teal band on the page, cut on a diagonal top and bottom.
export function QuickStats({ stats }: { stats: QuickStatsData }) {
  const items = [
    { label: "Years", value: stats.yearsAsClub },
    { label: "Squads", value: stats.teamCount || null },
    { label: "Panel", value: stats.memberCount || null },
    { label: "Events", value: stats.eventCount || null },
  ].filter((item): item is { label: string; value: number } => item.value !== null);
  if (items.length === 0) return null;

  return (
    <section
      aria-label="The club in numbers"
      className="relative -mt-px bg-[linear-gradient(100deg,#3fcfca_0%,#20b6b1_100%)] py-20 [clip-path:polygon(0_40px,100%_0,100%_calc(100%-40px),0_100%)] sm:py-24"
    >
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-4 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col">
            <dt className="order-last mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#002e2c]/80 sm:text-sm">
              {item.label}
            </dt>
            <dd>
              <CountUp
                value={item.value}
                className="block font-display text-[5.5rem] font-extrabold leading-[0.85] tabular-nums text-[#002e2c] sm:text-[7rem] lg:text-[8rem]"
              />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
