"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BLUR, ResultTag, SportLabel } from "@/components/achievements/trophy/shared";
import { useRichPointer } from "@/components/contact/interaction/hooks";
import type { EntryType, TrophyEntry } from "@/lib/trophy";
import { cn } from "@/lib/utils";

// Titles and personal awards read biggest; moments read smallest.
const TITLE_SIZE: Record<EntryType, string> = {
  title: "text-[22px] md:text-[26px]",
  individual: "text-[22px] md:text-[26px]",
  podium: "text-[20px] md:text-[22px]",
  milestone: "text-[19px] md:text-[20px]",
  moment: "text-[17px] md:text-[18px]",
};

function Row({ entry, index, onOpen }: { entry: TrophyEntry; index: number; onOpen: (id: string) => void }) {
  const rich = useRichPointer();
  const [hover, setHover] = useState(false);
  const rx = useSpring(0, { stiffness: 220, damping: 18 });
  const ry = useSpring(0, { stiffness: 220, damping: 18 });

  // The thumbnail tilts toward the cursor.
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!rich) return;
    const box = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - box.left) / box.width - 0.5) * 12);
    rx.set(-((e.clientY - box.top) / box.height - 0.5) * 10);
  };
  const reset = () => {
    setHover(false);
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35, delay: Math.min(index, 4) * 0.06, layout: { type: "spring", stiffness: 380, damping: 34 } }}
      className="border-b border-white/10"
    >
      <button
        type="button"
        onClick={() => onOpen(entry.id)}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerMove={onMove}
        onPointerLeave={reset}
        onFocus={() => setHover(true)}
        onBlur={reset}
        className={cn(
          "group grid w-full grid-cols-1 gap-4 rounded-md px-2 py-6 text-left transition-colors duration-200 md:grid-cols-[minmax(0,1fr)_160px_44px] md:items-center md:gap-6 md:px-3",
          hover && "bg-white/[0.03]",
        )}
      >
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-3">
            <ResultTag type={entry.type} />
            <SportLabel sport={entry.sport} />
          </span>
          <span className={cn("mt-3 block font-semibold leading-snug text-[#f5f1e8] transition-transform duration-200", TITLE_SIZE[entry.type], hover && "translate-x-1.5")}>
            {entry.title}
          </span>
          <span className="mt-1.5 block text-[15px] leading-snug text-[#f5f1e8]/65">{entry.summary}</span>
        </span>

        <span className="[perspective:600px]">
          <motion.span
            layoutId={`trophy-photo-${entry.id}`}
            style={{ rotateX: rx, rotateY: ry }}
            data-cursor="view"
            className={cn(
              "relative block aspect-[16/11] w-full overflow-hidden rounded-lg bg-[#0f302e] transition-transform duration-300 md:h-[110px] md:w-[160px]",
              hover && "scale-105",
            )}
          >
            {entry.photos[0] && (
              <>
                <Image
                  src={entry.photos[0]}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 160px, 100vw"
                  placeholder="blur"
                  blurDataURL={BLUR}
                  className={cn("object-cover transition duration-300", hover ? "grayscale-0" : "grayscale")}
                />
                <span aria-hidden className={cn("absolute inset-0 bg-[#0b2524] mix-blend-color transition-opacity duration-300", hover ? "opacity-0" : "opacity-100")} />
              </>
            )}
          </motion.span>
        </span>

        <span
          aria-hidden
          className={cn(
            "hidden h-11 w-11 items-center justify-center rounded-full border border-[#3fcfca] text-[#3fcfca] transition duration-200 md:flex",
            hover ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
          )}
        >
          <ArrowRight className="h-5 w-5" />
        </span>
      </button>
    </motion.li>
  );
}

// Huge outlined year that fills solid, left to right, as its section scrolls through.
function YearMarker({ year, count, target }: { year: number; count: number; target: React.RefObject<HTMLElement> }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start 0.8", "end 0.35"] });
  const clip = useTransform(scrollYProgress, (p) => `inset(0 ${100 - Math.min(1, Math.max(0, p)) * 100}% 0 0)`);
  return (
    <div className="sticky top-[176px] z-10 bg-[#0b2524]/95 py-2 md:top-[188px] lg:bg-transparent lg:py-0">
      <p className="relative font-display text-[56px] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(245,241,232,0.3)] lg:text-[128px] xl:text-[160px]">
        {year}
        <motion.span aria-hidden className="absolute inset-0 text-[#f5f1e8] [-webkit-text-stroke:0]" style={reduce ? undefined : { clipPath: clip }}>
          {year}
        </motion.span>
      </p>
      <p className="mt-1 text-[13px] text-[#f5f1e8]/55 lg:mt-3">
        {count} {count === 1 ? "entry" : "entries"}
      </p>
    </div>
  );
}

function YearSection({ year, entries, onOpen }: { year: number; entries: TrophyEntry[]; onOpen: (id: string) => void }) {
  const ref = useRef<HTMLElement>(null);
  return (
    <motion.section
      ref={ref}
      layout="position"
      id={`year-${year}`}
      data-year={year}
      aria-label={`Achievements in ${year}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="scroll-mt-48 lg:grid lg:grid-cols-12 lg:gap-10"
    >
      <div className="lg:col-span-3">
        <YearMarker year={year} count={entries.length} target={ref} />
      </div>
      <ol className="lg:col-span-9 lg:pl-10">
        <AnimatePresence initial={false}>
          {entries.map((entry, i) => (
            <Row key={entry.id} entry={entry} index={i} onOpen={onOpen} />
          ))}
        </AnimatePresence>
      </ol>
    </motion.section>
  );
}

// The ledger: year by year, with a rail that fills as you read down it.
export function Ledger({ groups, onOpen }: { groups: { year: number; entries: TrophyEntry[] }[]; onOpen: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.6", "end 0.6"] });
  return (
    <div ref={ref} className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
      {/* Rail between the year column and the entries. */}
      <span aria-hidden className="absolute bottom-0 top-0 hidden w-[2px] bg-[#f5f1e8]/10 lg:left-[calc(25%+0.5rem)] lg:block" />
      <motion.span aria-hidden className="absolute top-0 hidden h-full w-[2px] origin-top bg-[#3fcfca] lg:left-[calc(25%+0.5rem)] lg:block" style={{ scaleY: scrollYProgress }} />
      <div className="space-y-16">
        <AnimatePresence initial={false}>
          {groups.map((group) => (
            <YearSection key={group.year} year={group.year} entries={group.entries} onOpen={onOpen} />
          ))}
        </AnimatePresence>
        {groups.length === 0 && <p className="py-10 text-[16px] text-[#f5f1e8]/60">Nothing on record for this filter yet.</p>}
      </div>
    </div>
  );
}
