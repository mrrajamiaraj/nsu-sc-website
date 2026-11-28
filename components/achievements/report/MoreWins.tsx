"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { ANTON, AchievementLink } from "@/components/achievements/report/shared";
import { BLUR, ResultTag } from "@/components/achievements/trophy/shared";
import type { ReportData, ReportLink } from "@/lib/report";
import { cn } from "@/lib/utils";

// Related wins as a draggable row: mouse drag or touch swipe scrolls it, arrows step it.
function RelatedRow({ items }: { items: ReportLink[] }) {
  const track = useRef<HTMLUListElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };
  useEffect(update, [items]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 300) + 16), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const onDown = (e: ReactPointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  };
  const onMove = (e: ReactPointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5 && !d.moved) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.style.scrollSnapType = "none";
    }
    if (d.moved) e.currentTarget.scrollLeft = d.left - dx;
  };
  const onUp = (e: ReactPointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    e.currentTarget.style.scrollSnapType = "";
    // A drag isn't a click on the card underneath.
    if (d?.moved) window.addEventListener("click", (c) => c.preventDefault(), { capture: true, once: true });
    drag.current = null;
  };

  const arrow = "flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40";

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <button type="button" onClick={() => step(-1)} disabled={edges.start} aria-label="Scroll back" className={arrow}>
          <ArrowLeft aria-hidden className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => step(1)} disabled={edges.end} aria-label="Scroll on" className={arrow}>
          <ArrowRight aria-hidden className="h-4 w-4" />
        </button>
      </div>
      <ul
        ref={track}
        data-cursor="drag"
        onScroll={update}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0"
      >
        {items.map((item) => (
          <li key={item.id} className="w-[84%] shrink-0 snap-start sm:w-[340px]">
            <AchievementLink
              to={item}
              draggable={false}
              className="group flex items-center gap-4 border-t border-white/10 py-4 pr-2 transition-transform duration-200 hover:translate-x-1.5"
            >
              <span className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-md bg-[#0f302e]">
                {item.photo && (
                  <>
                    <Image src={item.photo} alt="" fill sizes="84px" loading="lazy" placeholder="blur" blurDataURL={BLUR} draggable={false} className="object-cover grayscale transition duration-300 group-hover:grayscale-0 group-focus-visible:grayscale-0" />
                    {/* Duotone at rest: teal over the grey image; it clears to colour on hover. */}
                    <span aria-hidden className="absolute inset-0 bg-[#0b2524] mix-blend-color transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0" />
                  </>
                )}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <ResultTag type={item.type} />
                  {item.year && <span className="text-[13px] text-[#f5f1e8]/55">{item.year}</span>}
                </span>
                <span className="mt-2 line-clamp-2 block text-[15px] font-semibold leading-snug text-[#f5f1e8]">{item.title}</span>
              </span>
            </AchievementLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Big previous / next halves. The hovered half widens a little and shows its photo.
function StepCards({ prev, next }: { prev: ReportLink | null; next: ReportLink | null }) {
  const [hot, setHot] = useState<"prev" | "next" | null>(null);
  const half = (to: ReportLink | null, dir: "prev" | "next") => {
    const grow = hot === dir ? "md:flex-[1.25]" : hot ? "md:flex-[0.75]" : "md:flex-1";
    if (!to) return <div aria-hidden className={cn("hidden min-h-[160px] flex-1 border-white/10 transition-[flex] duration-300 md:block", grow, dir === "prev" ? "md:border-r" : "")} />;
    return (
      <AchievementLink
        to={to}
        onPointerEnter={() => setHot(dir)}
        onPointerLeave={() => setHot(null)}
        onFocus={() => setHot(dir)}
        onBlur={() => setHot(null)}
        className={cn(
          "group relative flex min-h-[160px] flex-1 flex-col justify-end overflow-hidden px-6 py-7 transition-[flex] duration-300 md:min-h-[200px] md:px-8",
          grow,
          dir === "prev" ? "border-b border-white/10 md:border-b-0 md:border-r" : "items-end text-right",
        )}
      >
        {to.photo && (
          <Image src={to.photo} alt="" fill sizes="50vw" loading="lazy" className="object-cover opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-30 group-focus-visible:opacity-30" />
        )}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0b2524] via-[#0b2524]/60 to-transparent" />
        <span className="relative text-[12px] font-semibold uppercase tracking-[0.16em] text-[#3fcfca]">
          {dir === "prev" ? "← Previous" : "Next →"}
          {to.year ? ` · ${to.year}` : ""}
        </span>
        <span className={cn(ANTON, "relative mt-2 line-clamp-2 max-w-[460px] text-[24px] leading-[1.05] text-[#f5f1e8] md:text-[28px]")}>{to.title}</span>
      </AchievementLink>
    );
  };
  if (!prev && !next) return null;
  return (
    <nav aria-label="Previous and next achievement" className="mt-16 flex flex-col border-y border-white/10 md:flex-row">
      {half(prev, "prev")}
      {half(next, "next")}
    </nav>
  );
}

export function MoreWins({ data }: { data: ReportData }) {
  return (
    <>
      {data.related.length > 0 && (
        <section aria-labelledby="more-heading" className="mt-24">
          <div className="flex items-end justify-between gap-4">
            <h2 id="more-heading" className={cn(ANTON, "text-[36px] leading-none text-[#f5f1e8] md:text-[40px]")}>
              More wins
            </h2>
            <Link href="/achievements" className="report-link mb-1 shrink-0 text-[15px] font-semibold text-[#3fcfca]">
              See all →
            </Link>
          </div>
          <div className="mt-2">
            <RelatedRow items={data.related} />
          </div>
        </section>
      )}
      <StepCards prev={data.prev} next={data.next} />
    </>
  );
}

// "Want your name here?" with a trials link for the achievement's sport.
export function CtaStrip({ cta }: { cta: ReportData["cta"] }) {
  return (
    <section aria-labelledby="cta-heading" className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-white/10 py-14 md:flex-row md:items-center">
      <h2 id="cta-heading" className={cn(ANTON, "text-[40px] leading-[0.95] text-[#f5f1e8] md:text-[48px]")}>
        Want your name here?
      </h2>
      <Magnetic>
        <Link
          href={cta.href}
          data-haptic
          className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-[#3fcfca] px-7 text-[16px] font-semibold text-[#002e2c] transition hover:brightness-110"
        >
          {cta.label}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </Magnetic>
    </section>
  );
}
