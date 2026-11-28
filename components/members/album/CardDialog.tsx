"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, X } from "lucide-react";
import { CardFront } from "@/components/members/album/Card";
import { CardBack } from "@/components/members/album/CardBack";
import { playFlip } from "@/components/contact/interaction/sound";
import type { PanelPerson } from "@/lib/members-sheet";
import { cn } from "@/lib/utils";

const FOCUSABLE = "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";
const FACE: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
const control =
  "flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-full border border-white/20 bg-[#0b2524]/90 px-4 text-[14px] font-semibold text-[#f5f1e8] transition hover:-translate-y-0.5 hover:border-[#3fcfca] hover:text-[#3fcfca] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-35";

/**
 * The opened card. It lifts out of the album (shared layout with its slot), comes to the
 * centre, and flips to its back. ← / → (or a swipe) move through the same page, F flips,
 * Esc (or a swipe down) puts it back. With reduced motion it's a plain dialog of the back.
 */
export function CardDialog({
  person,
  scope,
  fromAlbum,
  onGo,
  onClose,
}: {
  person: PanelPerson;
  scope: PanelPerson[];
  /** Lifted from its slot just now (lift, then flip); otherwise it arrives already flipped. */
  fromAlbum: boolean;
  onGo: (next: PanelPerson, dir: 1 | -1) => void;
  onClose: () => void;
}) {
  const reduce = Boolean(useReducedMotion());
  const box = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(!fromAlbum || reduce);
  const [dir, setDir] = useState<1 | -1>(1);
  const [moved, setMoved] = useState(false); // after ←/→ the card slides instead of lifting
  // Portals exist only in the browser; render after mount so a ?member= link hydrates cleanly.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const index = scope.findIndex((p) => p.slug === person.slug);
  const prev = index > 0 ? scope[index - 1] : null;
  const next = index >= 0 && index < scope.length - 1 ? scope[index + 1] : null;

  // Lift first, then flip.
  useEffect(() => {
    if (flipped) return;
    const t = window.setTimeout(() => {
      setFlipped(true);
      playFlip();
    }, 380);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on open
  }, []);

  const flip = () => {
    if (reduce) return;
    setFlipped((f) => !f);
    playFlip();
  };
  const go = (to: PanelPerson | null, d: 1 | -1) => {
    if (!to) return;
    setDir(d);
    setMoved(true);
    setFlipped(true);
    onGo(to, d);
  };

  // Scroll lock and first focus, once.
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    requestAnimationFrame(() => box.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true }));
    return () => {
      html.style.overflow = before;
    };
  }, []);

  // Keys and the focus trap (re-bound each render so ←/→ see the current card).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") go(next, 1);
      else if (e.key === "ArrowLeft") go(prev, -1);
      else if ((e.key === "f" || e.key === "F") && !e.metaKey && !e.ctrlKey) flip();
      else if (e.key === "Tab" && box.current) {
        const items = Array.from(box.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null && !el.closest("[aria-hidden='true']"));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 && Math.abs(info.offset.x) < 80) onClose();
    else if (info.offset.x < -80) go(next, 1);
    else if (info.offset.x > 80) go(prev, -1);
  };

  if (!mounted) return null;
  const width = "min(420px, 88vw, calc((100dvh - 150px) * 0.75))";

  return createPortal(
    <div ref={box} role="dialog" aria-modal="true" aria-labelledby="album-card-title" className="contact-page fixed inset-0 z-[160] flex flex-col items-center justify-center gap-5 p-4">
      <motion.div aria-hidden className="absolute inset-0 bg-black/60 backdrop-blur-[6px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={onClose} />
      <button type="button" data-autofocus onClick={onClose} aria-label="Close the card" className={cn(control, "absolute right-4 top-4 z-10 w-11 px-0")}>
        <X aria-hidden className="h-5 w-5" />
      </button>

      <div className="relative z-[1]" style={{ width, aspectRatio: "3 / 4" }}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={person.slug}
            layoutId={!moved && !reduce ? `album-card-${person.slug}` : undefined}
            custom={dir}
            initial={moved ? { x: `${dir * 110}%`, opacity: 0, rotate: dir * 6 } : reduce ? { opacity: 0 } : false}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={moved ? { x: `${-dir * 110}%`, opacity: 0, rotate: -dir * 6 } : { opacity: reduce ? 0 : 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            drag={!reduce}
            dragSnapToOrigin
            dragElastic={0.5}
            dragDirectionLock
            onDragEnd={onDragEnd}
            className="absolute inset-0 [perspective:1400px]"
          >
            {reduce ? (
              <CardBack person={person} play />
            ) : (
              <motion.div className="absolute inset-0 [transform-style:preserve-3d]" initial={false} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 140, damping: 17 }}>
                <div className="absolute inset-0" style={FACE} aria-hidden={flipped} onClick={flip}>
                  <CardFront person={person} sizes="(min-width: 640px) 560px, 120vw" priority big />
                </div>
                <div className="absolute inset-0" style={{ ...FACE, transform: "rotateY(180deg)" }} aria-hidden={!flipped}>
                  <CardBack person={person} play={flipped} />
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-[1] flex items-center gap-2">
        <button type="button" onClick={() => go(prev, -1)} disabled={!prev} aria-label={prev ? `Previous card: ${prev.name}` : "No previous card"} className={cn(control, "w-11 px-0")}>
          <ArrowLeft aria-hidden className="h-5 w-5" />
        </button>
        {!reduce && (
          <button type="button" onClick={flip} className={control} aria-label={flipped ? "Flip back to the front" : "Flip the card"}>
            <RotateCcw aria-hidden className="h-4 w-4" />
            {flipped ? "Flip back" : "Flip"}
          </button>
        )}
        <button type="button" onClick={() => go(next, 1)} disabled={!next} aria-label={next ? `Next card: ${next.name}` : "No next card"} className={cn(control, "w-11 px-0")}>
          <ArrowRight aria-hidden className="h-5 w-5" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
