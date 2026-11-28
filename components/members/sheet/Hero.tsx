"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FlapText } from "@/components/home/matchday/SplitFlap";
import { Baton } from "@/components/alumni/relay/shared";
import { ANTON, TIER_FILTERS, type TierFilter } from "@/components/members/sheet/shared";
import { TIER_LABEL } from "@/lib/members-sheet";
import { cn } from "@/lib/utils";

const COUNTER_LABEL = (t: TierFilter) => (t === "all" ? "Everyone" : TIER_LABEL[t].many);

// Left: the panel's name and size. Right: tier counters that are real filter buttons for the
// roster below (split-flap on load; the active one is underlined).
export function Hero({ panelName, counts, students, advisors, tier, onTier }: { panelName: string; counts: Record<TierFilter, number>; students: number; advisors: number; tier: TierFilter; onTier: (t: TierFilter) => void }) {
  const reduce = Boolean(useReducedMotion());
  const [play, setPlay] = useState(false);
  useEffect(() => setPlay(true), []);

  return (
    <header className="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)] gap-10 px-4 pb-14 pt-8 md:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-8 lg:pt-14">
      <div>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#3fcfca]/85">
          <span>{panelName.replace(/(\d{4})-(\d{2})/, "$1–$2")} · current leg</span>
          <Link href="/alumni" className="group inline-flex items-center gap-1.5 normal-case tracking-normal text-[#f5f1e8]/70 transition hover:text-[#f5f1e8]">
            <span aria-hidden className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            <Baton className="h-5 w-5 transition-transform group-hover:-rotate-12" />
            Who held it before
          </Link>
        </p>
        <h1 className={cn(ANTON, "mt-4 text-[56px] !leading-[0.9] text-[#f5f1e8] md:text-[104px]")}>The panel</h1>
        <p className="mt-4 max-w-xl text-[18px] leading-relaxed text-[#f5f1e8]/75">
          {students} students and {advisors} faculty {advisors === 1 ? "advisor" : "advisors"} running NSU SC this year.
        </p>
      </div>

      <div role="group" aria-label="Filter the roster by tier" className="no-scrollbar -mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 md:mx-0 md:px-0 lg:gap-1">
        {TIER_FILTERS.map((t, i) => {
          const active = tier === t;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={active}
              aria-keyshortcuts={String(i + 1)}
              onClick={() => onTier(t)}
              className={cn("group relative flex shrink-0 flex-col items-start rounded-md px-3 pb-4 pt-2 text-left transition hover:bg-white/[0.04]", active && "bg-white/[0.04]")}
            >
              <span className="sr-only">
                {counts[t]} {COUNTER_LABEL(t)}. Show {t === "all" ? "everyone" : "only these"} in the roster.
              </span>
              <FlapText text={String(counts[t]).padStart(2, " ")} charset="0123456789" play={play} still={reduce} delay={i * 120} className="text-[34px] md:text-[44px]" />
              <span aria-hidden className={cn("mt-2 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors", active ? "text-[#f5f1e8]" : "text-[#f5f1e8]/60 group-hover:text-[#f5f1e8]")}>
                {COUNTER_LABEL(t)}
              </span>
              {active && <motion.span layoutId="tier-underline" aria-hidden className="absolute inset-x-3 bottom-1.5 h-[2px] rounded-full bg-[#3fcfca]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            </button>
          );
        })}
      </div>
    </header>
  );
}
