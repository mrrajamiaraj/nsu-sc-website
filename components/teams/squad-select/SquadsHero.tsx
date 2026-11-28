"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FlapText } from "@/components/home/matchday/SplitFlap";
import { cn } from "@/lib/utils";

const CELL_BORDERS = [
  "border-r border-b md:border-b-0 lg:border-b",
  "border-b md:border-b-0 md:border-r lg:border-r-0 lg:border-b",
  "border-r",
  "",
];

type Stat = { value: number; label: string; href?: string; hint?: string };

// One counter: the server renders the real figure; after load the tiles flip through and
// land on it. Hover or focus flips it again.
function Counter({ stat, index, play }: { stat: Stat; index: number; play: boolean }) {
  const reduce = Boolean(useReducedMotion());
  const [replay, setReplay] = useState(0);
  const body = (
    <>
      <span className="sr-only">
        {stat.value} {stat.label}
        {stat.hint ? `, ${stat.hint}` : ""}
      </span>
      <FlapText
        text={String(stat.value)}
        charset="0123456789"
        play={play}
        still={reduce}
        delay={index * 140}
        replay={replay}
        className="text-[40px] lg:text-[48px]"
      />
      <span aria-hidden className="mt-3 flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/70 transition-colors group-hover:text-[#3fcfca]">
        {stat.label}
        {stat.href && <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
      </span>
    </>
  );
  const flip = () => setReplay((r) => r + 1);
  const cls = "group flex flex-col items-start px-5 py-6 transition-colors duration-150 hover:bg-white/[0.03] lg:px-6";
  return stat.href ? (
    <Link href={stat.href} onPointerEnter={flip} onFocus={flip} className={cls}>
      {body}
    </Link>
  ) : (
    <div tabIndex={0} onPointerEnter={flip} onFocus={flip} className={cls}>
      {body}
    </div>
  );
}

export function SquadsHero({ athletes, squads, sports, titles }: { athletes: number; squads: number; sports: number; titles: number }) {
  const [play, setPlay] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setPlay(true), 250);
    return () => window.clearTimeout(t);
  }, []);

  const stats: Stat[] = [
    { value: athletes, label: "Athletes" },
    { value: squads, label: "Squads" },
    { value: sports, label: "Sports" },
    { value: titles, label: titles === 1 ? "Title" : "Titles", href: "/achievements?type=title", hint: "see them in the trophy room" },
  ];

  return (
    <section aria-labelledby="squads-heading" className="mx-auto max-w-[1280px] px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
      <div className="grid items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#3fcfca]/80">Teams</p>
          <h1 id="squads-heading" className="mt-4 text-[56px] !font-extrabold leading-[0.88] text-[#f5f1e8] md:text-[80px] lg:text-[104px]">
            Our squads
          </h1>
          <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-[#f5f1e8]/70">
            {sports} sports, {squads} squads, {athletes} athletes wearing NSU colours.
          </p>
        </div>
        <div className="lg:col-span-5">
          {/* 2x2 beside the title on desktop, one row of four on tablets, 2x2 on phones. */}
          <div className="grid grid-cols-2 border-y border-white/10 md:grid-cols-4 lg:grid-cols-2">
            {stats.map((stat, i) => (
              <div key={stat.label} className={cn("border-white/10", CELL_BORDERS[i])}>
                <Counter stat={stat} index={i} play={play} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
