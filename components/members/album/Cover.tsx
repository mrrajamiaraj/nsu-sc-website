"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { CardFront, DISPLAY, EmptySlot } from "@/components/members/album/Card";
import type { PanelPerson } from "@/lib/members-sheet";
import { cn } from "@/lib/utils";

const FAN = [-8, -3, 2, 6, 10];

// Five leadership cards fanned out from behind the cover's edge. Hover spreads them; a click
// goes to the Leadership page.
function Fan({ people, onClick, className }: { people: PanelPerson[]; onClick: () => void; className?: string }) {
  const reduce = Boolean(useReducedMotion());
  const [open, setOpen] = useState(false);
  const cards = people.slice(0, 5);
  if (cards.length === 0) return null;
  const mid = (cards.length - 1) / 2;
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-label="Go to the Leadership page"
      className={cn("relative block", className)}
    >
      {cards.map((p, i) => {
        const rot = FAN[i] ?? 0;
        const spread = open ? 1.5 : 1;
        return (
          <motion.span
            key={p.id}
            aria-hidden
            className="absolute bottom-0 left-1/2 block aspect-[3/4] w-[var(--fan-w)] origin-[50%_120%]"
            style={{ marginLeft: "calc(var(--fan-w) / -2)", zIndex: i }}
            initial={reduce ? false : { opacity: 0, x: -90, rotate: 0, y: 30 }}
            animate={{ opacity: 1, x: (i - mid) * 38 * spread, rotate: rot * spread, y: open ? -6 : 0 }}
            transition={{ delay: reduce ? 0 : 0.45 + i * 0.07, type: "spring", stiffness: 260, damping: 22 }}
          >
            <CardFront person={p} sizes="200px" mini />
          </motion.span>
        );
      })}
    </button>
  );
}

/** The album cover: crest, title with a foil sweep, the card fan, and the search strip. */
export function Cover({
  year,
  leadership,
  query,
  onQuery,
  onEnter,
  noMatch,
  onFan,
}: {
  year: string | null;
  leadership: PanelPerson[];
  query: string;
  onQuery: (q: string) => void;
  onEnter: () => void;
  noMatch: boolean;
  onFan: () => void;
}) {
  const reduce = Boolean(useReducedMotion());
  return (
    <div className="relative pb-6 pt-10 md:pt-14">
      {/* Desktop: the fan sits behind the cover's right edge. */}
      <Fan people={leadership} onClick={onFan} className="absolute -right-2 bottom-24 hidden h-[300px] w-[330px] [--fan-w:180px] lg:block xl:-right-6" />
      <motion.section
        aria-labelledby="album-title"
        initial={reduce ? false : { y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 170, damping: 16 }}
        className="album-linen relative z-[1] overflow-hidden rounded-[20px] border border-[#f5f1e8]/10 shadow-[0_40px_70px_-30px_rgba(0,0,0,0.85)] lg:mr-[300px]"
      >
        {/* Stitched spine. */}
        <span aria-hidden className="absolute bottom-5 left-5 top-5 border-l-2 border-dashed border-[#f5f1e8]/25" />
        <span aria-hidden className="absolute bottom-0 left-0 top-0 w-10 bg-gradient-to-r from-black/25 to-transparent" />

        <div className="relative px-8 pb-8 pt-9 sm:pl-14 md:px-14 md:pb-10 md:pt-12">
          <div className="flex items-center gap-3">
            <span aria-hidden className="album-crest h-9 w-9 text-[#f5f1e8]" />
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#f5f1e8]/70">Official panel album{year && ` · ${year}`}</p>
          </div>
          <h1 id="album-title" className={cn(DISPLAY, "album-foil-text mt-5 !text-[64px] !font-extrabold uppercase !leading-[0.85] sm:!text-[96px] md:!text-[140px]")}>
            The panel
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[#f5f1e8]/70 md:text-[18px]">The advisor, executives and members running NSU SC this year.</p>

          {/* Phones and tablets: the fan sits under the title. */}
          <Fan people={leadership} onClick={onFan} className="mx-auto mt-8 h-[190px] w-full max-w-[320px] [--fan-w:112px] lg:hidden" />
        </div>

        {/* Search, as the album's label strip along the bottom edge. */}
        <div className="relative border-t border-dashed border-[#f5f1e8]/20 bg-[#f4f1ea] px-6 py-3 sm:pl-14 md:px-14">
          <label className="flex items-center gap-3">
            <Search aria-hidden className="h-5 w-5 shrink-0 text-[#0b1a18]/60" />
            <span className="sr-only">Find a member by name, role, sport or department</span>
            <input
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onEnter()}
              placeholder="Find a member…"
              enterKeyHint="search"
              className="min-h-[44px] w-full border-0 bg-transparent text-[17px] font-medium text-[#0b1a18] placeholder:text-[#0b1a18]/45 focus:outline-none"
            />
          </label>
        </div>
      </motion.section>

      {noMatch && (
        <div role="status" className="relative z-[1] mt-6 flex items-center gap-5 lg:mr-[300px]">
          <span className="relative block aspect-[3/4] w-[84px] shrink-0">
            <EmptySlot label="" className="inset-0" />
          </span>
          <p className="text-[16px] text-[#f5f1e8]/75">No member found. Check the spelling or try a sport.</p>
        </div>
      )}
    </div>
  );
}
