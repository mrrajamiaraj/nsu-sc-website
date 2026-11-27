"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);
const spring = { type: "spring" as const, stiffness: 400, damping: 22 };

// The same glass treatment as the Home icon (NavIconLink), for a text label:
// a frosted teal pill that's always on for the current page and fades in on hover,
// a small lift, and the shared teal underline that slides between nav items.
export function GlassPill({ active, children }: { active: boolean; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <>
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full bg-blue-400/15 ring-1 ring-inset ring-white/10 backdrop-blur-md"
        variants={{
          rest: { opacity: active ? 0.8 : 0, scale: active ? 1 : 0.85 },
          hover: { opacity: 1, scale: 1 },
          tap: { opacity: 1, scale: 0.95 },
        }}
        transition={spring}
      />
      <motion.span
        className="relative"
        variants={
          reduceMotion
            ? undefined
            : {
                rest: { y: 0, scale: 1, transition: spring },
                hover: { y: -1, scale: 1.04, transition: spring },
                tap: { scale: 0.95, transition: { duration: 0.1 } },
              }
        }
      >
        {children}
      </motion.span>
      {active && (
        <motion.span
          layoutId="nav-active-underline"
          className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-gradient"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
    </>
  );
}

export const glassItem =
  "group relative inline-flex h-10 items-center rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60";

export function NavTextLink({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  return (
    <MotionLink
      href={href}
      aria-current={active ? "page" : undefined}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      whileTap="tap"
      className={cn(glassItem, active ? "text-white" : "text-slate-300 hover:text-white")}
    >
      <GlassPill active={active}>{label}</GlassPill>
    </MotionLink>
  );
}
