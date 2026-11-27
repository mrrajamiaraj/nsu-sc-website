"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Ph } from "@/components/contact/extras/shared";
import { Dialog } from "@/components/contact/interaction/Dialog";
import { useMedia } from "@/components/contact/interaction/hooks";
import { CREST, type Milestone } from "@/lib/about";
import { cn } from "@/lib/utils";

const SPACING = 460; // distance between stops on the desktop track
const STOP_W = 400;

function Runner({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15" cy="4" r="2" fill="currentColor" stroke="none" />
      <path d="M8 21l3-6 3 3v4M6 12l3-4 4 1 3 4 3 1M13 9l-2 6" />
    </svg>
  );
}

// Photo printed in the club's teal until the runner reaches it, then in full colour.
function StopPhoto({ src, lit, sizes }: { src: string | null; lit: boolean; sizes: string }) {
  return (
    <span className="relative block aspect-[16/10] overflow-hidden rounded-md bg-[#0f302e]">
      {src && (
        <>
          <Image
            src={src}
            alt=""
            fill
            sizes={sizes}
            // The club crest (founding stop) is shown whole; photos fill the frame.
            className={cn("transition duration-500", src === CREST ? "object-contain p-4" : "object-cover", lit ? "grayscale-0" : "grayscale")}
          />
          <span aria-hidden className={cn("absolute inset-0 bg-[#0b2524] mix-blend-color transition-opacity duration-500", lit ? "opacity-0" : "opacity-100")} />
        </>
      )}
    </span>
  );
}

function StopText({ stop, lit, big }: { stop: Milestone; lit: boolean; big: boolean }) {
  return (
    <>
      <span className={cn("block font-display font-extrabold leading-none transition-colors duration-300", big ? "text-[96px]" : "text-[56px]", lit ? "text-[#3fcfca]" : "text-[#f5f1e8]/80")}>
        {stop.year}
      </span>
      <span className="mt-2 block text-[18px] font-semibold text-[#f5f1e8]">{stop.title}</span>
      <span className="mt-1 block text-[15px] leading-snug text-[#f5f1e8]/70">
        {stop.story}
        {stop.placeholder && (
          <>
            {" "}
            Founded by <Ph>{stop.placeholder}</Ph>.
          </>
        )}
      </span>
    </>
  );
}

// Desktop: the track is pinned while the page scrolls, and slides sideways under a runner.
function PinnedTrack({ stops, onOpen }: { stops: Milestone[]; onOpen: (i: number) => void }) {
  const outer = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ vw: 1440, pad: 120 });
  const [lit, setLit] = useState(0);
  const n = stops.length;
  const trackW = view.pad * 2 + (n - 1) * SPACING + STOP_W;
  const dist = Math.max(0, trackW - view.vw);

  useEffect(() => {
    const measure = () => {
      const vw = document.documentElement.clientWidth;
      setView({ vw, pad: Math.max(24, (vw - 1280) / 2 + 32) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (p) => -p * dist);
  const runnerX = useTransform(scrollYProgress, (p) => view.pad + p * (n - 1) * SPACING);
  const fill = useTransform(scrollYProgress, (p) => (view.pad + p * (n - 1) * SPACING) / trackW);
  useMotionValueEvent(scrollYProgress, "change", (p) => setLit(Math.min(n - 1, Math.floor(p * (n - 1) + 0.25))));

  // Dragging sideways scrolls the page, which moves the track.
  const drag = useRef<number | null>(null);
  const onDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse") drag.current = e.clientX;
  };
  const onMove = (e: ReactPointerEvent) => {
    if (drag.current === null || !outer.current) return;
    const dx = e.clientX - drag.current;
    drag.current = e.clientX;
    const scrollable = outer.current.offsetHeight - window.innerHeight;
    if (dist > 0) window.scrollBy(0, (-dx * scrollable) / dist);
  };
  const onUp = () => (drag.current = null);

  return (
    <div ref={outer} style={{ height: `${100 + n * 45}vh` }} className="relative">
      <div
        data-cursor="drag"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        className="sticky top-0 flex h-screen select-none flex-col justify-center overflow-hidden"
      >
        <motion.div style={{ x, width: trackW }} className="relative h-[600px]">
          {stops.map((stop, i) => (
            <button
              key={stop.key}
              type="button"
              onClick={() => onOpen(i)}
              aria-label={`${stop.year}: ${stop.title}. Open the story`}
              className="group absolute top-0 text-left"
              style={{ left: view.pad + i * SPACING, width: STOP_W }}
            >
              <span className="block transition-transform duration-200 group-hover:-translate-y-1">
                <StopPhoto src={stop.photo} lit={i <= lit} sizes="400px" />
              </span>
              <span className="mt-4 block">
                <StopText stop={stop} lit={i <= lit} big />
              </span>
            </button>
          ))}

          {/* Running track: three lanes, a marker at each stop, the runner on the top lane. */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-12">
            {[0, 1, 2].map((lane) => (
              <span key={lane} className="absolute inset-x-0 h-px bg-[#f5f1e8]/15" style={{ top: lane * 16 + 8 }} />
            ))}
            <motion.span className="absolute left-0 top-[7px] h-[3px] w-full origin-left bg-[#3fcfca]" style={{ scaleX: fill }} />
            {stops.map((stop, i) => (
              <span key={stop.key} className="absolute top-0 flex flex-col items-center" style={{ left: view.pad + i * SPACING - 6 }}>
                <span className={cn("h-3 w-3 rounded-full border-2 transition-colors", i <= lit ? "border-[#3fcfca] bg-[#3fcfca]" : "border-[#f5f1e8]/40 bg-[#0b2524]")} />
                <span className="mt-6 text-[12px] font-semibold text-[#f5f1e8]/50">{stop.year}</span>
              </span>
            ))}
            <motion.span className="absolute -top-7 text-[#3fcfca]" style={{ x: runnerX, marginLeft: -12 }}>
              <Runner className="h-6 w-6" />
            </motion.span>
          </div>
        </motion.div>
        <p className="mx-auto mt-8 w-full max-w-[1280px] px-8 text-[13px] text-[#f5f1e8]/45">Scroll or drag to move through the seasons. Select a stop for its story.</p>
      </div>
    </div>
  );
}

// Phones and reduced motion: a vertical track down the left edge; stops light up as they arrive.
function VerticalTrack({ stops, onOpen }: { stops: Milestone[]; onOpen: (i: number) => void }) {
  const reduce = useReducedMotion();
  const list = useRef<HTMLOListElement>(null);
  const [lit, setLit] = useState(reduce ? stops.length : -1);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.7", "end 0.7"] });
  const top = useTransform(scrollYProgress, (p) => `${p * 100}%`);

  return (
    <ol ref={list} className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
      <span aria-hidden className="absolute bottom-0 left-[33px] top-0 w-px bg-[#f5f1e8]/15 lg:left-[41px]" />
      {!reduce && (
        <motion.span aria-hidden className="absolute left-[22px] z-10 -mt-3 text-[#3fcfca] lg:left-[30px]" style={{ top }}>
          <Runner className="h-6 w-6" />
        </motion.span>
      )}
      {stops.map((stop, i) => (
        <motion.li
          key={stop.key}
          onViewportEnter={() => setLit((l) => Math.max(l, i))}
          viewport={{ amount: 0.5 }}
          className="relative py-8 pl-12"
        >
          <span
            aria-hidden
            className={cn("absolute left-[3px] top-11 h-3.5 w-3.5 rounded-full border-2 transition-colors lg:left-[11px]", i <= lit ? "border-[#3fcfca] bg-[#3fcfca]" : "border-[#f5f1e8]/40 bg-[#0b2524]")}
          />
          <button type="button" onClick={() => onOpen(i)} className="group block w-full max-w-xl text-left" aria-label={`${stop.year}: ${stop.title}. Open the story`}>
            <StopText stop={stop} lit={i <= lit} big={false} />
            <span className="mt-4 block">
              <StopPhoto src={stop.photo} lit={i <= lit} sizes="(min-width: 768px) 560px, 90vw" />
            </span>
          </button>
        </motion.li>
      ))}
    </ol>
  );
}

function Drawer({ stop, onClose }: { stop: Milestone | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(stop)} onClose={onClose} labelledBy="season-title" variant="slideover">
      {stop && (
        <>
          <p className="font-display text-[64px] font-extrabold leading-none text-[#3fcfca]">{stop.year}</p>
          <h3 id="season-title" className="mt-2 pr-14 text-[24px] font-semibold text-[#f5f1e8]">
            {stop.title}
          </h3>
          {stop.photos.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-2">
              {stop.photos.slice(0, 6).map((src, i) => (
                <span key={src} data-cursor="view" className={cn("relative block overflow-hidden rounded-md bg-[#0f302e]", i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square")}>
                  <Image src={src} alt="" fill sizes={i === 0 ? "448px" : "220px"} className="object-cover" />
                </span>
              ))}
            </div>
          )}
          <div className="mt-5 space-y-3 text-[16px] leading-relaxed text-[#f5f1e8]/80">
            {(stop.full.length ? stop.full : [stop.story]).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {stop.placeholder && (
              <p>
                Founded by <Ph>{stop.placeholder}</Ph>.
              </p>
            )}
          </div>
          {stop.href && (
            <Link href={stop.href} className="group mt-6 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
              {stop.linkLabel}
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </>
      )}
    </Dialog>
  );
}

// "The seasons": the club's story as a running track of milestones.
export function Seasons({ stops, founded, year }: { stops: Milestone[]; founded: number; year: number }) {
  const reduce = useReducedMotion();
  const wide = useMedia("(min-width: 1024px)");
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section aria-labelledby="seasons-heading" className="pt-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <h2 id="seasons-heading" className="text-[44px] !font-extrabold uppercase leading-none text-[#f5f1e8] md:text-[64px]">
          The seasons
        </h2>
        <p className="mt-3 max-w-2xl text-[17px] text-[#f5f1e8]/65">
          {founded} to {year}: moments from the club&rsquo;s record.
        </p>
      </div>
      <div className="mt-10">
        {wide && !reduce ? <PinnedTrack stops={stops} onOpen={setOpen} /> : <VerticalTrack stops={stops} onOpen={setOpen} />}
      </div>
      <Drawer stop={open !== null ? stops[open] : null} onClose={() => setOpen(null)} />
    </section>
  );
}
