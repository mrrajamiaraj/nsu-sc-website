"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, useScroll, useSpring, useMotionValue } from "framer-motion";
import { useRichPointer } from "@/components/contact/interaction/hooks";
import { cn } from "@/lib/utils";

type CursorMode = "default" | "link" | "text" | "view" | "drag" | "native";

const INTERACTIVE = "a, button, select, summary, label, [role='button'], [role='tab'], [role='option'], [role='switch']";
const TEXT_FIELD = "textarea, input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='button']):not([type='submit'])";

function modeFor(target: EventTarget | null): CursorMode {
  if (!(target instanceof Element)) return "default";
  const tagged = target.closest<HTMLElement>("[data-cursor]");
  if (tagged?.dataset.cursor === "native") return "native";
  if (tagged?.dataset.cursor === "view" || tagged?.dataset.cursor === "drag") return tagged.dataset.cursor;
  if (target.closest(TEXT_FIELD)) return "text";
  if (target.closest(INTERACTIVE)) return "link";
  return "default";
}

// Desktop cursor: a 10px teal dot plus a 36px ring that follows with lag (lerp 0.18). The
// ring grows over links and buttons, reads VIEW over photos and DRAG over the map, and
// turns into a thin I-beam over text fields. Off on touch screens and with reduced motion.
export function CustomCursor() {
  const on = useRichPointer();
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!on) return;
    document.documentElement.classList.add("custom-cursor");
    const target = { x: -100, y: -100 };
    const lag = { x: -100, y: -100 };
    let raf = 0;
    const loop = () => {
      lag.x += (target.x - lag.x) * 0.18;
      lag.y += (target.y - lag.y) * 0.18;
      if (ring.current) ring.current.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const next = modeFor(e.target);
      setVisible(next !== "native");
      setMode(next);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [on]);

  if (!on || typeof document === "undefined") return null;
  const label = mode === "view" ? "View" : mode === "drag" ? "Drag" : null;
  const ringScale = mode === "link" || label ? 1 : mode === "text" ? 0 : 36 / 56;

  return createPortal(
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 z-[200] transition-opacity duration-150", visible ? "opacity-100" : "opacity-0")}>
      <div ref={ring} className="absolute left-0 top-0">
        <div
          className={cn(
            "-ml-7 -mt-7 flex h-14 w-14 items-center justify-center rounded-full border border-[#f5f1e8]/30 transition-[transform,background-color] duration-200 ease-out",
            label && "bg-[#0b2524]/70",
          )}
          style={{ transform: `scale(${ringScale})` }}
        >
          {label && <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]">{label}</span>}
        </div>
      </div>
      <div ref={dot} className="absolute left-0 top-0">
        {mode === "text" ? (
          <div className="-ml-px -mt-[11px] h-[22px] w-[2px] rounded-full bg-[#3fcfca]" />
        ) : (
          <div
            className={cn("-ml-[5px] -mt-[5px] h-[10px] w-[10px] rounded-full bg-[#3fcfca] transition-transform duration-150", (mode === "link" || label) && "scale-0")}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}

// 2px teal line across the top of the viewport that fills as the page scrolls.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <motion.div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[150] h-[2px] origin-left bg-[#3fcfca]" style={{ scaleX }} />,
    document.body,
  );
}

// Primary buttons lean toward the cursor within 80px (max 8px), then spring back.
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const on = useRichPointer();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 16 });
  const sy = useSpring(y, { stiffness: 260, damping: 16 });

  useEffect(() => {
    if (!on) return;
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const inside =
        e.clientX > box.left - 80 && e.clientX < box.right + 80 && e.clientY > box.top - 80 && e.clientY < box.bottom + 80;
      if (!inside) {
        x.set(0);
        y.set(0);
        return;
      }
      const clamp = (v: number) => Math.max(-8, Math.min(8, v));
      x.set(clamp((e.clientX - (box.left + box.width / 2)) * 0.15));
      y.set(clamp((e.clientY - (box.top + box.height / 2)) * 0.25));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [on, x, y]);

  return (
    <motion.span ref={ref} className={cn("inline-flex", className)} style={on ? { x: sx, y: sy } : undefined}>
      {children}
    </motion.span>
  );
}

// Each section fades and rises 24px when a fifth of it is in view; marked children stagger 60ms.
export function Reveal({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" }) {
  const Tag = as === "section" ? motion.section : motion.div;
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        shown: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.7, 0.3, 1], staggerChildren: 0.06 } },
      }}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 16 }, shown: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}
    >
      {children}
    </motion.div>
  );
}
