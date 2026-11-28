"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Trophy } from "lucide-react";
import { haptic } from "@/components/contact/interaction/hooks";
import { cn } from "@/lib/utils";

const DOTS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const dist = 34 + (i % 3) * 10;
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
});

const storageKey = (id: string) => `nsusc:congrats:${id}`;

const label = (count: number) => `${count.toLocaleString("en-GB")} congrats`;

// One "Send congrats" per visitor (cookie on the server, localStorage here). The count flips
// up by one, the trophy bounces and 12 small teal dots burst out. The count is announced.
export function Congrats({ id, initial, className }: { id: string; initial: number | null; className?: string }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(initial);
  const [sent, setSent] = useState(false);
  const [burst, setBurst] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setCount(initial);
    try {
      setSent(window.localStorage.getItem(storageKey(id)) === "1");
    } catch {
      setSent(false);
    }
  }, [id, initial]);

  const remember = () => {
    try {
      window.localStorage.setItem(storageKey(id), "1");
    } catch {
      /* private mode: the server cookie still limits it */
    }
  };

  const send = async () => {
    if (sent) return;
    haptic();
    setSent(true);
    setBurst((b) => b + 1);
    if (count !== null) setCount(count + 1);
    remember();
    try {
      const res = await fetch(`/api/achievements/${id}/congrats`, { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { count?: number };
      if (res.ok && typeof body.count === "number") {
        setCount(body.count);
        setStatus(`Congrats sent. ${label(body.count)}.`);
      } else if (res.status === 409) {
        if (count !== null) setCount(count);
        setStatus("You've already sent congrats.");
      } else {
        if (count !== null) setCount(count);
        setStatus("Congrats noted. The count isn't available right now.");
      }
    } catch {
      setStatus("Congrats noted. The count isn't available right now.");
    }
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <button
        type="button"
        onClick={send}
        disabled={sent}
        data-haptic
        aria-describedby={`congrats-count-${id}`}
        className={cn(
          "relative inline-flex min-h-[48px] items-center gap-2.5 rounded-full border px-5 text-[15px] font-semibold transition hover:-translate-y-0.5 disabled:cursor-default disabled:hover:translate-y-0",
          sent ? "border-[#3fcfca]/50 text-[#3fcfca]" : "border-[#3fcfca] bg-[#3fcfca] text-[#002e2c] hover:brightness-110",
        )}
      >
        <span className="relative">
          <motion.span key={burst} className="block" animate={burst && !reduce ? { y: [0, -9, 0, -4, 0], rotate: [0, -10, 8, 0] } : undefined} transition={{ duration: 0.6, ease: "easeOut" }}>
            <Trophy aria-hidden className="h-[18px] w-[18px]" />
          </motion.span>
          <AnimatePresence>
            {burst > 0 && !reduce && (
              <span key={burst} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
                {DOTS.map((d, i) => (
                  <motion.span
                    key={i}
                    className="absolute -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-[#3fcfca]"
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: d.x, y: d.y, opacity: 0, scale: 0.4 }}
                    transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1] }}
                  />
                ))}
              </span>
            )}
          </AnimatePresence>
        </span>
        {sent ? "Congrats sent" : "Send congrats"}
      </button>

      {count !== null && (
        <span id={`congrats-count-${id}`} className="inline-flex items-baseline gap-1.5 text-[15px] text-[#f5f1e8]/70">
          <span className="relative inline-flex h-[1.3em] overflow-hidden tabular-nums font-semibold text-[#f5f1e8]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={count} initial={reduce ? false : { y: "100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: 0.3, ease: "easeOut" }}>
                {count.toLocaleString("en-GB")}
              </motion.span>
            </AnimatePresence>
          </span>
          {count === 0 && !sent ? "congrats yet. Be the first." : "congrats"}
        </span>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {status}
      </span>
    </div>
  );
}
