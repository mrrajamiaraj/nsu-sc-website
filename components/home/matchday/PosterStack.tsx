"use client";

import Image from "next/image";
import { memo, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, type PanInfo, type TargetAndTransition, type Transition } from "framer-motion";
import type { BoardEvent, BoardStatus } from "@/lib/matchday";
import { cn } from "@/lib/utils";

// Event posters stacked like prints on a table: the front one straight with tape on top,
// two behind it peeking out at −4° and +3°. Changing event slides the front print out to
// the left and tucks it under the stack while the next one springs up to the front.

type Pose = { x: string; y: number; rotate: number; scale: number; zIndex: number; opacity: number };

const POSES: Pose[] = [
  { x: "0%", y: 0, rotate: 0, scale: 1, zIndex: 30, opacity: 1 },
  { x: "-5%", y: 14, rotate: -4, scale: 0.96, zIndex: 20, opacity: 1 },
  { x: "5%", y: 8, rotate: 3, scale: 0.93, zIndex: 10, opacity: 1 },
];
const HIDDEN: Pose = { ...POSES[2], zIndex: 0, opacity: 0 };
const OUT = "-78%";
const SPRING: Transition = { type: "spring", stiffness: 240, damping: 22, mass: 0.9 };
const SHUFFLE: Transition = { duration: 0.62, times: [0, 0.45, 1], ease: "easeInOut" };

const pose = (depth: number) => POSES[depth] ?? HIDDEN;

const STAMP: Record<BoardStatus, { label: string; className: string }> = {
  finished: { label: "Finished", className: "border-[#f5f1e8]/70 text-[#f5f1e8]/70" },
  live: { label: "Live", className: "border-[#3fcfca] text-[#3fcfca] motion-safe:animate-pulse" },
  upcoming: { label: "Upcoming", className: "border-[#f5f1e8]/80 text-transparent [-webkit-text-stroke:1px_#f5f1e8]" },
};

function Print({
  event,
  front,
  swipe,
  onSwipe,
}: {
  event: BoardEvent;
  front: boolean;
  swipe: boolean;
  onSwipe: (direction: 1 | -1) => void;
}) {
  // Hover tilt toward the cursor (max 6°), eased with a spring.
  const tiltX = useSpring(0, { stiffness: 180, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 180, damping: 18 });
  // Phones: drag sideways, the print turns with the finger.
  const dragX = useMotionValue(0);
  const dragTurn = useTransform(dragX, [-220, 220], [-12, 12]);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!front || swipe || e.pointerType !== "mouse") return;
    const box = e.currentTarget.getBoundingClientRect();
    tiltY.set(((e.clientX - box.left) / box.width - 0.5) * 12);
    tiltX.set(-((e.clientY - box.top) / box.height - 0.5) * 12);
  };
  const onLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -70 || info.velocity.x < -500) onSwipe(1);
    else if (info.offset.x > 70 || info.velocity.x > 500) onSwipe(-1);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      drag={front && swipe ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.65}
      onDragEnd={onDragEnd}
      style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 900, x: dragX, rotate: dragTurn }}
      className={cn("relative h-full w-full touch-pan-y bg-[#f5f1e8] p-2 shadow-[0_22px_36px_-16px_rgba(0,0,0,0.75),0_2px_6px_rgba(0,0,0,0.35)]", front && swipe && "cursor-grab active:cursor-grabbing")}
    >
      <div className="relative h-full w-full overflow-hidden bg-[#0b2524]">
        {event.poster ? (
          <Image src={event.poster} alt="" fill draggable={false} sizes="(min-width: 1024px) 420px, 70vw" className="pointer-events-none select-none object-contain" />
        ) : (
          <span className="flex h-full items-center justify-center p-6 text-center font-display text-4xl font-extrabold uppercase leading-[0.95] text-[#f5f1e8]">
            {event.name}
          </span>
        )}
      </div>
      {/* Masking tape holding the front print down. */}
      <span
        aria-hidden
        className={cn(
          "absolute -top-3 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-3 bg-[#e9dcc0]/70 shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-opacity duration-300",
          front ? "opacity-100" : "opacity-0",
        )}
      />
    </motion.div>
  );
}

export const PosterStack = memo(function PosterStack({
  events,
  active,
  swipe,
  onSelect,
}: {
  events: BoardEvent[];
  active: number;
  swipe: boolean;
  onSelect: (index: number) => void;
}) {
  const n = events.length;
  // Remember which print was in front before this change, to animate it out.
  const [moves, setMoves] = useState({ active, previous: active });
  if (moves.active !== active) setMoves({ active, previous: moves.active });
  const previous = moves.previous;
  const backward = n > 2 && active === (previous - 1 + n) % n;

  const step = (direction: 1 | -1) => onSelect((active + direction + n) % n);
  const current = events[active];
  const stamp = STAMP[current.status];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[17rem] sm:max-w-[22rem] lg:max-w-[26rem]">
      {events.map((event, i) => {
        const depth = (i - active + n) % n;
        const target = pose(depth);
        let animate: TargetAndTransition = { ...target };
        let transition: Transition = SPRING;

        if (previous !== active && i === previous && !backward) {
          // The old front print slides out to the left and drops under the stack.
          animate = {
            x: ["0%", OUT, target.x],
            y: [0, -12, target.y],
            rotate: [0, -14, target.rotate],
            scale: [1, 1, target.scale],
            zIndex: [40, 40, target.zIndex],
            opacity: target.opacity,
          };
          transition = SHUFFLE;
        } else if (previous !== active && i === active && backward) {
          // Going back: the print from the bottom comes out on the left and lands on top.
          const from = pose((i - previous + n) % n);
          animate = {
            x: [from.x, OUT, "0%"],
            y: [from.y, -12, 0],
            rotate: [from.rotate, -14, 0],
            scale: [from.scale, 1, 1],
            zIndex: [from.zIndex, 40, 40],
            opacity: 1,
          };
          transition = SHUFFLE;
        }

        return (
          <motion.div
            key={event.id}
            initial={false}
            animate={animate}
            transition={transition}
            className="absolute inset-0 [transform-style:preserve-3d]"
            aria-hidden={depth !== 0}
          >
            <Print event={event} front={depth === 0} swipe={swipe} onSwipe={step} />
          </motion.div>
        );
      })}

      {/* Ink stamp on the front print's corner: drops in large, then settles with a small shake. */}
      <motion.span
        key={current.id}
        aria-hidden
        initial={{ scale: 1.4, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: [-8, -11, -5, -8] }}
        transition={{
          scale: { type: "spring", stiffness: 520, damping: 16, delay: 0.32 },
          opacity: { duration: 0.12, delay: 0.32 },
          rotate: { duration: 0.32, delay: 0.46 },
        }}
        className={cn(
          "pointer-events-none absolute -right-3 top-5 z-50 border-[3px] bg-[#0b2524]/85 px-3 pb-0.5 pt-1 font-display text-2xl font-extrabold uppercase leading-none tracking-[0.06em] sm:text-3xl",
          stamp.className,
        )}
      >
        {stamp.label}
      </motion.span>
    </div>
  );
});
