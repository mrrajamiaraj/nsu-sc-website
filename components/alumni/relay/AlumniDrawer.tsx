"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Trophy, X } from "lucide-react";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { useMedia } from "@/components/contact/interaction/hooks";
import { askForUpdate } from "@/components/alumni/relay/shared";
import { Cutout, initials } from "@/components/teams/announcement/Cutout";
import { EASE } from "@/components/teams/squad-select/shared";
import type { RelayPanel, RelayPerson } from "@/lib/alumni-relay";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Alumni profile: a 480px drawer from the right on desktop, a bottom sheet on phones.
// ←/→ (arrows, or a swipe on phones) move through the same panel; Esc closes.
export function AlumniDrawer({
  person,
  panel,
  flyFrom,
  onStep,
  onClose,
}: {
  person: RelayPerson | null;
  panel: RelayPanel | null;
  /** layoutId of the portrait it was opened from, for the fly-in. */
  flyFrom: string | undefined;
  onStep: (by: number) => void;
  onClose: () => void;
}) {
  const reduce = Boolean(useReducedMotion());
  const desktop = useMedia("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const swipe = useRef<number | null>(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!person || !mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
    };
    // Only when it opens, not on every step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(person), mounted]);

  if (!mounted) return null;
  const people = panel ? [...panel.executives, ...panel.subExecutives] : [];
  const index = person ? people.findIndex((p) => p.id === person.id) : -1;

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      onStep(e.key === "ArrowRight" ? 1 : -1);
    } else if (e.key === "Tab" && panelRef.current) {
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
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
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "touch") swipe.current = e.clientX;
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    if (swipe.current === null) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 60) onStep(dx < 0 ? 1 : -1);
  };

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : desktop
      ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
      : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  return createPortal(
    <AnimatePresence>
      {person && panel && (
        <motion.div key="alumni-profile" className="fixed inset-0 z-[160]" exit={{ opacity: 1 }}>
          <motion.button
            type="button"
            aria-label="Close profile"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-[#071a19]/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.25 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="alumni-name"
            onKeyDown={onKeyDown}
            {...slide}
            transition={reduce ? { duration: 0.15 } : { duration: 0.42, ease: EASE }}
            className="contact-page absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-2xl border-t border-white/10 bg-[#0b2524] text-[#f5f1e8] shadow-2xl [font-family:var(--font-home),system-ui,sans-serif] md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[480px] md:rounded-none md:border-l md:border-t-0"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">
                Panel {panel.label} · {index + 1} / {people.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => onStep(-1)} aria-label="Previous person" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:bg-white/10">
                  <ArrowLeft aria-hidden className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onStep(1)} aria-label="Next person" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:bg-white/10">
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </button>
                <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close profile" className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                  <X aria-hidden className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto overscroll-contain" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={person.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0.15 : 0.2 }}>
                  <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-b from-[#0f302e] to-[#13312d]">
                    <span aria-hidden className="pointer-events-none absolute -right-2 top-1 select-none font-display text-[150px] font-extrabold leading-[0.8] text-[#f5f1e8]/[0.06]">
                      {panel.label.slice(2)}
                    </span>
                    <motion.div layoutId={flyFrom} className="absolute inset-0" transition={{ duration: 0.5, ease: EASE }}>
                      <Cutout person={person} boxRatio={5 / 4} fill={0.9} sizes="480px" alt={person.name} />
                      {!person.photo && (
                        <span aria-hidden className="absolute inset-0 flex items-center justify-center pt-[18%] font-display text-[64px] font-extrabold text-[#f5f1e8]/40">
                          {initials(person.name)}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  <div className="px-5 pb-8 pt-6 sm:px-6">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3fcfca]/85">
                      {person.role} · Panel {panel.label}
                    </p>
                    <h2 id="alumni-name" className="mt-2 font-display text-[40px] font-extrabold uppercase leading-[0.95] text-[#f5f1e8]">
                      {person.name}
                    </h2>
                    <p className="mt-1 text-[14px] text-[#f5f1e8]/55">{person.committee === "Executive" ? "Executive committee" : "Sub-executive committee"}</p>

                    <div className="mt-6 border-y border-white/10 py-4">
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/50">Now</h3>
                      <p className="mt-1.5 text-[16px] text-[#f5f1e8]">{person.now ?? <span className="text-[#f5f1e8]/55">Not on record yet.</span>}</p>
                    </div>

                    {person.quote && (
                      <blockquote className="mt-6 border-l-2 border-[#3fcfca] pl-4 text-[17px] italic leading-relaxed text-[#f5f1e8]/85">&ldquo;{person.quote}&rdquo;</blockquote>
                    )}

                    {panel.wins.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/50">Won during their term</h3>
                        <ul className="mt-3 space-y-2">
                          {panel.wins.map((w) => (
                            <li key={w.id}>
                              <Link href={w.href} className="inline-flex items-start gap-2 text-[14px] font-medium text-[#f5f1e8] hover:text-[#3fcfca]">
                                <Trophy aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#3fcfca]" />
                                {w.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-7 flex flex-wrap gap-3">
                      {person.facebook && (
                        <a href={person.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 px-5 text-[14px] font-semibold hover:-translate-y-0.5 hover:bg-white/10">
                          <FacebookIcon className="h-4 w-4" />
                          Facebook
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          window.setTimeout(() => askForUpdate({ name: person.name, role: person.role, panel: person.panel }), 50);
                        }}
                        className="group inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold text-[#3fcfca]"
                      >
                        Is this you? Update your details
                        <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
