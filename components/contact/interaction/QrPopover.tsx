"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRichPointer } from "@/components/contact/interaction/hooks";

// Desktop hover/focus popover with a QR code, so a visitor at a computer can scan a phone
// number (or link) straight onto their phone. The number itself is always shown as text,
// so nothing depends on the popover. The QR library loads only when it first opens.
export function QrPopover({ value, label, children }: { value: string; label: string; children: ReactNode }) {
  const desktop = useRichPointer();
  const [open, setOpen] = useState(false);
  const [svg, setSvg] = useState<string | null>(null);
  const id = useId();

  useEffect(() => {
    if (!open || svg) return;
    let cancelled = false;
    import("qrcode")
      .then((QR) => QR.toString(value, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0b2524", light: "#f5f1e8" } }))
      .then((markup) => !cancelled && setSvg(markup))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open, svg, value]);

  if (!desktop) return <>{children}</>;

  return (
    <span
      className="relative inline-flex"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="absolute left-0 top-full z-30 mt-2 w-44 rounded-lg border border-white/15 bg-[#082120] p-3 shadow-[0_16px_30px_-12px_rgba(0,0,0,0.8)]"
          >
            <span className="block aspect-square w-full overflow-hidden rounded bg-[#f5f1e8]">
              {svg && <span className="block h-full w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />}
            </span>
            <span className="mt-2 block text-[12px] leading-snug text-[#f5f1e8]/70">{label}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
