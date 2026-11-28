"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Baton, RoundPortrait } from "@/components/alumni/relay/shared";
import type { RelayPanel } from "@/lib/alumni-relay";
import { cn } from "@/lib/utils";

const count = (p: RelayPanel) => p.executives.length + p.subExecutives.length;

// The relay track: founding year on the left, each panel a segment as wide as its term, the
// baton on the selected one. Click a segment, drag the baton, or use ←/→. "All" switches to
// the directory. Sticky under the site header while browsing.
export function EraScrubber({
  panels,
  founded,
  active,
  view,
  onPanel,
  onAll,
}: {
  panels: RelayPanel[]; // newest first
  founded: number;
  active: string;
  view: "panel" | "all";
  onPanel: (slug: string) => void;
  onAll: () => void;
}) {
  const reduce = Boolean(useReducedMotion());
  const ordered = [...panels].reverse(); // oldest → newest, left → right
  const track = useRef<HTMLDivElement>(null);
  const segs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [hover, setHover] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const index = ordered.findIndex((p) => p.slug === active);

  // Phones: keep the active segment in the middle of the scrolling track.
  useEffect(() => {
    segs.current[active]?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
  }, [active, reduce]);

  const nearest = (clientX: number) => {
    let best = active;
    let bestD = Infinity;
    for (const p of ordered) {
      const el = segs.current[p.slug];
      if (!el) continue;
      const box = el.getBoundingClientRect();
      const d = Math.abs(clientX - (box.left + box.width / 2));
      if (d < bestD) {
        bestD = d;
        best = p.slug;
      }
    }
    return best;
  };

  // Dragging starts after a few pixels, so a plain click still lands on its segment.
  const press = useRef<{ x: number; id: number } | null>(null);
  const onDown = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return; // touch scrolls the track
    press.current = { x: e.clientX, id: e.pointerId };
  };
  const onMove = (e: ReactPointerEvent) => {
    const start = press.current;
    if (!start) return;
    if (!dragging) {
      if (Math.abs(e.clientX - start.x) < 6) return;
      setDragging(true);
      setHover(null);
      (e.currentTarget as HTMLElement).setPointerCapture(start.id);
    }
    const next = nearest(e.clientX);
    if (next !== active) onPanel(next);
  };
  const onUp = () => {
    press.current = null;
    setDragging(false);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = Math.max(0, Math.min(ordered.length - 1, index + (e.key === "ArrowRight" ? 1 : -1)));
    onPanel(ordered[i].slug);
    segs.current[ordered[i].slug]?.focus();
  };

  return (
    <div className="sticky top-[84px] z-30 border-y border-white/10 bg-[#0b2524]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-stretch gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-pressed={view === "all"}
          onClick={onAll}
          className={cn(
            "relative shrink-0 self-center rounded-full border px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.14em]",
            view === "all" ? "border-[#3fcfca] text-[#3fcfca]" : "border-white/20 text-[#f5f1e8]/70 hover:border-white/45 hover:text-[#f5f1e8]",
          )}
        >
          All
        </button>

        <div
          ref={track}
          data-cursor="drag"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className={cn("no-scrollbar relative flex min-w-0 flex-1 snap-x items-stretch overflow-x-auto md:overflow-visible", dragging && "cursor-grabbing select-none")}
        >
          {/* Before the records: the founding year, compressed. */}
          <div className="flex shrink-0 flex-col justify-end pb-3 pr-3 pt-4 md:w-[9%]">
            <span className="text-[12px] font-semibold tabular-nums text-[#f5f1e8]/45">{founded}</span>
            <span aria-hidden className="mt-2 block h-[3px] w-16 border-t-2 border-dashed border-white/20 md:w-full" />
          </div>

          <div role="radiogroup" aria-label="Panel" onKeyDown={onKey} className="flex min-w-max flex-1 md:min-w-0">
            {ordered.map((p) => {
              const selected = view === "panel" && p.slug === active;
              return (
                <button
                  key={p.slug}
                  ref={(el) => {
                    segs.current[p.slug] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`Panel ${p.label}, ${count(p)} members`}
                  tabIndex={p.slug === active ? 0 : -1}
                  onClick={() => onPanel(p.slug)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && !dragging && setHover(p.slug)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(p.slug)}
                  onBlur={() => setHover(null)}
                  style={{ flexGrow: Math.max(1, p.end - p.start) }}
                  className="group relative min-w-[88px] snap-center basis-0 px-1 pb-3 pt-4 text-left md:min-w-0"
                >
                  <span className={cn("block whitespace-nowrap text-[13px] font-semibold tabular-nums transition-colors", selected ? "text-[#3fcfca]" : "text-[#f5f1e8]/70 group-hover:text-[#f5f1e8]")}>
                    {p.label} <span className="font-normal opacity-60">· {count(p)}</span>
                  </span>
                  {/* The running-track lane for this leg. */}
                  <span aria-hidden className={cn("mt-2 block h-[3px] rounded-full transition-colors", selected ? "bg-[#3fcfca]" : "bg-white/20 group-hover:bg-white/40")} />
                  {selected && (
                    <motion.span
                      layoutId="relay-baton"
                      aria-hidden
                      className="absolute bottom-[3px] left-1/2 -ml-3.5 block h-7 w-7"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 26 }}
                    >
                      <Baton className="h-7 w-7 drop-shadow-[0_2px_6px_rgba(63,207,202,0.45)]" />
                    </motion.span>
                  )}
                  <AnimatePresence>
                    {hover === p.slug && p.president && (
                      <motion.span
                        role="tooltip"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="pointer-events-none absolute left-1/2 top-full z-40 mt-1 hidden w-max -translate-x-1/2 items-center gap-3 rounded-lg border border-white/15 bg-[#082120] px-3 py-2 shadow-[0_14px_28px_-12px_rgba(0,0,0,0.8)] md:flex"
                      >
                        <RoundPortrait person={p.president} size={40} colour />
                        <span className="text-left">
                          <span className="block text-[13px] font-semibold text-[#f5f1e8]">President: {p.president.name}</span>
                          <span className="block text-[12px] text-[#f5f1e8]/60">{count(p)} members</span>
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
