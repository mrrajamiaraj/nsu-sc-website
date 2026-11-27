"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Ph } from "@/components/contact/extras/shared";
import { PREFILL_EVENT, haptic } from "@/components/contact/interaction/hooks";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import { cn } from "@/lib/utils";

export interface HeroFace {
  id: string;
  name: string;
  firstName: string;
  role: string;
  photo: string;
}

const LINES = ["Talk to the", "Panel."];

// Headline letters lift and turn teal as the cursor passes, with a small wave into the neighbours.
function WaveTitle() {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  let index = 0;
  return (
    <h1 className="mt-2 text-5xl !font-extrabold uppercase leading-[0.92] text-[#f5f1e8] sm:text-[64px]" onPointerLeave={() => setHover(null)}>
      <span className="sr-only">Talk to the panel.</span>
      <span aria-hidden>
        {LINES.map((line, l) => (
          <span key={l} className="block">
            {Array.from(line).map((char) => {
              const i = index++;
              const d = hover === null ? 99 : Math.abs(i - hover);
              const lift = d === 0 ? -4 : d === 1 ? -2.5 : d === 2 ? -1 : 0;
              return (
                <motion.span
                  key={i}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
                  animate={reduce ? undefined : { y: lift }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className={cn("inline-block whitespace-pre transition-colors duration-150", d <= 1 ? "text-[#3fcfca]" : "text-[#f5f1e8]")}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        ))}
      </span>
    </h1>
  );
}

// Panel faces: hover or focus enlarges one (the others make room) with name and role;
// clicking starts the message with "Hi <name>, ".
function Faces({ faces }: { faces: HeroFace[] }) {
  const [active, setActive] = useState<number | null>(null);
  if (faces.length === 0) return null;
  return (
    <div className="mt-7 flex items-center gap-4">
      <ul className="flex items-center pl-2" aria-label="Message a panel member">
        {faces.map((face, i) => {
          const isActive = active === i;
          const shift = active === null || isActive ? 0 : i < active ? -10 : 10;
          return (
            <li key={face.id} className="relative -ml-2" style={{ zIndex: isActive ? 20 : faces.length - i }}>
              <motion.button
                type="button"
                data-haptic
                aria-label={`Message ${face.name}, ${face.role}`}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => {
                  haptic();
                  window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: { greeting: `Hi ${face.firstName}, ` } }));
                }}
                animate={{ scale: isActive ? 1.5 : 1, x: shift }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="relative block h-12 w-12 overflow-hidden rounded-full border-2 border-[#0b2524] bg-[#0f302e]"
              >
                <Image src={face.photo} alt="" fill sizes="72px" className="object-cover" />
              </motion.button>
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    role="tooltip"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="pointer-events-none absolute bottom-full left-1/2 mb-9 w-max max-w-[15rem] -translate-x-1/2 rounded-lg border border-white/15 bg-[#082120] px-3 py-2 text-left shadow-[0_14px_28px_-12px_rgba(0,0,0,0.8)]"
                  >
                    <span className="block text-[14px] font-semibold text-[#f5f1e8]">{face.name}</span>
                    <span className="block text-[12px] text-[#f5f1e8]/60">{face.role}</span>
                    <span className="mt-1 block text-[12px] font-semibold text-[#3fcfca]">Message →</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      <p className="text-[14px] text-[#f5f1e8]/60">Pick someone to start your message.</p>
    </div>
  );
}

// "Usually replies within …" with a pulsing dot; hover, focus or tap shows the 30-day average.
function ReplyIndicator() {
  const [open, setOpen] = useState(false);
  const { replyTime, averageReplyTime } = CONTACT_EXTRAS;
  return (
    <span className="relative mt-5 inline-flex">
      <button
        type="button"
        aria-expanded={open}
        onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2.5 text-[14px] text-[#f5f1e8]/75"
      >
        <span aria-hidden className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#3fcfca] opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#3fcfca]" />
        </span>
        Usually replies within {replyTime ?? <Ph>reply time</Ph>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            role="status"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-20 mt-2 w-max max-w-[18rem] rounded-lg border border-white/15 bg-[#082120] px-3 py-2 text-[13px] text-[#f5f1e8]/80"
          >
            Average reply time, last 30 days: {averageReplyTime ?? <Ph>not measured yet</Ph>}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

// Compact, left-aligned page opening so the contact options appear quickly.
export function ContactHero({ faces }: { faces: HeroFace[] }) {
  return (
    <header className="mx-auto max-w-[1280px] px-6 pb-8 pt-8 lg:px-8 lg:pb-10 lg:pt-12">
      <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#3fcfca]/80">Contact</p>
      <WaveTitle />
      <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#f5f1e8]/75">
        Ask the club panel about squad trials, upcoming events or partnering with NSU SC.
      </p>
      <ReplyIndicator />
      <Faces faces={faces} />
    </header>
  );
}
