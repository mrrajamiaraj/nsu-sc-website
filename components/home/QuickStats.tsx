import { CountUp } from "@/components/home/HomeMotion";
import type { QuickStats as QuickStatsData } from "@/lib/types";

// Definitions live in lib/data/stats.ts. Zero or unknown figures are dropped.
// The one solid-teal band on the page, cut on a diagonal top and bottom: a shallow
// cut on phones (--cut 16px) so the band stays compact, the full 40px from sm up.
// Deep teal on #239F9A is 4.46:1, so labels are kept at large-text size (19px bold).
export function QuickStats({ stats }: { stats: QuickStatsData }) {
  const items = [
    { label: "Years as a club", value: stats.yearsAsClub },
    { label: "Squads", value: stats.teamCount || null },
    { label: "Panel members", value: stats.memberCount || null },
    { label: "Events on record", value: stats.eventCount || null },
  ].filter((item): item is { label: string; value: number } => item.value !== null);
  if (items.length === 0) return null;

  return (
    <section
      aria-label="The club in numbers"
      className="relative -mt-px bg-[#239F9A] py-12 [--cut:16px] [clip-path:polygon(0_var(--cut),100%_0,100%_calc(100%-var(--cut)),0_100%)] sm:py-24 sm:[--cut:40px]"
    >
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-8 px-4 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8">
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-col">
            <dt className="order-last mt-2 text-[1.1875rem] font-bold leading-tight text-[#062F30] sm:mt-3">{item.label}</dt>
            <dd>
              <CountUp
                value={item.value}
                className="block font-display text-[4.25rem] font-extrabold leading-[0.85] tabular-nums text-[#062F30] sm:text-[7rem] lg:text-[8rem]"
              />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
