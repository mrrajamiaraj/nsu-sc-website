"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// The sport's field or court in thin off-white strokes, drawn in when it appears. Stands in
// for a squad photo that isn't on file yet (never a gradient tile). 16:9, viewBox 320x180.

type Shape =
  | { el: "rect"; x: number; y: number; w: number; h: number; rx?: number }
  | { el: "line"; x1: number; y1: number; x2: number; y2: number; bold?: boolean }
  | { el: "circle"; cx: number; cy: number; r: number }
  | { el: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { el: "path"; d: string };

const COURTS: Record<string, Shape[]> = {
  football: [
    { el: "rect", x: 20, y: 14, w: 280, h: 152 },
    { el: "line", x1: 160, y1: 14, x2: 160, y2: 166 },
    { el: "circle", cx: 160, cy: 90, r: 24 },
    { el: "rect", x: 20, y: 50, w: 44, h: 80 },
    { el: "rect", x: 20, y: 72, w: 16, h: 36 },
    { el: "path", d: "M64 76 A18 18 0 0 1 64 104" },
    { el: "rect", x: 256, y: 50, w: 44, h: 80 },
    { el: "rect", x: 284, y: 72, w: 16, h: 36 },
    { el: "path", d: "M256 76 A18 18 0 0 0 256 104" },
  ],
  cricket: [
    { el: "ellipse", cx: 160, cy: 90, rx: 144, ry: 78 },
    { el: "ellipse", cx: 160, cy: 90, rx: 72, ry: 46 },
    { el: "rect", x: 126, y: 82, w: 68, h: 16 },
    { el: "line", x1: 136, y1: 76, x2: 136, y2: 104 },
    { el: "line", x1: 184, y1: 76, x2: 184, y2: 104 },
  ],
  volleyball: [
    { el: "rect", x: 40, y: 30, w: 240, h: 120 },
    { el: "line", x1: 160, y1: 20, x2: 160, y2: 160, bold: true },
    { el: "line", x1: 120, y1: 30, x2: 120, y2: 150 },
    { el: "line", x1: 200, y1: 30, x2: 200, y2: 150 },
  ],
  "table-tennis": [
    { el: "rect", x: 70, y: 40, w: 180, h: 100, rx: 2 },
    { el: "line", x1: 160, y1: 32, x2: 160, y2: 148, bold: true },
    { el: "line", x1: 70, y1: 90, x2: 250, y2: 90 },
  ],
  badminton: [
    { el: "rect", x: 30, y: 30, w: 260, h: 120 },
    { el: "line", x1: 30, y1: 39, x2: 290, y2: 39 },
    { el: "line", x1: 30, y1: 141, x2: 290, y2: 141 },
    { el: "line", x1: 160, y1: 22, x2: 160, y2: 158, bold: true },
    { el: "line", x1: 124, y1: 30, x2: 124, y2: 150 },
    { el: "line", x1: 196, y1: 30, x2: 196, y2: 150 },
    { el: "line", x1: 45, y1: 30, x2: 45, y2: 150 },
    { el: "line", x1: 275, y1: 30, x2: 275, y2: 150 },
    { el: "line", x1: 30, y1: 90, x2: 124, y2: 90 },
    { el: "line", x1: 196, y1: 90, x2: 290, y2: 90 },
  ],
};

export function CourtLines({
  sport,
  children,
  className,
  strength = 0.15,
}: {
  sport: string;
  children?: ReactNode;
  className?: string;
  /** Stroke opacity: 0.15 on a stage, about 0.06 behind a hero. */
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const shapes = COURTS[sport] ?? COURTS.football;
  const draw = (i: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { pathLength: { duration: 0.9, delay: 0.08 * i, ease: "easeInOut" as const }, opacity: { duration: 0.2, delay: 0.08 * i } },
        };

  return (
    <div className={className ?? "absolute inset-0 bg-[#0f302e]"}>
      <svg key={sport} viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" aria-hidden className="absolute inset-0 h-full w-full p-[4%]">
        <g fill="none" stroke="#f5f1e8" strokeOpacity={strength} strokeWidth={1.2} vectorEffect="non-scaling-stroke">
          {shapes.map((s, i) => {
            const common = { vectorEffect: "non-scaling-stroke" as const, ...draw(i) };
            if (s.el === "rect") return <motion.rect key={i} {...common} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} />;
            if (s.el === "line") return <motion.line key={i} {...common} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} strokeWidth={s.bold ? 2.4 : 1.2} />;
            if (s.el === "circle") return <motion.circle key={i} {...common} cx={s.cx} cy={s.cy} r={s.r} />;
            if (s.el === "ellipse") return <motion.ellipse key={i} {...common} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />;
            return <motion.path key={i} {...common} d={s.d} />;
          })}
        </g>
      </svg>
      {children && <div className="relative flex h-full w-full flex-col items-center justify-center p-6 text-center">{children}</div>}
    </div>
  );
}
