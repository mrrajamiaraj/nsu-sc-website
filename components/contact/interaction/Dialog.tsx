"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
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
  variant: "slideover" | "lightbox";
  children: ReactNode;
  onKeyDown?: (e: KeyboardEvent) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  if (typeof document === "undefined") return null;

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
            initial={variant === "slideover" ? { x: "100%" } : { opacity: 0, scale: 0.96 }}
            animate={variant === "slideover" ? { x: 0 } : { opacity: 1, scale: 1 }}
            exit={variant === "slideover" ? { x: "100%" } : { opacity: 0, scale: 0.96 }}
            transition={variant === "slideover" ? { type: "spring", stiffness: 360, damping: 36 } : { duration: 0.2 }}
            className={cn(
              "absolute bg-[#0b2524] text-[#f5f1e8] [font-family:var(--font-home),system-ui,sans-serif]",
              variant === "slideover"
                ? "inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-white/10 p-6 sm:p-8"
                : "inset-4 flex flex-col rounded-xl border border-white/10 p-4 sm:inset-10 sm:p-6",
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#0b2524] transition hover:-translate-y-0.5 hover:bg-white/10"
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
