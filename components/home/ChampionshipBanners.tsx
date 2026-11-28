"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, animate, motion, useDragControls, useInView, useReducedMotion, useSpring, type PanInfo } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import type { Honour } from "@/lib/honours";
import { cn } from "@/lib/utils";

// Championship banners hanging from the arena rafters, one per honour, newest first.
// Hover lifts and swings a banner under the spotlight; a click opens its story panel below
// (a bottom sheet on phones). Colours are the site's own: brand teal fabric for team honours,
// deep teal with bright-teal trim for individual ones, warm off-white lettering.

const FOUNDED = 1995;
const LENGTHS = [380, 400, 370, 392, 384, 376]; // slightly uneven drops, like real rafters
const TAIL = 38; // depth of the swallow-tail notch, px
const OFF_WHITE = "text-[#f5f1e8]";

function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function Year({ value, play, delay }: { value: number | null; play: boolean; delay: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState<number | null>(value);
  useEffect(() => {
    if (!play || reduce || value === null) return;
    setShown(FOUNDED);
    const controls = animate(FOUNDED, value, { duration: 0.5, delay, ease: "easeOut", onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [play, reduce, value, delay]);
  return <>{shown ?? "—"}</>;
}

// Stitching that follows the banner's outline, 10px in from the edge. Drawn in pixels from
// the banner's measured size so the dashes stay even.
function Stitching({ individual }: { individual: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const d = size
    ? `M10 10 H${size.w - 10} V${size.h - 14} L${size.w / 2} ${size.h - TAIL - 9} L10 ${size.h - 14} Z`
    : "";
  return (
    <svg ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
      {size && (
        <path
          d={d}
          fill="none"
          stroke={individual ? "#3fcfca" : "#f5f1e8"}
          strokeOpacity={individual ? 0.9 : 0.55}
          strokeWidth={1.5}
          strokeDasharray="6 4"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function Banner({
  honour,
  index,
  length,
  play,
  open,
  dimmed,
  phone,
  onOpen,
  onHover,
}: {
  honour: Honour;
  index: number;
  length: number;
  play: boolean;
  open: boolean;
  dimmed: boolean;
  phone: boolean;
  onOpen: (target: HTMLButtonElement) => void;
  onHover: (hovering: boolean) => void;
}) {
  const reduce = useReducedMotion();
  const [lifted, setLifted] = useState(false);
  const delay = index * 0.14;
  const label = [honour.year ?? "Undated", honour.sport, honour.line, honour.detail].join(", ");

  return (
    // 1. Lowered from the rafters with a pendulum swing that settles.
    <motion.div
      className="relative"
      style={{ transformOrigin: "50% 0%" }}
      initial={{ y: -420, rotate: 3 }}
      animate={play ? { y: 0, rotate: [3, -2.2, 1.3, -0.6, 0] } : undefined}
      transition={{
        y: { type: "spring", stiffness: 120, damping: 11, delay },
        rotate: { duration: 1.2, delay: delay + 0.15, ease: "easeOut" },
      }}
    >
      {/* Cables up to the truss. */}
      <span aria-hidden className="absolute left-[24%] top-0 h-10 w-px bg-white/30" />
      <span aria-hidden className="absolute right-[24%] top-0 h-10 w-px bg-white/30" />

      {/* 2. Idle sway: a slow CSS rock, each banner at its own phase. */}
      <div
        className={cn("banner-sway pt-10", phone && "banner-sway-small")}
        style={{ "--sway-duration": `${5 + (index % 3)}s`, "--sway-delay": `${-index * 1.7}s` } as CSSProperties}
      >
        {/* Batten the fabric hangs from. */}
        <span aria-hidden className="relative z-10 block h-2 rounded-sm bg-[#2a3b3a] shadow-[0_2px_3px_rgba(0,0,0,0.5)]" />

        {/* 3. Hover: lift 6px and a gentle swing. */}
        <motion.button
          type="button"
          onClick={(e) => onOpen(e.currentTarget)}
          onPointerEnter={(e) => {
            if (e.pointerType !== "mouse") return;
            setLifted(true);
            onHover(true);
          }}
          onPointerLeave={() => {
            setLifted(false);
            onHover(false);
          }}
          onFocus={(e) => e.currentTarget.matches(":focus-visible") && setLifted(true)}
          onBlur={() => setLifted(false)}
          aria-expanded={open}
          aria-controls="honour-story"
          aria-label={label}
          animate={lifted && !reduce ? { y: -6, rotate: [0, -1.5, 1, 0] } : { y: 0, rotate: 0 }}
          transition={{ y: { type: "spring", stiffness: 300, damping: 18 }, rotate: { duration: 0.9, ease: "easeOut" } }}
          style={{ transformOrigin: "50% 0%", height: length } as CSSProperties}
          className={cn(
            "banner-fabric group relative -mt-1 block w-full text-center outline-none transition-[opacity,filter] duration-300 focus-visible:shadow-[inset_0_0_0_3px_#3fcfca]",
            honour.individual ? "bg-[#0b2524]" : "bg-[#004b49]",
            dimmed ? "opacity-[0.55]" : "opacity-100",
            (lifted || open) && "brightness-110",
          )}
        >
          <Stitching individual={honour.individual} />
          {honour.individual && <span aria-hidden className="absolute inset-x-0 top-0 h-[6px] bg-[#3fcfca]" />}

          <span aria-hidden className="relative flex h-full flex-col items-center px-6 pb-14 pt-8">
            <span className="banner-crest h-10 w-10" />
            <span className={cn("mt-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#f5f1e8]/70")}>{honour.sport}</span>
            <span className={cn("mt-1 font-display text-[72px] font-extrabold leading-[0.9] tabular-nums", OFF_WHITE)}>
              <Year value={honour.year} play={play} delay={delay + 0.6} />
            </span>
            <span className={cn("mt-3 font-display text-[22px] font-extrabold uppercase leading-[1.02] [text-wrap:balance]", OFF_WHITE)}>{honour.line}</span>
            <span className="mt-4 block h-[2px] w-[100px] origin-center scale-x-[0.4] bg-[#3fcfca] transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" />
            <span className="mt-4 text-[14px] leading-snug text-[#f5f1e8]/80 [text-wrap:balance]">{honour.detail}</span>
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}

function StoryBody({ honour, onClose }: { honour: Honour; onClose: () => void }) {
  const meta = [honour.year, honour.sport, honour.detail.split(" · ")[0]].filter(Boolean).join(" · ");
  return (
    <div className="grid gap-6 md:grid-cols-[2fr_3fr] md:gap-10">
      {honour.photo ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#082120]">
          <Image src={honour.photo} alt="" fill sizes="(min-width: 768px) 440px, 100vw" className="object-contain" />
        </div>
      ) : (
        <div className="hidden md:block" />
      )}
      <div className="min-w-0">
        <h3 id="honour-story-heading" className="pr-12 font-display text-[30px] font-extrabold uppercase leading-[0.98] text-[#f5f1e8] [text-wrap:balance] md:text-[40px]">
          {honour.headline}
        </h3>
        <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/60">{meta}</p>
        <div className="mt-5 space-y-3 text-[16px] leading-relaxed text-[#f5f1e8]/85">
          {honour.story.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <Link
          href={honour.href}
          className="group mt-5 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
        >
          Read the full story
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-[3px] motion-reduce:transition-none" />
        </Link>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close story"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-[#f5f1e8] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fcfca]"
      >
        <X aria-hidden className="h-5 w-5" />
      </button>
    </div>
  );
}

export function ChampionshipBanners({
  honours,
  eyebrow = "Wall of fame",
  title = "Honours",
  showAllLink = true,
  onSelect,
}: {
  honours: Honour[];
  eyebrow?: string;
  title?: string;
  showAllLink?: boolean;
  /** When set (the Trophy Room), a banner click opens the page's own story view instead of the panel. */
  onSelect?: (id: string) => void;
}) {
  const reduce = Boolean(useReducedMotion());
  const phone = useMedia("(max-width: 767px)");
  const finePointer = useMedia("(hover: hover) and (pointer: fine)");
  const section = useRef<HTMLElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const play = useInView(row, { once: true, amount: 0.2 });

  const [open, setOpen] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const spotX = useSpring(0, { stiffness: 60, damping: 18 });
  const sheetDrag = useDragControls();

  const banners = honours.slice(0, 6);
  const current = open !== null ? banners[open] : null;

  // Spotlight starts over the middle of the section.
  useEffect(() => {
    const el = section.current;
    if (el) spotX.jump(el.clientWidth / 2);
  }, [spotX]);

  const close = (restoreFocus = true) => {
    setOpen(null);
    if (restoreFocus) opener.current?.focus();
  };

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    // Desktop: bring the panel into view. Phones: the sheet takes focus.
    if (phone) panel.current?.querySelector<HTMLButtonElement>("button[aria-label='Close story']")?.focus();
    else panel.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phone]);

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!finePointer || phone || reduce) return;
    spotX.set(e.clientX - e.currentTarget.getBoundingClientRect().left);
  };

  const onSheetDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) close();
  };

  if (banners.length === 0) return null;

  return (
    <section
      ref={section}
      aria-labelledby="fame-heading"
      onPointerMove={onMove}
      className="relative overflow-hidden bg-[#082120] pb-20 pt-16 sm:pb-24 sm:pt-20"
    >
      {/* Overhead spotlight cone; follows the cursor across the arena. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-0 -ml-[450px] h-full w-[900px] opacity-[0.06] [background:radial-gradient(ellipse_50%_75%_at_50%_0%,#ffffff,transparent_70%)]"
        style={{ x: spotX, left: 0 }}
      />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-[#3fcfca]/80">{eyebrow}</p>
            <h2 id="fame-heading" className="mt-2 text-5xl !font-extrabold uppercase leading-none text-[#f5f1e8] sm:text-[64px]">
              {title}
            </h2>
          </div>
          {showAllLink && (
            <Link
              href="/achievements"
              className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
            >
              All achievements
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-[3px] motion-reduce:transition-none" />
            </Link>
          )}
        </div>
      </div>

      {/* Steel truss across the top of the hanging area. */}
      <div aria-hidden className="relative mt-8 h-20">
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1200 80">
          <g stroke="#ffffff" strokeOpacity="0.05" strokeWidth="2" fill="none">
            <line x1="0" y1="14" x2="1200" y2="14" />
            <line x1="0" y1="62" x2="1200" y2="62" />
            <polyline points={Array.from({ length: 31 }, (_, i) => `${i * 40},${i % 2 ? 62 : 14}`).join(" ")} />
          </g>
        </svg>
      </div>

      <div
        ref={row}
        className="no-scrollbar relative -mt-[18px] flex snap-x snap-mandatory gap-5 overflow-x-auto px-[15vw] pb-4 md:mx-auto md:max-w-[1280px] md:justify-center md:gap-8 md:overflow-visible md:px-6 lg:px-8"
      >
        {banners.map((honour, i) => (
          <div key={honour.id} className="w-[70vw] shrink-0 snap-center md:w-auto md:flex-1 md:basis-0 md:max-w-[240px]">
            <Banner
              honour={honour}
              index={i}
              length={LENGTHS[i % LENGTHS.length] - (phone ? 30 : 0)}
              play={play}
              open={open === i}
              dimmed={(hovered !== null && hovered !== i) || (open !== null && open !== i && hovered === null)}
              phone={phone}
              onOpen={(target) => {
                if (onSelect) return onSelect(honour.id);
                opener.current = target;
                setOpen((currentOpen) => (currentOpen === i ? null : i));
              }}
              onHover={(on) => setHovered(on ? i : null)}
            />
          </div>
        ))}
      </div>

      {/* Story panel: slides up under the banners (desktop) or as a bottom sheet (phones). */}
      {!phone && (
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
          <AnimatePresence>
            {current && (
              <motion.div
                ref={panel}
                id="honour-story"
                role="region"
                aria-labelledby="honour-story-heading"
                initial={{ y: 48, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 48, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.7, 0.25, 1] }}
                className="relative mt-10 border-t border-white/10 bg-[#0b2524] p-6 md:p-8"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={current.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                    <StoryBody honour={current} onClose={() => close()} />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {phone && (
        <AnimatePresence>
          {current && (
            <>
              <motion.div
                key="backdrop"
                aria-hidden
                className="fixed inset-0 z-[60] bg-black/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => close()}
              />
              <motion.div
                key="sheet"
                ref={panel}
                id="honour-story"
                role="dialog"
                aria-modal="true"
                aria-labelledby="honour-story-heading"
                drag="y"
                dragListener={false}
                dragControls={sheetDrag}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.8 }}
                onDragEnd={onSheetDragEnd}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                className="fixed inset-x-0 bottom-0 z-[61] max-h-[88vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[#0b2524] px-5 pb-8 pt-3"
              >
                {/* Drag handle: pull down to close (the rest of the sheet scrolls normally). */}
                <div aria-hidden onPointerDown={(e) => sheetDrag.start(e)} className="-mx-5 -mt-3 mb-2 flex touch-none justify-center py-3">
                  <span className="block h-1 w-10 rounded-full bg-white/25" />
                </div>
                <div className="relative">
                  <StoryBody honour={current} onClose={() => close()} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </section>
  );
}
