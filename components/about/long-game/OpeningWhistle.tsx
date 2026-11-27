"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { HeroTile } from "@/lib/about";

// Each tile drifts at its own speed as the page scrolls.
const SPEEDS = [60, 140, 90, 170, 40, 120, 150, 70, 110];

function Tile({ tile, index, progress }: { tile: HeroTile; index: number; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 1], [0, reduce ? 0 : -SPEEDS[index % SPEEDS.length]]);
  return (
    <motion.figure
      style={{ y }}
      tabIndex={0}
      data-cursor="view"
      className="group relative overflow-hidden rounded-md outline-none transition-transform duration-300 ease-out hover:z-10 hover:scale-[1.08] focus-visible:z-10 focus-visible:scale-[1.08]"
    >
      <Image
        src={tile.src}
        alt=""
        fill
        sizes="(min-width: 768px) 34vw, 34vw"
        priority={index < 3}
        className="object-cover grayscale transition duration-300 group-hover:grayscale-0 group-focus-visible:grayscale-0"
      />
      {/* Teal duotone until hovered. */}
      <span aria-hidden className="absolute inset-0 bg-[#0b2524] mix-blend-color transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0" />
      <figcaption className="absolute inset-x-2 bottom-2 translate-y-2 rounded bg-[#0b2524]/90 px-2.5 py-1.5 text-[13px] font-medium text-[#f5f1e8] opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        {tile.caption}
      </figcaption>
    </motion.figure>
  );
}

// "Opening whistle": a drifting wall of club photos behind the headline.
export function OpeningWhistle({ tiles, founded }: { tiles: HeroTile[]; founded: number }) {
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const lines = [`Played since ${founded}.`, "Still", "Playing."];

  return (
    <section ref={section} aria-labelledby="about-heading" className="relative -mt-28 flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1.5 p-1.5 md:gap-2 md:p-2">
        {tiles.map((tile, i) => (
          <Tile key={tile.src} tile={tile} index={i} progress={scrollYProgress} />
        ))}
      </div>
      {/* Keeps the headline readable over the photos; lets the pointer through to them. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0b2524] via-[#0b2524]/80 to-[#0b2524]/20" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b2524] via-transparent to-[#0b2524]/40" />

      <div className="pointer-events-none relative mx-auto w-full max-w-[1280px] px-6 pb-24 pt-40 lg:px-8">
        <h1 id="about-heading" className="text-[56px] !font-extrabold uppercase leading-[0.9] text-[#f5f1e8] md:text-[96px] lg:text-[120px]">
          {lines.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.04em]">
              <motion.span
                className={i === 2 ? "block text-[#3fcfca]" : "block"}
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-6 max-w-2xl text-[18px] leading-relaxed text-[#f5f1e8]/70 md:text-[20px]"
        >
          We&rsquo;re North South University&rsquo;s student-run sports club. We play, compete and organise sport on campus, and we wear
          NSU&rsquo;s colours in every inter-university tournament.
        </motion.p>
      </div>

      {/* Scroll cue: a ball bouncing down a thin line. */}
      <a
        href="#scoreboard"
        aria-label="Scroll to the scoreboard"
        className="group absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-[#f5f1e8]/70 hover:text-[#f5f1e8]"
      >
        <span className="relative block h-14 w-px bg-[#f5f1e8]/30">
          <svg aria-hidden viewBox="0 0 24 24" className="about-scroll-ball absolute -left-[7px] top-0 h-[15px] w-[15px]">
            <circle cx="12" cy="12" r="10.5" fill="#f5f1e8" stroke="#0b2524" strokeWidth="1.4" />
            <path d="m12 7.5 4.3 3.1-1.6 5h-5.4l-1.6-5z" fill="#0b2524" />
          </svg>
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Scroll</span>
      </a>
    </section>
  );
}
