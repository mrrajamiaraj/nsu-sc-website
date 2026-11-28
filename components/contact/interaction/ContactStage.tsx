"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { CustomCursor, ScrollProgress } from "@/components/contact/interaction/Pointer";
import { haptic } from "@/components/contact/interaction/hooks";
import { loadSoundPreference, onSoundChange, playClick, setSoundEnabled } from "@/components/contact/interaction/sound";

// ---- Background clicks: ripple, and three quick clicks drop a football.

const NOT_EMPTY = "a, button, input, textarea, select, label, img, svg, p, h1, h2, h3, h4, li, dt, dd, span, figure, iframe, [role], [data-cursor]";

type Ripple = { id: number; x: number; y: number };
type Ball = { id: number; x: number; y: number };

function Football() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <circle cx="12" cy="12" r="10.5" fill="#f5f1e8" stroke="#0b2524" strokeWidth="1.2" />
      <path d="m12 7.5 4.3 3.1-1.6 5h-5.4l-1.6-5z" fill="#0b2524" />
      <path d="M12 7.5V2M16.3 10.6l5-1.6M14.7 15.6l3 4M9.3 15.6l-3 4M7.7 10.6l-5-1.6" stroke="#0b2524" strokeWidth="1.2" />
    </svg>
  );
}

function SoundToggle() {
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setOn(loadSoundPreference());
    return onSoundChange(setOn);
  }, []);
  if (!mounted) return null;
  return createPortal(
    <button
      type="button"
      onClick={() => setSoundEnabled(!on)}
      aria-pressed={on}
      aria-label="Interface sounds"
      title={on ? "Sounds on" : "Sounds off"}
      className="fixed bottom-4 left-4 z-[120] flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#082120]/85 text-[#f5f1e8]/80 backdrop-blur-sm transition hover:-translate-y-0.5 hover:text-[#f5f1e8] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fcfca] focus-visible:ring-offset-[3px] focus-visible:ring-offset-[#0b2524]"
    >
      {on ? <Volume2 aria-hidden className="h-[18px] w-[18px]" /> : <VolumeX aria-hidden className="h-[18px] w-[18px]" />}
    </button>,
    document.body,
  );
}

// Wraps a whole page (About, Achievements, Teams): cursor, progress line, sounds and easter egg.
export function ContactStage({ children, progress = true }: { children: ReactNode; /** The 2px reading line along the top of the viewport. */ progress?: boolean }) {
  const reduce = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [mounted, setMounted] = useState(false);
  const clicks = useRef<number[]>([]);
  const nextId = useRef(0);
  useEffect(() => setMounted(true), []);

  const onClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const target = e.target as Element;
    if (target.closest(NOT_EMPTY) || window.getSelection()?.toString()) return;
    const id = nextId.current++;
    if (!reduce) setRipples((list) => [...list, { id, x: e.clientX, y: e.clientY }]);
    const now = performance.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 700), now];
    if (clicks.current.length >= 3 && !reduce) {
      clicks.current = [];
      setBalls((list) => [...list, { id, x: e.clientX, y: e.clientY }]);
    }
  };

  // A soft click for every button and link (when sounds are on), and a haptic tick on main buttons.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const target = e.target as Element;
    if (target.closest("a, button, [role='button'], [role='tab'], [role='option']")) playClick();
    if (target.closest("[data-haptic]")) haptic();
  };

  return (
    <div onClick={onClick} onPointerDown={onPointerDown} className="contact-page relative isolate">
      <div className="relative z-10">{children}</div>
      <CustomCursor />
      {progress && <ScrollProgress />}
      <SoundToggle />
      {mounted &&
        createPortal(
          <div aria-hidden className="pointer-events-none fixed inset-0 z-[140] overflow-hidden">
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  className="absolute h-32 w-32 rounded-full border-2 border-[#3fcfca]/20"
                  style={{ left: r.x - 64, top: r.y - 64 }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 1, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  onAnimationComplete={() => setRipples((list) => list.filter((item) => item.id !== r.id))}
                />
              ))}
              {balls.map((b) => {
                const floor = window.innerHeight - b.y - 36;
                return (
                  <motion.span
                    key={`ball-${b.id}`}
                    className="absolute"
                    style={{ left: b.x - 14, top: b.y - 14 }}
                    initial={{ x: 0, y: -40, rotate: 0 }}
                    animate={{
                      y: [-40, floor, floor - 90, floor, floor - 30, floor, floor],
                      x: [0, 40, 90, 140, 175, 210, window.innerWidth],
                      rotate: [0, 120, 260, 380, 460, 540, 1440],
                    }}
                    transition={{ duration: 2.2, times: [0, 0.22, 0.38, 0.52, 0.62, 0.7, 1], ease: "easeIn" }}
                    onAnimationComplete={() => setBalls((list) => list.filter((item) => item.id !== b.id))}
                  >
                    <Football />
                  </motion.span>
                );
              })}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </div>
  );
}

