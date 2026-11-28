"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { isCutout } from "@/lib/blog-blocks";
import { cn } from "@/lib/utils";

// Print pieces shared by the homepage Gazette section and the Blog (the Gazette itself):
// warm-white paper (#f5f1e8), deep-teal ink (#0b2524) and one spot colour (#006663).

export const SERIF = "[font-family:var(--font-news),Georgia,serif]";
export const META = "font-mono text-[12px] uppercase tracking-[0.12em]";
export const INK = "text-[#0b2524]";
export const EASE = [0.25, 0.7, 0.25, 1] as const;

// ---- Print details

// A 1px ink rule that draws itself left to right when the sheet lands.
const ruleDraw: Variants = {
  hidden: { scaleX: 0 },
  shown: (delay: number = 0) => ({ scaleX: 1, transition: { duration: 0.8, delay: 0.35 + delay, ease: EASE } }),
};
export function Rule({ delay = 0, className }: { delay?: number; className?: string }) {
  return <motion.span aria-hidden custom={delay} variants={ruleDraw} className={cn("block h-px origin-left bg-[#0b2524]", className)} />;
}

// Masthead letters stamp in one by one with a 1px press jitter.
export const stamp: Variants = {
  hidden: { opacity: 0, y: -1 },
  shown: (i: number) => ({ opacity: 1, y: [1, -1, 0], transition: { delay: 0.45 + i * 0.025, duration: 0.22 } }),
};

// Headline lines are uncovered left to right by paper-coloured strips, one per line, 90 ms apart.
export function Wipe({ as: Tag = "span", className, children, delay = 0 }: { as?: ElementType; className?: string; children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const [lines, setLines] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (reduce || !el) return;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    if (lineHeight > 0) setLines(Math.max(1, Math.round(el.offsetHeight / lineHeight)));
  }, [reduce]);

  return (
    <Tag ref={ref} className={cn("relative", className)}>
      {children}
      {!done &&
        Array.from({ length: lines }, (_, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute inset-x-[-2px] origin-right bg-[#f5f1e8]"
            style={{ top: `${(i / lines) * 100}%`, height: `${100 / lines + 1}%` }}
            initial={{ scaleX: 1 }}
            animate={inView ? { scaleX: 0 } : undefined}
            transition={{ duration: 0.6, delay: delay + i * 0.09, ease: EASE }}
            onAnimationComplete={() => i === lines - 1 && setDone(true)}
          />
        ))}
    </Tag>
  );
}

// Wobbly hand-drawn underline that inks in under a headline on hover or keyboard focus.
export function Scribble() {
  return (
    <svg aria-hidden viewBox="0 0 300 12" preserveAspectRatio="none" className="pointer-events-none mt-1 block h-3 w-full max-w-[20rem] overflow-visible">
      <path d="M2 8.5c22-3.6 41-4.2 63-1.6 21 2.5 37 2.6 58-.6 25-3.8 47-3.4 71 .4 20 3.1 39 2.7 57-.9 17-3.2 31-3 47-1.3" pathLength={1} className="gazette-scribble" />
    </svg>
  );
}

// A photo printed in one ink: grey image, ink screened into the shadows, paper multiplied
// over the highlights, a fine halftone screen on top. It "develops" from a coarse dot screen
// as it scrolls into view, and turns to full colour while its story is hovered or focused.
export function PrintedPhoto({ src, sizes, className, alt = "" }: { src: string | null; sizes: string; className?: string; alt?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.35 });
  return (
    <div ref={ref} className={cn("relative isolate overflow-hidden bg-[#f5f1e8]", className)}>
      {src ? (
        <>
          <Image src={src} alt="" fill sizes={sizes} className={cn("object-cover brightness-[0.92] contrast-[1.35] grayscale", isCutout(src) && "object-top")} />
          <span aria-hidden className="absolute inset-0 bg-[#0b2524] mix-blend-screen" />
          <span aria-hidden className="absolute inset-0 bg-[#f5f1e8] mix-blend-multiply" />
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            className={cn("object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-has-[a:focus-visible]:opacity-100 motion-reduce:transition-none", isCutout(src) && "object-top")}
          />
          <span aria-hidden className="halftone-fine absolute inset-0" />
          <motion.span
            aria-hidden
            className="halftone-coarse absolute inset-0"
            initial={{ opacity: reduce ? 0 : 1 }}
            animate={inView ? { opacity: 0 } : undefined}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </>
      ) : (
        <span aria-hidden className="halftone-fine absolute inset-0 bg-[#0b2524]/10" />
      )}
    </div>
  );
}

export function Kicker({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#006663]">
      <span aria-hidden className="h-px w-6 bg-[#006663]" />
      {children}
    </p>
  );
}

