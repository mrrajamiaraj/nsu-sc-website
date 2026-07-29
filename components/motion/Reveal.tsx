"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}

// Mount-triggered fade/slide used across the site for section and grid-item
// entrances. Deliberately NOT viewport/whileInView-triggered: nested inside
// PageTransition's own animating wrapper, an IntersectionObserver-based
// trigger unreliably misfires on first paint (only a later scroll/resize
// "wakes" it), leaving above-the-fold content stuck at opacity 0 until the
// user scrolls. Animating on mount is fully reliable and, since each route
// only ever shows one page at a time, "mounted" already means "visible" for
// the vast majority of this content.
export function Reveal({ children, delay = 0, className, y = 24 }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
