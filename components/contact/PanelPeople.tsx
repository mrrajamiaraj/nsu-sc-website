"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PREFILL_EVENT } from "@/components/contact/interaction/hooks";
import { Cutout, Silhouette, initials } from "@/components/teams/announcement/Cutout";
import type { PanelPerson } from "@/lib/contact-panel";
import { cn } from "@/lib/utils";

// Header faces and "Who to contact" talk through this: a face click highlights its person.
const HIGHLIGHT_EVENT = "nsusc:contact-highlight"; // detail: person id

function Portrait({ person, size, lifted = false, className }: { person: PanelPerson; size: number; lifted?: boolean; className?: string }) {
  return (
    <span className={cn("relative block shrink-0 rounded-full bg-[#13312d]", className)} style={{ width: size, height: size }}>
      {/* The cut-out sits in its disc and pops out over the top when lifted. */}
      <span
        className="absolute inset-0 block transition-[clip-path,transform] duration-300 ease-out motion-reduce:transition-opacity"
        style={{
          clipPath: lifted ? "inset(-30% 0 0 0 round 0 0 50% 50%)" : "inset(0 round 50%)",
          transform: lifted ? "scale(1.08)" : undefined,
        }}
      >
        {person.photo ? (
          <Cutout person={person} boxRatio={1} fill={1.45} align="top" sizes={`${size * 2}px`} />
        ) : (
          <>
            <Silhouette />
            <span aria-hidden className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-[#f5f1e8]/60" style={{ fontSize: size * 0.28 }}>
              {initials(person.name)}
            </span>
          </>
        )}
      </span>
    </span>
  );
}

// ---- Header: four small overlapping faces next to the reply-time line.

export function PanelFaces({ people }: { people: PanelPerson[] }) {
  const [active, setActive] = useState<string | null>(null);
  if (people.length === 0) return null;
  return (
    <div className="flex items-center gap-3">
      <ul className="flex pl-1.5" aria-label="The panel">
        {people.map((p, i) => (
          <li key={p.id} className="relative -ml-1.5" style={{ zIndex: active === p.id ? 20 : people.length - i }}>
            <button
              type="button"
              aria-label={`${p.name}, ${p.role}. Show in Who to contact`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(p.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(p.id)}
              onBlur={() => setActive(null)}
              onClick={() => {
                window.dispatchEvent(new CustomEvent(HIGHLIGHT_EVENT, { detail: p.id }));
                document.getElementById("who-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="block rounded-full ring-2 ring-[#0b2524] transition-transform duration-150 hover:-translate-y-0.5"
            >
              <Portrait person={p} size={40} />
            </button>
            <AnimatePresence>
              {active === p.id && (
                <motion.span
                  role="tooltip"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max -translate-x-1/2 rounded-lg border border-white/15 bg-[#082120] px-3 py-1.5 text-left shadow-xl"
                >
                  <span className="block text-[13px] font-semibold text-[#f5f1e8]">{p.name}</span>
                  <span className="block text-[12px] text-[#f5f1e8]/60">{p.role}</span>
                </motion.span>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
      <p className="text-[14px] text-[#f5f1e8]/65">The panel reads every message.</p>
    </div>
  );
}

// ---- "Who to contact": one row of the executive committee.

export function WhoToContact({ people }: { people: PanelPerson[] }) {
  const reduce = Boolean(useReducedMotion());
  const [hover, setHover] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // A header face click lands here and highlights its person for a moment.
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setFlash(id);
      window.setTimeout(() => setFlash((f) => (f === id ? null : f)), 1800);
    };
    window.addEventListener(HIGHLIGHT_EVENT, on);
    return () => window.removeEventListener(HIGHLIGHT_EVENT, on);
  }, []);

  if (people.length === 0) return null;
  return (
    <section aria-labelledby="who-heading">
      <h2 id="who-heading" className="scroll-mt-28 text-[40px] !font-extrabold leading-none text-[#f5f1e8]">
        Who to contact
      </h2>
      <p className="mt-3 text-[16px] text-[#f5f1e8]/60">Message the right person on the panel.</p>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
        {people.map((p) => {
          const lifted = hover === p.id || flash === p.id;
          return (
            <li
              key={p.id}
              onPointerEnter={() => setHover(p.id)}
              onPointerLeave={() => setHover(null)}
              className={cn("flex flex-col items-center rounded-xl px-2 pb-4 pt-6 text-center transition-colors duration-500", flash === p.id && "bg-[#3fcfca]/[0.07]")}
            >
              <Portrait person={p} size={96} lifted={lifted && !reduce} className={cn("ring-2 transition-[box-shadow] duration-200", lifted ? "ring-[#3fcfca]" : "ring-transparent")} />
              <p className="mt-4 text-[17px] font-semibold leading-snug text-[#f5f1e8]">{p.name}</p>
              <p className="mt-0.5 text-[14px] text-[#f5f1e8]/60">{p.role}</p>
              {p.askAbout && <p className="mt-2 text-[13px] text-[#f5f1e8]/75">Ask about: {p.askAbout}</p>}
              <button
                type="button"
                data-haptic
                onFocus={() => setHover(p.id)}
                onBlur={() => setHover(null)}
                onClick={() => window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: { greeting: `Hi ${p.firstName}, ` } }))}
                className="group mt-auto inline-flex min-h-[44px] items-center gap-1.5 pt-3 text-[15px] font-semibold text-[#3fcfca]"
              >
                Message
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                <span className="sr-only">{p.firstName}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Link href="/members" className="group mt-6 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#f5f1e8]/75 hover:text-[#3fcfca]">
        See the full panel
        <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </section>
  );
}
