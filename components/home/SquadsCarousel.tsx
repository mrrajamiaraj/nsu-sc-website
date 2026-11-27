"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { SportCard } from "@/lib/home";

function squadLine(card: SportCard) {
  const names = card.squads.map((squad) => squad.label);
  const squads = names.length === 2 ? `${names[0]} & ${names[1]} squads` : `${names.join(", ")} squad`;
  return card.athletes > 0 ? `${squads} · ${card.athletes} athletes` : `${squads} · roster coming soon`;
}

// Horizontal row of tall cards, one per sport. Swipe on phones (the next card peeks in),
// arrow buttons on wider screens. Each card opens that sport's largest squad.
export function SquadsCarousel({ sports, squadCount }: { sports: SportCard[]; squadCount: number }) {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (direction: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: direction * Math.min(el.clientWidth * 0.8, 640), behavior: "smooth" });
  };
  if (sports.length === 0) return null;

  return (
    <section aria-labelledby="squads-heading" className="bg-[#f5f1e8] py-20 text-[#0b2524] sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#006663]">{squadCount} squads</p>
            <h2 id="squads-heading" className="mt-2 text-5xl !font-extrabold text-[#0b2524] sm:text-6xl">
              Our squads
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/teams" className="text-sm font-semibold text-[#006663] underline-offset-4 hover:underline">
              All squads
            </Link>
            <div className="hidden gap-2 sm:flex">
              {([-1, 1] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  onClick={() => scroll(direction)}
                  aria-label={direction === -1 ? "Previous squads" : "Next squads"}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0b2524]/25 text-[#0b2524] transition hover:border-[#0b2524] hover:bg-[#0b2524]/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04807c]"
                >
                  {direction === -1 ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ul
        ref={track}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [padding-inline:max(1rem,calc((100%-72rem)/2+1rem))] [scroll-padding-inline:max(1rem,calc((100%-72rem)/2+1rem))]"
      >
        {sports.map((card) => (
          <li key={card.sport} className="w-[72vw] max-w-[300px] shrink-0 snap-start sm:w-[300px]">
            <Link
              href={card.href}
              className="group relative block aspect-[3/4] overflow-hidden rounded-xl bg-[#0f302e] ring-1 ring-black/10 transition hover:ring-[3px] hover:ring-[#04a49f] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#04807c]"
            >
              {card.photo ? (
                <Image
                  src={card.photo}
                  alt=""
                  fill
                  sizes="300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                // No squad photo yet: a neutral panel with a faint grey crest, so no second colour creeps in.
                <span aria-hidden className="absolute inset-0 flex items-center justify-center bg-[#123a38]">
                  <Image
                    src="/images/branding/nsu-sc-logo.png"
                    alt=""
                    width={160}
                    height={160}
                    className="h-2/5 w-auto opacity-25"
                  />
                </span>
              )}
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0b2524] via-[#0b2524]/40 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
                <span className="font-display text-4xl font-extrabold uppercase leading-none text-white">{card.sport}</span>
                <span className="text-sm text-slate-300">{squadLine(card)}</span>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  View team
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
