"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { CircleDot, Dumbbell, Flag, Medal, Target, Trophy } from "lucide-react";

interface IconSpec {
  Icon: typeof Trophy;
  top: string;
  left: string;
  size: number;
  // How far the icon drifts per pixel scrolled — mixed signs/magnitudes give
  // each icon a different parallax speed so the layer reads as depth, not
  // one flat sheet moving together.
  depth: number;
  color: string;
  floatDuration: number;
  floatDelay: number;
}

const ICONS: IconSpec[] = [
  { Icon: Trophy, top: "10%", left: "5%", size: 64, depth: 0.1, color: "text-blue-400/10", floatDuration: 9, floatDelay: 0 },
  { Icon: Medal, top: "20%", left: "88%", size: 52, depth: -0.16, color: "text-teal-400/10", floatDuration: 11, floatDelay: 1 },
  { Icon: Dumbbell, top: "46%", left: "9%", size: 58, depth: 0.2, color: "text-purple-400/10", floatDuration: 8, floatDelay: 0.5 },
  { Icon: CircleDot, top: "58%", left: "84%", size: 70, depth: -0.12, color: "text-amber-400/10", floatDuration: 10, floatDelay: 2 },
  { Icon: Target, top: "76%", left: "6%", size: 50, depth: 0.15, color: "text-blue-400/10", floatDuration: 12, floatDelay: 1.5 },
  { Icon: Flag, top: "88%", left: "72%", size: 56, depth: -0.18, color: "text-teal-400/10", floatDuration: 9.5, floatDelay: 0.8 },
];

function FloatingIcon({ spec, scrollY }: { spec: IconSpec; scrollY: MotionValue<number> }) {
  const y = useTransform(scrollY, (value) => value * spec.depth);

  return (
    <motion.div className="absolute" style={{ top: spec.top, left: spec.left, y }}>
      <div
        className="sports-icon-float"
        style={{ animationDuration: `${spec.floatDuration}s`, animationDelay: `${spec.floatDelay}s` }}
      >
        <spec.Icon size={spec.size} strokeWidth={1} className={spec.color} />
      </div>
    </motion.div>
  );
}

// Ambient sports-icon layer behind every page — sits fixed to the viewport so
// each icon drifts at its own parallax speed as the visitor scrolls, plus a
// slow idle bob (see .sports-icon-float in globals.css) so it's never fully
// static even at rest. No negative z-index: rendered first in the (site)
// layout so normal DOM stacking order keeps real content on top, same trick
// Hero.tsx already uses for its gradient orbs.
export function ScrollSportsBackground() {
  const { scrollY } = useScroll();

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {ICONS.map((spec, index) => (
        <FloatingIcon key={index} spec={spec} scrollY={scrollY} />
      ))}
    </div>
  );
}
