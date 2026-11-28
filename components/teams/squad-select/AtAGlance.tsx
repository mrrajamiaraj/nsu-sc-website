"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { selectSquad } from "@/components/teams/squad-select/shared";
import { GENDERS, GENDER_LABEL, type Gender, type SportGroup } from "@/lib/squads";
import { cn } from "@/lib/utils";

type SortKey = "sport" | "men" | "women" | "total";
type Sort = { key: SortKey; desc: boolean };

const sizeOf = (group: SportGroup, key: SortKey) =>
  key === "total" ? group.total : key === "men" || key === "women" ? (group.squads[key]?.athletes ?? -1) : 0;

function HeaderButton({ label, k, sort, onSort, align = "left" }: { label: string; k: SortKey; sort: Sort; onSort: (k: SortKey) => void; align?: "left" | "right" }) {
  const active = sort.key === k;
  const Icon = !active ? ArrowUpDown : sort.desc ? ArrowDown : ArrowUp;
  return (
    <button
      type="button"
      onClick={() => onSort(k)}
      className={cn(
        "group inline-flex min-h-[40px] items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] hover:text-[#f5f1e8]",
        active ? "text-[#3fcfca]" : "text-[#f5f1e8]/55",
        align === "right" && "flex-row-reverse",
      )}
    >
      {label}
      <Icon aria-hidden className={cn("h-3.5 w-3.5 transition-opacity", active ? "opacity-100" : "opacity-40 group-hover:opacity-80")} />
    </button>
  );
}

// Compact comparison of every squad. Clicking a cell opens that squad in Squad Select above.
export function AtAGlance({ groups }: { groups: SportGroup[] }) {
  const [sort, setSort] = useState<Sort>({ key: "sport", desc: false });
  const largest = Math.max(1, ...groups.flatMap((g) => GENDERS.map((x) => g.squads[x]?.athletes ?? 0)));
  const largestTotal = Math.max(1, ...groups.map((g) => g.total));

  const rows = useMemo(() => {
    const list = [...groups];
    if (sort.key === "sport") list.sort((a, b) => a.number.localeCompare(b.number));
    else list.sort((a, b) => sizeOf(a, sort.key) - sizeOf(b, sort.key));
    if (sort.desc) list.reverse();
    return list;
  }, [groups, sort]);

  // Sizes sort largest first on the first click; the sport column keeps team-sheet order.
  const onSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== "sport" }));
  const ariaSort = (key: SortKey) => (sort.key === key ? (sort.desc ? "descending" : "ascending") : "none");

  const open = (sport: string, gender: Gender) => selectSquad({ sport, gender, from: "table" });

  return (
    <section aria-labelledby="glance-heading" className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6 lg:mt-32 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="glance-heading" className="text-[40px] !font-extrabold leading-none text-[#f5f1e8] md:text-[56px]">
          All squads at a glance
        </h2>
        <p className="text-[14px] text-[#f5f1e8]/55">Pick a squad to open it above.</p>
      </div>

      <div className="no-scrollbar -mx-4 mt-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <caption className="sr-only">Athletes and captains in every NSU squad. Column headers sort the table.</caption>
          <thead>
            <tr className="border-b border-white/15">
              <th scope="col" aria-sort={ariaSort("sport")} className="sticky left-0 z-10 bg-[#0b2524] py-2 pr-4">
                <HeaderButton label="Sport" k="sport" sort={sort} onSort={onSort} />
              </th>
              {GENDERS.map((g) => (
                <th key={g} scope="col" aria-sort={ariaSort(g)} className="px-4 py-2">
                  <HeaderButton label={GENDER_LABEL[g]} k={g} sort={sort} onSort={onSort} />
                </th>
              ))}
              <th scope="col" aria-sort={ariaSort("total")} className="py-2 pl-4 text-right">
                <HeaderButton label="Total" k="total" sort={sort} onSort={onSort} align="right" />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((group) => (
              <tr key={group.slug} className="group/row border-b border-white/10 transition-colors duration-150 hover:bg-white/[0.04]">
                <th scope="row" className="sticky left-0 z-10 bg-[#0b2524] py-4 pr-4 align-middle transition-colors duration-150 group-hover/row:bg-[#102e2c]">
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-[12px] tabular-nums text-[#f5f1e8]/45">{group.number}</span>
                    <span className="font-display text-[24px] font-extrabold uppercase leading-none text-[#f5f1e8] transition-colors group-hover/row:text-[#3fcfca]">
                      {group.name}
                    </span>
                  </span>
                </th>
                {GENDERS.map((g) => {
                  const squad = group.squads[g];
                  if (!squad) {
                    return (
                      <td key={g} className="px-4 py-4 text-[14px] text-[#f5f1e8]/40">
                        No squad
                      </td>
                    );
                  }
                  return (
                    <td key={g} className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => open(group.slug, g)}
                        aria-label={`Open ${group.name} ${GENDER_LABEL[g].toLowerCase()} in Squad select: ${squad.athletes} athletes, captain ${squad.captain?.name ?? "not announced"}`}
                        className="group/cell flex w-full flex-col gap-1.5 rounded-lg px-2 py-2 text-left hover:bg-white/[0.06]"
                      >
                        <span className="flex items-baseline gap-2">
                          <span className="text-[18px] font-semibold tabular-nums text-[#f5f1e8] group-hover/cell:text-[#3fcfca]">
                            {squad.athletes > 0 ? squad.athletes : "Being built"}
                          </span>
                          {squad.athletes > 0 && (
                            <span className="truncate text-[13px] text-[#f5f1e8]/55">
                              <span className="text-[#f5f1e8]/40">Capt.</span> {squad.captain?.name ?? "—"}
                            </span>
                          )}
                        </span>
                        <span aria-hidden className="block h-[3px] w-full max-w-[160px] overflow-hidden rounded-full bg-white/10">
                          <span
                            className="block h-full rounded-full bg-[#3fcfca]/70 transition-[width] duration-500 group-hover/cell:bg-[#3fcfca]"
                            style={{ width: `${(squad.athletes / largest) * 100}%` }}
                          />
                        </span>
                      </button>
                    </td>
                  );
                })}
                <td className="py-4 pl-4 text-right">
                  <span className="text-[18px] font-semibold tabular-nums text-[#f5f1e8]">{group.total}</span>
                  <span aria-hidden className="ml-auto mt-1.5 block h-[3px] w-full max-w-[120px] overflow-hidden rounded-full bg-white/10">
                    <span className="ml-auto block h-full rounded-full bg-[#f5f1e8]/40" style={{ width: `${(group.total / largestTotal) * 100}%` }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
