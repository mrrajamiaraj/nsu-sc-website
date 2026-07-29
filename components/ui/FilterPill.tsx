"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  layoutId: string;
}

// Filter pill with a shared-layout gradient background that slides between
// buttons on selection instead of just swapping classes.
export function FilterPill({ active, onClick, children, layoutId }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "font-semibold text-night-950"
          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
      )}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-full bg-brand-gradient shadow-glow"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
