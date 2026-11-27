"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SportIcon } from "@/components/home/SportIcon";
import type { SportCard } from "@/lib/home";

function squadLine(card: SportCard) {
  const names = card.squads.map((squad) => squad.label);
  const squads = names.length === 2 ? `${names[0]} & ${names[1]} squads` : `${names.join(", ")} squad`;
  return card.athletes > 0 ? `${squads} · ${card.athletes} athletes` : `${squads} · roster coming soon`;
}

// Horizontal row of tall cards, one per sport. Swipe on phones (the next card peeks in),
// arrow buttons on wider screens. Each card opens that sport's largest squad.
// Dark band one step lighter than the hero (#0b2524); the only accent is the hero's teal.
const GAP = 16;

export function SquadsCarousel({ sports, squadCount }: { sports: SportCard[]; squadCount: number }) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  // Grey out an arrow when the track can't move further that way.
  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // One click moves exactly one card plus the 16px gap.
  const scroll = (direction: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector("li");
    if (el && card) el.scrollBy({ left: direction * (card.getBoundingClientRect().width + GAP), behavior: "smooth" });
  };
  if (sports.length === 0) return null;

  return (
    <section aria-labelledby="squads-heading" className="bg-[#0f302e] py-20 text-white">
      {/* Heading and track share one container, so both margins match the heading's edges. */}
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#3fcfca]/80">{squadCount} squads · one club</p>
            <h2 id="squads-heading" className="mt-2 text-5xl !font-extrabold uppercase leading-none text-white sm:text-[64px]">
              Our squads
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/teams" className="text-sm font-semibold text-[#3fcfca] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none">
              All squads
            </Link>
            <div className="hidden gap-2 sm:flex">
              {([-1, 1] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  onClick={() => scroll(direction)}
                  disabled={direction === -1 ? edges.start : edges.end}
                  aria-label={direction === -1 ? "Previous squads" : "Next squads"}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fcfca] disabled:pointer-events-none disabled:opacity-40"
                >
                  {direction === -1 ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The track scrolls (and clips) inside the container. Its 3px of padding, offset by a
            -3px margin, only leaves room for the hover ring; card edges still line up with the heading. */}
        <ul
          ref={track}
          className="no-scrollbar -mx-[3px] flex snap-x snap-mandatory scroll-smooth gap-4 overflow-x-auto px-[3px] pb-2 pt-[3px] [scroll-padding-inline:3px]"
        >
          {sports.map((card) => (
            <li key={card.sport} className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-32px)/3)] xl:w-[calc((100%-48px)/4)]">
              <Link
                href={card.href}
                className="group relative block aspect-[3/4] overflow-hidden rounded-xl bg-[#123a38] ring-1 ring-white/10 transition hover:ring-[3px] hover:ring-[#3fcfca] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#3fcfca]"
              >
                {card.photo ? (
                  <Image
                    src={card.photo}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 300px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  // No squad photo yet: a slightly lighter panel with the sport's outline mark, faint white.
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center bg-[#123a38] pb-16">
                    <SportIcon sport={card.sport} strokeWidth={1} className="h-1/2 w-1/2 text-white opacity-15" />
                  </span>
                )}
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(11_37_36/0.95)_0%,transparent_50%)]" />
                <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
                  <span className="font-display text-4xl font-extrabold uppercase leading-none text-white">{card.sport}</span>
                  <span className="truncate text-sm text-slate-300">{squadLine(card)}</span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                    View team
                    <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
