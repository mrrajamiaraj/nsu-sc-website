"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FlapText } from "@/components/home/matchday/SplitFlap";
import { RoundPortrait } from "@/components/alumni/relay/shared";
import type { OpenPerson } from "@/components/alumni/relay/PanelView";
import type { RelayPerson } from "@/lib/alumni-relay";

type Stat = { value: number; label: string; action: string; onClick: () => void };

// Split-flap counters: the server renders the real numbers; they flip on load and again on
// hover. Each one is a shortcut (Alumni opens the directory, Panels jumps to the relay).
export function RelayHero({ people, panels, now, onAll, onPanels }: { people: number; panels: number; now: number; onAll: () => void; onPanels: () => void }) {
  const reduce = Boolean(useReducedMotion());
  const [play, setPlay] = useState(false);
  const [replay, setReplay] = useState<Record<string, number>>({});
  useEffect(() => {
    const t = window.setTimeout(() => setPlay(true), 250);
    return () => window.clearTimeout(t);
  }, []);
  const stats: Stat[] = [
    { value: people, label: "Alumni", action: "See everyone", onClick: onAll },
    { value: panels, label: "Panels", action: "Walk the relay", onClick: onPanels },
    // Only once enough people have told us where they are now. ("Now" is free text, so it's
    // counted as people, not organisations.)
    ...(now >= 10 ? [{ value: now, label: "Where they are now", action: "See everyone", onClick: onAll }] : []),
  ];

  return (
    <section aria-labelledby="alumni-heading" className="mx-auto max-w-[1280px] px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
      <div className="grid items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#3fcfca]/80">Alumni</p>
          <h1 id="alumni-heading" className="mt-4 text-[56px] !font-extrabold leading-[0.88] text-[#f5f1e8] md:text-[80px] lg:text-[104px]">
            Past panels
          </h1>
          <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-[#f5f1e8]/70">
            {people} people have run this club across {panels} panels. This is where the baton went.
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="no-scrollbar -mx-4 flex overflow-x-auto border-y border-white/10 px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
            {stats.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={s.onClick}
                onPointerEnter={() => setReplay((r) => ({ ...r, [s.label]: (r[s.label] ?? 0) + 1 }))}
                onFocus={() => setReplay((r) => ({ ...r, [s.label]: (r[s.label] ?? 0) + 1 }))}
                className="group flex min-w-[140px] flex-col items-start border-white/10 px-4 py-6 text-left hover:bg-white/[0.03] sm:min-w-0 [&:not(:last-child)]:border-r"
              >
                <span className="sr-only">
                  {s.value} {s.label}. {s.action}.
                </span>
                <FlapText text={String(s.value)} charset="0123456789" play={play} still={reduce} delay={i * 140} replay={replay[s.label] ?? 0} className="text-[34px] xl:text-[40px]" />
                <span aria-hidden className="mt-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/70 group-hover:text-[#3fcfca]">
                  {s.label}
                </span>
                <span aria-hidden className="mt-1 text-[12px] text-[#3fcfca] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {s.action} →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// "Where are they now": a slow marquee of people who've told us. Hover pauses it.
// Renders nothing until at least three people have "now" details.
export function NowStrip({ people, onOpen }: { people: RelayPerson[]; onOpen: OpenPerson }) {
  const reduce = Boolean(useReducedMotion());
  const [paused, setPaused] = useState(false);
  if (people.length < 3) return null;
  const loop = [...people, ...people];
  return (
    <section aria-label="Where are they now" className="mt-16 overflow-hidden border-y border-white/10 py-4" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <motion.ul
        className="flex w-max gap-3"
        animate={reduce || paused ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: people.length * 4, ease: "linear", repeat: Infinity }}
      >
        {loop.map((p, i) => (
          <li key={`${p.id}-${i}`} aria-hidden={i >= people.length || undefined}>
            <button
              type="button"
              tabIndex={i >= people.length ? -1 : 0}
              onClick={(e) => onOpen(p, "strip", e.currentTarget)}
              className="group flex items-center gap-3 rounded-full border border-white/15 py-1.5 pl-1.5 pr-4 hover:-translate-y-0.5 hover:border-[#3fcfca]/60"
            >
              <RoundPortrait person={p} size={32} colour />
              <span className="whitespace-nowrap text-[14px] text-[#f5f1e8]">
                <span className="font-semibold">{p.name}</span> <span className="text-[#f5f1e8]/60">· {p.now}</span>
              </span>
            </button>
          </li>
        ))}
      </motion.ul>
    </section>
  );
}
