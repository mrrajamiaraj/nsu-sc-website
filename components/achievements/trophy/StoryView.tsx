"use client";

import Image from "next/image";
import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Link2 } from "lucide-react";
import { Dialog } from "@/components/contact/interaction/Dialog";
import { useCopy } from "@/components/contact/interaction/hooks";
import { BLUR, ResultTag, SportLabel, entryHref } from "@/components/achievements/trophy/shared";
import type { TrophyEntry } from "@/lib/trophy";
import { cn } from "@/lib/utils";

function Gallery({ entry }: { entry: TrophyEntry }) {
  const [index, setIndex] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const photos = entry.photos;
  useEffect(() => setIndex(0), [entry.id]);

  const go = (step: number) => photos.length > 1 && setIndex((i) => (i + step + photos.length) % photos.length);

  // Arrow keys move through the photos while the story is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (photos.length === 0) return <div className="aspect-[4/3] rounded-lg bg-[#0f302e]" />;
  return (
    <div>
      <div
        data-cursor="view"
        className="relative aspect-[4/3] touch-pan-y overflow-hidden rounded-lg bg-[#082120]"
        onPointerDown={(e: ReactPointerEvent) => setStart(e.clientX)}
        onPointerUp={(e: ReactPointerEvent) => {
          if (start !== null && Math.abs(e.clientX - start) > 50) go(e.clientX < start ? 1 : -1);
          setStart(null);
        }}
      >
        <motion.div layoutId={`trophy-photo-${entry.id}`} className="absolute inset-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={index} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="absolute inset-0">
              <Image src={photos[index]} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" placeholder="blur" blurDataURL={BLUR} className="object-contain" />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      {photos.length > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:-translate-y-0.5 hover:bg-white/10">
            <ArrowLeft aria-hidden className="h-4 w-4" />
          </button>
          <span className="text-[14px] tabular-nums text-[#f5f1e8]/60" aria-live="polite">
            {index + 1} / {photos.length}
          </span>
          <button type="button" onClick={() => go(1)} aria-label="Next photo" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:-translate-y-0.5 hover:bg-white/10">
            <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

const initials = (name: string) =>
  name
    .replace(/[^A-Za-z0-9' ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// Full-screen story for one achievement: gallery, record line, the club's write-up,
// people involved, share, and previous/next.
export function StoryView({
  entry,
  prev,
  next,
  onClose,
  onGo,
}: {
  entry: TrophyEntry | null;
  prev: TrophyEntry | null;
  next: TrophyEntry | null;
  onClose: () => void;
  onGo: (id: string) => void;
}) {
  const { copied, copy } = useCopy();
  return (
    <Dialog open={Boolean(entry)} onClose={onClose} labelledBy="story-title" variant="sheet">
      {entry && (
        <div className="mx-auto grid max-w-[1280px] gap-8 px-5 pb-12 pt-4 md:px-8 lg:grid-cols-2 lg:gap-12">
          <Gallery entry={entry} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <ResultTag type={entry.type} />
              <SportLabel sport={entry.sport} />
              {entry.year && <span className="text-[14px] font-semibold text-[#f5f1e8]/70">{entry.year}</span>}
            </div>
            <h2 id="story-title" className="mt-4 pr-12 text-[36px] !font-extrabold uppercase leading-[0.95] text-[#f5f1e8] md:text-[48px]">
              {entry.title}
            </h2>
            {entry.competition && <p className="mt-2 text-[15px] text-[#f5f1e8]/60">{entry.competition}</p>}
            <p className="mt-5 max-w-[640px] text-[18px] font-medium leading-relaxed text-[#f5f1e8]">{entry.summary}</p>
            <div className="mt-4 max-w-[640px] space-y-3 text-[17px] leading-relaxed text-[#f5f1e8]/75">
              {entry.story.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {entry.people.length > 0 && (
              <div className="mt-6">
                <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/50">People involved</p>
                <ul className="mt-2 flex flex-wrap gap-3">
                  {entry.people.map((name) => (
                    <li key={name} className="flex items-center gap-2">
                      <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004b49] text-[13px] font-bold text-[#f5f1e8]">
                        {initials(name)}
                      </span>
                      <span className="text-[15px] text-[#f5f1e8]">{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={() => copy(`${window.location.origin}${entryHref(entry)}`)}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline"
              >
                {copied ? <Check aria-hidden className="h-4 w-4" /> : <Link2 aria-hidden className="h-4 w-4" />}
                {copied ? "Link copied" : "Share"}
              </button>
              <span className="flex-1" />
              <button
                type="button"
                disabled={!prev}
                onClick={() => prev && onGo(prev.id)}
                className={cn("inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/20 px-4 text-[14px] font-semibold transition hover:-translate-y-0.5 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-35")}
              >
                <ArrowLeft aria-hidden className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                disabled={!next}
                onClick={() => next && onGo(next.id)}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/20 px-4 text-[14px] font-semibold transition hover:-translate-y-0.5 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-35"
              >
                Next
                <ArrowRight aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
