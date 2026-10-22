"use client";

import Link from "next/link";
import { motion, useReducedMotion, type TargetAndTransition } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

// Each icon gets its own little hover gesture, on top of a shared lift.
const GESTURES: Record<string, TargetAndTransition> = {
  "/": { y: [0, -5, -2], transition: { duration: 0.4 } },
  "/events": { rotate: [0, -14, 10, 0], transition: { duration: 0.5 } },
  "/about": { scale: [1, 1.3, 1.15], transition: { duration: 0.35 } },
  "/teams": { rotate: [0, -10, 10, -4, 0], transition: { duration: 0.5 } },
  "/achievements": { rotate: [0, -16, 14, -8, 0], y: -2, transition: { duration: 0.55 } },
  "/alumni": { y: [0, -6, -3], rotate: [0, -14, -8], transition: { duration: 0.45 } },
  "/members": { scale: [1, 1.25, 1.15], transition: { duration: 0.35 } },
  "/blog": { rotate: [0, 8, -4, 0], x: [0, 2, 0], transition: { duration: 0.45 } },
  "/contact": { x: [0, -2, 2, -2, 0], y: -2, transition: { duration: 0.4 } },
  "/admin/login": { x: [0, 3, 1], transition: { duration: 0.35 } },
};

const spring = { type: "spring" as const, stiffness: 400, damping: 22 };

export function NavIconLink({
  href,
  label,
  icon: Icon,
  active = false,
  className,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const gesture = GESTURES[href] ?? {};

  return (
    <MotionLink
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      whileTap="tap"
      className={cn(
        "group relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60",
        active ? "text-blue-300" : "text-slate-300 hover:text-white",
        className,
      )}
    >
      {/* Soft glow behind the icon: always on for the current page, fades in on hover. */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full bg-blue-400/15"
        variants={{
          rest: { opacity: active ? 0.7 : 0, scale: active ? 1 : 0.6 },
          hover: { opacity: 1, scale: 1 },
          tap: { opacity: 1, scale: 0.92 },
        }}
        transition={spring}
      />

      <motion.span
        className="relative flex"
        variants={
          reduceMotion
            ? undefined
            : {
                rest: { scale: 1, y: 0, x: 0, rotate: 0, transition: spring },
                hover: { scale: 1.12, y: -1, ...gesture },
                tap: { scale: 0.85, transition: { duration: 0.1 } },
              }
        }
      >
        <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={active ? 2.25 : 1.75} />
      </motion.span>

      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg border border-white/10 bg-night-900/95 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-panel transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
      >
        {label}
      </span>

      {active && (
        <motion.span
          layoutId="nav-active-underline"
          className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-brand-gradient"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
    </MotionLink>
  );
}
