"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Cutout } from "@/components/teams/announcement/Cutout";
import { ANTON, contactHref, useOpenPerson } from "@/components/members/sheet/shared";
import type { PanelPerson } from "@/lib/members-sheet";
import { cn } from "@/lib/utils";

type Spot = { person: PanelPerson; x: number; y: number; size: "coach" | "captain" | "spine" };

// Board coordinates (percent of the board) for each spot: the coach on the touchline at the
// top, the president in the centre circle, the other executives in a line behind.
function spots(advisor: PanelPerson | undefined, executives: PanelPerson[]): Spot[] {
  const out: Spot[] = [];
  if (advisor) out.push({ person: advisor, x: 50, y: 24, size: "coach" });
  const [president, ...rest] = executives;
  if (president) out.push({ person: president, x: 50, y: 56, size: "captain" });
  const xs = rest.length === 1 ? [50] : rest.length === 2 ? [30, 70] : rest.map((_, i) => 17 + (66 / (rest.length - 1)) * i);
  rest.forEach((person, i) => out.push({ person, x: xs[i], y: 86, size: "spine" }));
  return out;
}

const FIGURE: Record<Spot["size"], string> = {
  coach: "w-[96px] md:w-[120px]",
  captain: "w-[112px] md:w-[156px]",
  spine: "w-[84px] md:w-[124px]",
};

function PitchLines() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      fill="none"
      stroke="#f5f1e8"
      strokeOpacity="0.06"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
    >
      <rect x="24" y="24" width="952" height="952" vectorEffect="non-scaling-stroke" />
      <line x1="24" y1="560" x2="976" y2="560" vectorEffect="non-scaling-stroke" />
      <ellipse cx="500" cy="560" rx="110" ry="90" vectorEffect="non-scaling-stroke" />
      <rect x="300" y="840" width="400" height="136" vectorEffect="non-scaling-stroke" />
      <rect x="410" y="920" width="180" height="56" vectorEffect="non-scaling-stroke" />
      {/* Technical area on the touchline, where the coach stands. */}
      <rect x="380" y="24" width="240" height="90" strokeDasharray="8 8" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Player({
  spot,
  index,
  active,
  dimmed,
  inView,
  onHover,
  onSelect,
}: {
  spot: Spot;
  index: number;
  active: boolean;
  dimmed: boolean;
  inView: boolean;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
}) {
  const reduce = useReducedMotion();
  const open = useOpenPerson();
  const pointer = useRef<string>("mouse");
  const { person, x, y, size } = spot;
  const right = x > 60;
  const label = size === "coach" ? "Faculty Advisor" : person.role;

  return (
    <motion.div
      className={cn("absolute", active ? "z-20" : "z-10")}
      style={{ left: `${x}%`, top: `${y}%` }}
      // Walk-on: each player rises off their disc in turn.
      initial={reduce ? false : { opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay: reduce ? 0 : index * 0.12, ease: [0.22, 0.7, 0.25, 1] }}
      onPointerEnter={(e) => e.pointerType === "mouse" && onHover(person.slug)}
      onPointerLeave={(e) => e.pointerType === "mouse" && onHover(null)}
    >
      {/* Others dim while one player is hovered. */}
      <div className={cn("absolute left-0 top-0 transition-opacity duration-200", dimmed && "opacity-45")}>
        {/* Anchor: the disc's centre is the spot; the figure stands on it, the name sits below. */}
        <div className="relative -translate-x-1/2 -translate-y-full">
          <button
            type="button"
            data-cursor="view"
            onPointerDown={(e) => (pointer.current = e.pointerType)}
            onFocus={() => onHover(person.slug)}
            onBlur={() => onHover(null)}
            onClick={(e) => {
              // Touch: the first tap shows the role card; a second opens the profile.
              if (pointer.current !== "mouse" && !active) return onSelect(person.slug);
              open(person, [], e.currentTarget);
            }}
            aria-label={`${person.name}, ${label ?? "Executive"}. Open profile`}
            className={cn("group relative block transition-transform duration-300 ease-out", FIGURE[size], active && "-translate-y-2 scale-[1.06]")}
          >
            <span className="relative block aspect-[4/5]">
              <Cutout person={person} boxRatio={4 / 5} fill={0.98} sizes="160px" priority={size !== "spine"} alt="" />
            </span>
            {size === "captain" && (
              <span
                aria-hidden
                title="Captain"
                className="absolute right-1 top-[38%] flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#3fcfca] bg-[#0b2524] text-[13px] font-bold text-[#3fcfca]"
              >
                C
              </span>
            )}
          </button>
        </div>
        {/* Position disc */}
        <span
          aria-hidden
          className={cn(
            "absolute left-0 top-0 h-3 -translate-x-1/2 -translate-y-1/2 rounded-[50%] transition-colors",
            size === "captain" ? "w-24 md:w-28" : "w-16 md:w-20",
            active ? "bg-[#3fcfca]/70" : "bg-[#f5f1e8]/15",
          )}
        />
        <div className={cn("absolute left-0 top-3 -translate-x-1/2 text-center md:w-[190px]", size === "spine" ? "w-[108px]" : "w-[160px]")}>
          <p className={cn(ANTON, size === "spine" ? "text-[13px]" : "text-[16px]", "!leading-[1.05] text-[#f5f1e8] md:text-[22px]")}>{person.name}</p>
          <p className="mt-1 text-[11px] leading-snug text-[#f5f1e8]/60 md:text-[13px]">{label}</p>
        </div>
      </div>

      {/* Role card: on hover / focus (desktop) or the first tap (phones). */}
      <AnimatePresence>
        {active && (
          <div
            className={cn(
              "absolute z-30 w-[210px] md:w-[230px]",
              // Desktop: beside the figure, level with it. Phones: below the name, or above the figure on the back line.
              "md:top-[-5.5rem] md:-translate-y-1/2",
              right ? "md:right-[5.5rem]" : "md:left-[5.5rem]",
              size === "spine" ? "max-md:bottom-[8rem]" : "max-md:top-[4.5rem]",
              x < 35 ? "max-md:left-[-2.5rem]" : x > 65 ? "max-md:right-[-2.5rem]" : "max-md:left-[-105px]",
            )}
          >
            <motion.div
              initial={{ opacity: 0, x: right ? 8 : -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="rounded-lg border border-white/10 bg-[#0f302e] p-4 text-left shadow-[0_24px_48px_-24px_rgba(0,0,0,0.9)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3fcfca]">{label}</p>
              <p className="mt-1 text-[15px] font-semibold text-[#f5f1e8]">{person.name}</p>
              {person.askAbout.length > 0 && <p className="mt-2 text-[13px] leading-snug text-[#f5f1e8]/70">Ask about: {person.askAbout.join(", ")}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {person.tier === "executive" && (
                  <Link
                    href={contactHref(person)}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-[#3fcfca] px-3.5 text-[13px] font-semibold text-[#002e2c] transition hover:brightness-110"
                  >
                    Message
                    <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={(e) => open(person, [], e.currentTarget)}
                  className="inline-flex min-h-[36px] items-center rounded-full border border-white/20 px-3.5 text-[13px] font-semibold text-[#f5f1e8] transition hover:bg-white/10"
                >
                  Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Leadership as a tactics board: coach on the touchline, executives on their position discs,
// pass-lines drawn between them once the players have walked on.
export function Formation({ advisor, executives }: { advisor: PanelPerson | undefined; executives: PanelPerson[] }) {
  const reduce = Boolean(useReducedMotion());
  const board = useRef<HTMLDivElement>(null);
  const inView = useInView(board, { once: true, amount: 0.3 });
  const [hover, setHover] = useState<string | null>(null);
  const [tapped, setTapped] = useState<string | null>(null);
  // The pass-lines are drawn in real pixels (so the line-draw stays solid at any board size).
  const [box, setBox] = useState({ w: 1000, h: 760 });
  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const list = spots(advisor, executives);
  const active = hover ?? tapped;
  const centre = list.find((s) => s.size === "captain");
  const coach = list.find((s) => s.size === "coach");
  const lines = [...(coach && centre ? [{ from: coach, to: centre }] : []), ...(centre ? list.filter((s) => s.size === "spine").map((to) => ({ from: centre, to })) : [])];
  if (list.length === 0) return null;

  return (
    <section aria-labelledby="formation-heading" className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <h2 id="formation-heading" className={cn(ANTON, "text-[36px] !leading-none text-[#f5f1e8] md:text-[48px]")}>
          The formation
        </h2>
        <p className="hidden text-[14px] text-[#f5f1e8]/55 md:block">Hover a player for their role. Click for the profile.</p>
      </div>
      <div ref={board} onClick={(e) => e.target === e.currentTarget && setTapped(null)} className="relative mt-6 h-[640px] overflow-hidden rounded-xl border border-white/10 bg-[#071a19] md:h-[760px]">
        <PitchLines />
        <p className="absolute left-1/2 top-[3.5%] -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f5f1e8]/35">Touchline · Coach</p>
        <svg aria-hidden viewBox={`0 0 ${box.w} ${box.h}`} className="pointer-events-none absolute inset-0 h-full w-full">
          {lines.map(({ from, to }, i) => {
            const lit = active && (active === from.person.slug || active === to.person.slug);
            return (
              <motion.line
                key={`${from.person.slug}-${to.person.slug}`}
                x1={(from.x / 100) * box.w}
                y1={(from.y / 100) * box.h}
                x2={(to.x / 100) * box.w}
                y2={(to.y / 100) * box.h}
                stroke="#3fcfca"
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : undefined}
                transition={{ duration: 0.7, delay: reduce ? 0 : 0.6 + list.length * 0.12 + i * 0.12, ease: "easeInOut" }}
                style={{
                  strokeWidth: lit ? 2.5 : 1.25,
                  strokeOpacity: active && !lit ? 0.2 : lit ? 1 : 0.55,
                  filter: lit ? "drop-shadow(0 0 4px #3fcfca)" : undefined,
                  transition: "stroke-opacity 200ms, stroke-width 200ms",
                }}
              />
            );
          })}
        </svg>
        {list.map((spot, i) => (
          <Player
            key={spot.person.slug}
            spot={spot}
            index={i}
            inView={inView || reduce}
            active={active === spot.person.slug}
            dimmed={Boolean(active) && active !== spot.person.slug}
            onHover={setHover}
            onSelect={setTapped}
          />
        ))}
      </div>
    </section>
  );
}
