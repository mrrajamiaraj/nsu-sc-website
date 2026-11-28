"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Trophy } from "lucide-react";
import { RoundPortrait, askForUpdate } from "@/components/alumni/relay/shared";
import { Cutout, initials } from "@/components/teams/announcement/Cutout";
import { EASE } from "@/components/teams/squad-select/shared";
import type { RelayPanel, RelayPerson } from "@/lib/alumni-relay";
import { cn } from "@/lib/utils";

export type OpenPerson = (person: RelayPerson, from: "lineup" | "grid" | "list" | "strip", el: HTMLElement | null) => void;

// "Now: …" card over a hovered person, or an invitation to fill it in.
function NowCard({ person }: { person: RelayPerson }) {
  return (
    <span className="block w-max max-w-[17rem] rounded-lg border border-white/15 bg-[#082120] px-3 py-2 text-left text-[13px] leading-snug shadow-[0_14px_28px_-12px_rgba(0,0,0,0.8)]">
      {person.now ? (
        <>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3fcfca]">Now</span>
          <span className="block text-[#f5f1e8]">{person.now}</span>
        </>
      ) : (
        <span className="block text-[#f5f1e8]/75">
          Where are they now? <span className="font-semibold text-[#3fcfca]">Help us update →</span>
        </span>
      )}
    </span>
  );
}

// ---- Desktop: one overlapping line-up on a spotlit stage, president centre and larger.

function LineUp({ people, onOpen }: { people: RelayPerson[]; onOpen: OpenPerson }) {
  const reduce = Boolean(useReducedMotion());
  const [active, setActive] = useState<number | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = people.length;
  const centre = Math.floor((n - 1) / 2);
  const vars = { "--w": `min(190px, calc((min(100vw, 1280px) - 96px) / ${(1 + (n - 1) * 0.7 + 0.25).toFixed(2)}))` } as CSSProperties;

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    e.stopPropagation(); // ←/→ here moves along the line-up, not between panels
    const next = Math.max(0, Math.min(n - 1, (active ?? centre) + (e.key === "ArrowRight" ? 1 : -1)));
    setActive(next);
    refs.current[next]?.focus();
  };

  const width = (i: number) => (i === centre ? "calc(var(--w) * 1.25)" : "var(--w)");
  const step = (i: number) => (i === 0 ? 0 : "calc(var(--w) * -0.3)");

  return (
    <div style={vars} onPointerLeave={() => setActive(null)}>
      <div className="relative overflow-hidden rounded-xl bg-[#071a19]">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_50%_0%,rgba(245,241,232,0.10),transparent_70%)] motion-reduce:hidden" />
        <ul aria-label="Executive committee" onKeyDown={onKey} className="relative flex items-end justify-center px-8 pt-24">
          {people.map((p, i) => {
            const isActive = active === i;
            const dimmed = active !== null && !isActive;
            const distance = Math.abs(i - centre);
            return (
              <li key={p.id} className="relative shrink-0" style={{ width: width(i), marginLeft: step(i), zIndex: isActive ? 100 : 50 - distance * 2 }}>
                <motion.div
                  variants={{ in: (dir: number) => ({ opacity: 0, x: reduce ? 0 : 80 * dir }), shown: { opacity: 1, x: 0 } }}
                  transition={reduce ? { duration: 0.15 } : { duration: 0.45, ease: EASE, delay: 0.05 * i }}
                >
                  <motion.button
                    ref={(el) => {
                      refs.current[i] = el;
                    }}
                    type="button"
                    data-cursor="view"
                    tabIndex={i === centre ? 0 : -1}
                    aria-label={`${p.name}, ${p.role}`}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    onClick={(e) => onOpen(p, "lineup", e.currentTarget)}
                    animate={{
                      scale: isActive && !reduce ? 1.08 : 1,
                      y: isActive && !reduce ? -12 : 0,
                      opacity: dimmed ? 0.4 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    className="relative block aspect-[3/4] w-full origin-bottom"
                  >
                    <motion.span layoutId={`alum-${p.slug}`} className="absolute inset-0 block">
                      <Cutout person={p} boxRatio={3 / 4} fill={0.95} sizes="240px" priority />
                      {!p.photo && (
                        <span aria-hidden className="absolute inset-x-0 top-[38%] text-center font-display text-[26px] font-extrabold text-[#f5f1e8]/45">
                          {initials(p.name)}
                        </span>
                      )}
                    </motion.span>
                  </motion.button>
                </motion.div>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      aria-hidden
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18 }}
                      className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2"
                    >
                      <NowCard person={p} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
      {/* Caption row: names and roles in line-up order. */}
      <ol aria-hidden className="mt-4 flex justify-center px-8">
        {people.map((p, i) => (
          <li
            key={p.id}
            className={cn("shrink-0 px-1 text-center transition-opacity duration-200", active !== null && active !== i && "opacity-40")}
            style={{ width: i === centre ? "calc(var(--w) * 0.95)" : "calc(var(--w) * 0.7)" }}
          >
            <span className={cn("block font-display text-[17px] font-extrabold uppercase leading-[1.05] lg:text-[20px]", active === i ? "text-[#3fcfca]" : "text-[#f5f1e8]")}>{p.name}</span>
            <span className="mt-1 block text-[12px] text-[#f5f1e8]/60 lg:text-[13px]">{p.role}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---- Phones: a swipe row, president first. Tap shows the "now" card; tap again opens.

function SwipeRow({ people, onOpen }: { people: RelayPerson[]; onOpen: OpenPerson }) {
  const ranked = [...people].sort((a, b) => Number(b.role === "President") - Number(a.role === "President"));
  const [active, setActive] = useState(ranked[0]?.id ?? null);
  const current = ranked.find((p) => p.id === active);
  return (
    <div className="rounded-xl bg-[#071a19] pb-5">
      <ul aria-label="Executive committee" className="no-scrollbar flex snap-x snap-mandatory gap-1 overflow-x-auto px-[calc(50%-60px)] pt-6">
        {ranked.map((p) => (
          <li key={p.id} className="shrink-0 snap-center">
            <button
              type="button"
              aria-label={`${p.name}, ${p.role}`}
              aria-pressed={active === p.id}
              onClick={(e) => (active === p.id ? onOpen(p, "lineup", e.currentTarget) : setActive(p.id))}
              className={cn("relative block h-[160px] w-[120px] transition-opacity", active === p.id ? "opacity-100" : "opacity-55")}
            >
              <Cutout person={p} boxRatio={120 / 160} fill={0.95} sizes="160px" />
              {!p.photo && <span aria-hidden className="absolute inset-x-0 top-[38%] text-center font-display text-[22px] font-extrabold text-[#f5f1e8]/45">{initials(p.name)}</span>}
            </button>
          </li>
        ))}
      </ul>
      {current && (
        <div className="mt-3 flex flex-col items-center gap-2 px-4 text-center" aria-live="polite">
          <span className="font-display text-[22px] font-extrabold uppercase leading-none text-[#f5f1e8]">{current.name}</span>
          <span className="text-[13px] text-[#f5f1e8]/60">{current.role} · tap again for the profile</span>
          <NowCard person={current} />
        </div>
      )}
    </div>
  );
}

// ---- Sub-executives: round duotone portraits, colour on hover.

function SubGrid({ people, onOpen }: { people: RelayPerson[]; onOpen: OpenPerson }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <ul className="grid grid-cols-4 gap-x-3 gap-y-6 sm:grid-cols-6 lg:grid-cols-8">
      {people.map((p, i) => {
        const on = hover === p.id;
        return (
          <motion.li key={p.id} variants={{ in: { opacity: 0, y: 10 }, shown: { opacity: 1, y: 0 } }} transition={{ duration: 0.3, delay: 0.2 + Math.min(i, 16) * 0.02 }}>
            <button
              type="button"
              data-cursor="view"
              aria-label={`${p.name}, ${p.role}`}
              onPointerEnter={() => setHover(p.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(p.id)}
              onBlur={() => setHover(null)}
              onClick={(e) => onOpen(p, "grid", e.currentTarget)}
              className="group flex w-full flex-col items-center text-center"
            >
              <motion.span layoutId={`alum-${p.slug}`} className="block transition-transform duration-200 group-hover:-translate-y-1">
                <RoundPortrait person={p} size={72} colour={on} className={cn("ring-2 transition-[box-shadow]", on ? "ring-[#3fcfca]" : "ring-transparent")} />
              </motion.span>
              <span className={cn("mt-2 block text-[14px] font-medium leading-snug", on ? "text-[#3fcfca]" : "text-[#f5f1e8]/85")}>{p.name}</span>
              <span className={cn("block text-[12px] text-[#f5f1e8]/55 transition-opacity", on ? "opacity-100" : "opacity-0")}>{p.role}</span>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}

export function PanelView({
  panel,
  newer,
  older,
  dir,
  onPanel,
  onOpen,
}: {
  panel: RelayPanel;
  newer: RelayPanel | null;
  older: RelayPanel | null;
  dir: number;
  onPanel: (slug: string) => void;
  onOpen: OpenPerson;
}) {
  const reduce = Boolean(useReducedMotion());
  const total = panel.executives.length + panel.subExecutives.length;
  // Small (older) panels stand everyone in the line-up.
  const small = total < 8;
  const lineup = small ? [...panel.executives, ...panel.subExecutives] : panel.executives;
  const grid = small ? [] : panel.subExecutives;

  return (
    <AnimatePresence mode="wait" custom={dir} initial={false}>
      <motion.section
        key={panel.slug}
        custom={dir}
        aria-labelledby="panel-heading"
        initial="in"
        animate="shown"
        exit={reduce ? { opacity: 0, transition: { duration: 0.15 } } : { opacity: 0, x: -60 * dir, transition: { duration: 0.25 } }}
        className="mx-auto max-w-[1280px] px-4 pt-12 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <h2 id="panel-heading" className="text-[44px] !font-extrabold leading-none text-[#f5f1e8] md:text-[64px]">
              Panel {panel.label}
            </h2>
            <p className="mt-3 text-[15px] text-[#f5f1e8]/65">
              {total} members · {panel.executives.length} executive{panel.subExecutives.length > 0 && ` · ${panel.subExecutives.length} sub-executive`}
            </p>
          </div>
          {panel.wins.length > 0 && (
            <ul className="flex max-w-xl flex-wrap justify-end gap-x-4 gap-y-1 text-[14px]">
              <li className="text-[#f5f1e8]/50">During this term:</li>
              {panel.wins.map((w) => (
                <li key={w.id}>
                  <Link href={w.href} className="inline-flex items-center gap-1.5 font-medium text-[#f5f1e8] underline decoration-[#3fcfca]/40 underline-offset-4 hover:text-[#3fcfca]">
                    <Trophy aria-hidden className="h-3.5 w-3.5 text-[#3fcfca]" />
                    {w.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8">
          <div className="hidden md:block">
            <LineUp people={lineup} onOpen={onOpen} />
          </div>
          <div className="md:hidden">
            <SwipeRow people={lineup} onOpen={onOpen} />
          </div>
        </div>

        {grid.length > 0 && (
          <div className="mt-14">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">Sub-executive committee</h3>
            <div className="mt-6">
              <SubGrid people={grid} onOpen={onOpen} />
            </div>
          </div>
        )}

        {/* The handover: links move the baton along the relay. */}
        <nav aria-label="Neighbouring panels" className="mt-14 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-6">
          {older ? (
            <button type="button" onClick={() => onPanel(older.slug)} className="group inline-flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-[#f5f1e8]/80 hover:text-[#3fcfca]">
              <ArrowLeft aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Took over from Panel {older.label}
            </button>
          ) : (
            <span />
          )}
          {newer && (
            <button type="button" onClick={() => onPanel(newer.slug)} className="group inline-flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-[#f5f1e8]/80 hover:text-[#3fcfca]">
              Handed over to Panel {newer.label}
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </nav>
        <p className="mt-2 text-[13px] text-[#f5f1e8]/45">
          On this panel and something&rsquo;s wrong?{" "}
          <button type="button" onClick={() => askForUpdate({ name: "", role: "", panel: panel.slug })} className="font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
            Tell us
          </button>
        </p>
      </motion.section>
    </AnimatePresence>
  );
}
