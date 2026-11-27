import Link from "next/link";
import { ArrowRight, Award, Medal, Star, Trophy, type LucideIcon } from "lucide-react";
import { RevealOnView } from "@/components/home/HomeMotion";
import { oneLine } from "@/lib/home";
import { formatYear } from "@/lib/format";
import type { Achievement } from "@/lib/types";

const ICONS: LucideIcon[] = [Trophy, Medal, Award, Star];

// A trophy shelf: four honours standing on one ledge, year first.
export function WallOfFame({ items }: { items: Achievement[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="fame-heading" className="bg-[#082120] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#79d8d5]">Wall of fame</p>
            <h2 id="fame-heading" className="mt-2 text-5xl !font-extrabold text-white sm:text-6xl">
              Honours
            </h2>
          </div>
          <Link href="/achievements" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#79d8d5] hover:text-white">
            All achievements
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <ul className="grid gap-x-8 gap-y-12 border-b-4 border-white/15 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <li key={item.id}>
                <RevealOnView delay={0.05 * index}>
                  <Link href={`/achievements/${item.id}`} className="group flex h-full flex-col">
                    <span className="flex items-center justify-between">
                      <span className="font-display text-6xl font-extrabold leading-none text-white/90">
                        {item.date ? formatYear(item.date) : "—"}
                      </span>
                      <Icon aria-hidden className="h-8 w-8 text-[#79d8d5]" strokeWidth={1.6} />
                    </span>
                    <span className="mt-4 text-balance text-lg font-semibold leading-snug text-white group-hover:text-[#79d8d5]">
                      {item.title}
                    </span>
                    {item.description && <span className="mt-2 text-sm text-slate-400">{oneLine(item.description)}</span>}
                    {item.teamName && <span className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.teamName}</span>}
                  </Link>
                </RevealOnView>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
