"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ANTON, EASE } from "@/components/achievements/report/shared";
import type { Fact } from "@/lib/trophy";
import { cn } from "@/lib/utils";

function Cell({ fact, index }: { fact: Fact; index: number }) {
  const reduce = useReducedMotion();
  const [tip, setTip] = useState(false);
  const tipId = useId();
  const show = () => setTip(true);
  const hide = () => setTip(false);

  const body = (
    <>
      <span className="block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/50">{fact.label}</span>
      {/* Split-flap: the value drops in from its top hinge when the sheet scrolls into view. */}
      <span className="mt-1.5 block [perspective:400px]">
        <motion.span
          className={cn(ANTON, "block origin-top text-[24px] leading-[1.05] text-[#f5f1e8]")}
          initial={reduce ? false : { rotateX: -92, opacity: 0 }}
          whileInView={{ rotateX: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: index * 0.08, ease: EASE }}
        >
          {fact.value}
        </motion.span>
      </span>
      {fact.href && (
        <ArrowUpRight aria-hidden className="absolute right-3 top-3 h-4 w-4 text-[#3fcfca] opacity-0 transition duration-150 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100" />
      )}
      <span
        id={tipId}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute inset-x-2 bottom-[calc(100%+8px)] z-20 rounded-md border border-white/10 bg-[#f5f1e8] px-3 py-2 text-[13px] font-medium normal-case leading-snug tracking-normal text-[#0b2524] shadow-lg transition duration-150",
          tip ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        )}
      >
        {fact.note}
      </span>
    </>
  );

  const cell = "group relative block h-full min-h-[92px] bg-[#0b2524] px-4 py-4 text-left transition-colors duration-150 hover:bg-[#123b38] focus-visible:bg-[#123b38]";
  const events = { onPointerEnter: show, onPointerLeave: hide, onFocus: show, onBlur: hide, "aria-describedby": tipId };
  return fact.href ? (
    <Link href={fact.href} className={cell} {...events}>
      {body}
    </Link>
  ) : (
    // Tooltip cells without a link still take focus, so keyboard users get the context too.
    <div tabIndex={0} className={cell} {...events}>
      {body}
    </div>
  );
}

// Scoreboard-style fact grid: hairline rules, label over value, 2 columns on phones, 3 above.
export function FactSheet({ facts }: { facts: Fact[] }) {
  // Blank cells close off a short last row so the hairlines stay a clean grid.
  const fillTwo = (2 - (facts.length % 2)) % 2;
  const fillThree = (3 - (facts.length % 3)) % 3;
  return (
    <dl className="grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
      {facts.map((fact, i) => (
        <div key={fact.label} className="contents">
          <dt className="sr-only">{fact.label}</dt>
          <dd className="relative flex flex-col [&>*]:flex-1">
            <Cell fact={fact} index={i} />
          </dd>
        </div>
      ))}
      {Array.from({ length: Math.max(fillTwo, fillThree) }, (_, i) => (
        <span key={i} aria-hidden className={cn("bg-[#0b2524]", i < fillTwo ? "block" : "hidden", i < fillThree ? "sm:block" : "sm:hidden")} />
      ))}
    </dl>
  );
}
