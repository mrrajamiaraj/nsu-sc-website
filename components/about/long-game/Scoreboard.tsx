"use client";

import { useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { FlapText } from "@/components/home/matchday/SplitFlap";
import { useMedia } from "@/components/contact/interaction/hooks";
import type { ScoreStat } from "@/lib/about";
import { cn } from "@/lib/utils";

// One counter. The server renders the real number; once in view the digits flip through
// and land on it. Hovering (or focusing) flips it again and shows the detail line, which
// touch screens show all the time.
function Counter({ stat, play, index }: { stat: ScoreStat; play: boolean; index: number }) {
  const reduce = Boolean(useReducedMotion());
  const touch = !useMedia("(hover: hover) and (pointer: fine)");
  const [replay, setReplay] = useState(0);
  const [hover, setHover] = useState(false);
  const show = touch || hover;
  return (
    <div
      tabIndex={0}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        setHover(true);
        setReplay((r) => r + 1);
      }}
      onPointerLeave={() => setHover(false)}
      onFocus={() => {
        setHover(true);
        setReplay((r) => r + 1);
      }}
      onBlur={() => setHover(false)}
      className="flex flex-col items-center px-3 py-8 text-center md:py-10"
    >
      <span className="sr-only">
        {stat.value} {stat.label}. {stat.detail}
      </span>
      <FlapText
        text={String(stat.value)}
        charset="0123456789"
        play={play}
        still={reduce}
        delay={index * 150}
        replay={replay}
        className="justify-center text-[52px] md:text-[72px]"
      />
      <span aria-hidden className="mt-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-[#f5f1e8]/80">
        {stat.label}
      </span>
      <span
        aria-hidden
        className={cn("mt-2 max-w-[16rem] text-[14px] leading-snug text-[#3fcfca] transition duration-200", show ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0")}
      >
        {stat.detail}
      </span>
    </div>
  );
}

// "The scoreboard": the club's real numbers as split-flap counters.
export function Scoreboard({ stats }: { stats: ScoreStat[] }) {
  const ref = useRef<HTMLElement>(null);
  const play = useInView(ref, { once: true, amount: 0.4 });
  return (
    <section ref={ref} id="scoreboard" aria-label="The club in numbers" className="scroll-mt-24 border-y border-white/10 bg-[#071a19]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 divide-white/10 px-2 md:grid-cols-4 md:divide-x lg:px-8">
        {stats.map((stat, i) => (
          <div key={stat.label} className={cn(i < 2 && "border-b border-white/10 md:border-b-0", i % 2 === 0 && "border-r border-white/10 md:border-r-0")}>
            <Counter stat={stat} play={play} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
