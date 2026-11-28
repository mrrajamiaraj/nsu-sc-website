"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, Phone, Trophy, X } from "lucide-react";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { useMedia } from "@/components/contact/interaction/hooks";
import { Cutout, initials } from "@/components/teams/announcement/Cutout";
import { useRoster } from "@/components/teams/announcement/RosterContext";
import { EASE } from "@/components/teams/squad-select/shared";
import type { SquadHonour } from "@/lib/squads";
import type { SheetLink } from "@/lib/team-sheet";
import { cn } from "@/lib/utils";

const LINK_META: Record<SheetLink["key"], { label: string; icon: ComponentType<{ className?: string }> }> = {
  facebook: { label: "Facebook", icon: FacebookIcon },
  email: { label: "Email", icon: Mail },
  phone: { label: "Phone", icon: Phone },
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Player profile: a 480px drawer from the right on desktop, a bottom sheet on phones.
// ←/→ (or the arrows, or a swipe on phones) move through the squad; Esc closes.
export function ProfileDrawer({ squadLabel, honours }: { squadLabel: string; honours: SquadHonour[] }) {
  const { people, current, origin, step, close } = useRoster();
  const reduce = Boolean(useReducedMotion());
  const desktop = useMedia("(min-width: 768px)");
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const swipe = useRef<number | null>(null);
  const open = Boolean(current);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock page scroll and move focus in while open.
  useEffect(() => {
    if (!open || !mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, mounted]);

  if (!mounted) return null;

  const index = current ? people.findIndex((p) => p.slug === current.slug) : -1;
  const flyFrom = current && origin?.from === "card" && origin.slug === current.slug ? `card-${current.slug}` : undefined;

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    } else if (e.key === "Tab" && panel.current) {
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
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
    if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
  };

  const sheet = desktop
    ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  return createPortal(
    <AnimatePresence>
      {current && (
        <motion.div key="profile" className="fixed inset-0 z-[160]" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.button
            type="button"
            aria-label="Close profile"
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 h-full w-full cursor-default bg-[#071a19]/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.25 }}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-name"
            onKeyDown={onKeyDown}
            {...(reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : sheet)}
            transition={reduce ? { duration: 0.15 } : { duration: 0.42, ease: EASE }}
            className="contact-page absolute inset-x-0 bottom-0 flex [font-family:var(--font-home),system-ui,sans-serif] max-h-[92dvh] flex-col overflow-hidden rounded-t-2xl border-t border-white/10 bg-[#0b2524] text-[#f5f1e8] shadow-2xl md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[480px] md:rounded-none md:border-l md:border-t-0"
          >
            {/* Bar: position in the squad, previous / next, close. */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">
                {squadLabel} · {index + 1} / {people.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => step(-1)} aria-label="Previous player" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:bg-white/10">
                  <ArrowLeft aria-hidden className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next player" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:bg-white/10">
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </button>
                <button ref={closeBtn} type="button" onClick={close} aria-label="Close profile" className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                  <X aria-hidden className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto overscroll-contain" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.slug}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0.15 : 0.2 }}
                >
                  {/* Stage */}
                  <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-b from-[#0f302e] to-[#13312d]">
                    <span aria-hidden className="pointer-events-none absolute -right-2 top-2 select-none font-display text-[200px] font-extrabold leading-[0.8] text-[#f5f1e8]/[0.07]">
                      {current.number ?? current.mark}
                    </span>
                    <motion.div layoutId={flyFrom} className="absolute inset-0" transition={{ duration: 0.5, ease: EASE }}>
                      <Cutout person={current} boxRatio={5 / 4} fill={0.9} sizes="480px" alt={current.name} />
                      {!current.photo && (
                        <span aria-hidden className="absolute inset-0 flex items-center justify-center pt-[18%] font-display text-[72px] font-extrabold text-[#f5f1e8]/30">
                          {initials(current.name)}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  <div className="px-5 pb-8 pt-6 sm:px-6">
                    <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3fcfca]/85">
                      {current.number && <span>#{current.number}</span>}
                      {current.number && (current.role || current.captain) && <span aria-hidden>·</span>}
                      <span>{[current.role, current.captain === "C" ? "Captain" : current.captain === "VC" ? "Vice-Captain" : null].filter(Boolean).join(" · ") || current.group}</span>
                    </p>
                    <h2 id="profile-name" className="mt-2 font-display text-[40px] font-extrabold uppercase leading-[0.95] text-[#f5f1e8]">
                      {current.name}
                    </h2>

                    <dl className="mt-6 grid grid-cols-2 border-y border-white/10">
                      <div className="border-r border-white/10 py-3 pr-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/50">{current.group === "Staff" ? "Role" : "Position"}</dt>
                        <dd className="mt-1 text-[15px] font-medium">{current.role ?? "To be confirmed"}</dd>
                      </div>
                      <div className="py-3 pl-4">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/50">Squad</dt>
                        <dd className="mt-1 text-[15px] font-medium">{squadLabel}</dd>
                      </div>
                    </dl>

                    {current.group !== "Staff" && (
                      <div className="mt-6">
                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/50">Stats</h3>
                        <p className="mt-2 text-[14px] text-[#f5f1e8]/60">Stats coming soon.</p>
                      </div>
                    )}

                    {current.bio && <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-[#f5f1e8]/80">{current.bio}</p>}

                    {honours.length > 0 && current.group !== "Staff" && (
                      <div className="mt-6">
                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/50">Squad honours</h3>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {honours.map((h) => (
                            <li key={h.id}>
                              <Link href={h.href} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[13px] hover:border-[#3fcfca] hover:text-[#3fcfca]">
                                <Trophy aria-hidden className="h-3.5 w-3.5" />
                                {h.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {current.links.length > 0 && (
                      <ul className="mt-6 flex flex-wrap gap-2">
                        {current.links.map((link) => {
                          const meta = LINK_META[link.key];
                          const Icon = meta.icon;
                          return (
                            <li key={link.key}>
                              <a
                                href={link.href}
                                target={link.key === "facebook" ? "_blank" : undefined}
                                rel={link.key === "facebook" ? "noopener noreferrer" : undefined}
                                className={cn("inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/15 px-4 text-[14px] hover:-translate-y-0.5 hover:bg-white/10")}
                              >
                                <Icon className="h-4 w-4" />
                                {meta.label}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
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
