"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Enter-only fade/rise on route change. Deliberately no exit animation via
// AnimatePresence: Next.js's App Router already swaps `children` to the new
// route's resolved server content by the time this re-renders, so there is
// no stable "old" subtree left to animate out — trying to hold one produces
// a flash of stale/wrong content mid-transition instead of a clean exit.
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
