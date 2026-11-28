"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex='-1'])";

// Modal dialog: focus moves in and is trapped, Esc or the backdrop closes it, focus goes
// back to whatever opened it, and the page behind doesn't scroll.
export function Dialog({
  open,
  onClose,
  labelledBy,
  variant,
  children,
  onKeyDown,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  variant: "slideover" | "lightbox" | "sheet";
  children: ReactNode;
  onKeyDown?: (e: KeyboardEvent) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const drag = useDragControls();
  const sheet = variant === "sheet";
  // Portals only exist in the browser; rendering after mount keeps hydration clean even when
  // the dialog starts open (e.g. a direct link to /achievements/<id>).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !mounted) return;
    opener.current = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
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
      onKeyDown?.(e);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = previous;
      opener.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="contact-page fixed inset-0 z-[160]">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={variant === "slideover" ? { x: "100%" } : sheet ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
            animate={variant === "slideover" ? { x: 0 } : sheet ? { y: 0 } : { opacity: 1, scale: 1 }}
            exit={variant === "slideover" ? { x: "100%" } : sheet ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
            transition={variant === "lightbox" ? { duration: 0.2 } : { type: "spring", stiffness: 360, damping: 36 }}
            // Full-screen sheet: pull it down by its handle to close.
            drag={sheet ? "y" : false}
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_: unknown, info: PanInfo) => {
              if (info.offset.y > 120 || info.velocity.y > 700) onClose();
            }}
            className={cn(
              "absolute bg-[#0b2524] text-[#f5f1e8] [font-family:var(--font-home),system-ui,sans-serif]",
              variant === "slideover" && "inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-white/10 p-6 sm:p-8",
              variant === "lightbox" && "inset-4 flex flex-col rounded-xl border border-white/10 p-4 sm:inset-10 sm:p-6",
              sheet && "inset-x-0 bottom-0 top-0 overflow-y-auto md:top-6 md:rounded-t-2xl md:border-t md:border-white/10",
            )}
          >
            {sheet && (
              <div aria-hidden onPointerDown={(e) => drag.start(e)} className="sticky top-0 z-10 flex touch-none justify-center bg-[#0b2524] py-3">
                <span className="block h-1 w-10 rounded-full bg-white/25" />
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              // In the sheet the panel scrolls, so the button stays pinned to the panel's corner.
              className={cn(
                sheet ? "fixed" : "absolute",
                "right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#0b2524] transition hover:-translate-y-0.5 hover:bg-white/10",
              )}
            >
              <X aria-hidden className="h-5 w-5" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
