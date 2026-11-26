"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, Trophy } from "lucide-react";
import { PosterImage } from "@/components/events/PosterImage";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 4000;
const MAX_DOTS = 10; // past this the dots get cramped; the "2 / 6" counter covers it

// Arrows show on hover/focus with a mouse, and always on touch screens (no hover there).
const arrowClasses =
  "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-night-900/60 text-white backdrop-blur-md transition-opacity duration-200 hover:bg-night-900/80 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100";

export function EventGallerySlider({
  images,
  alt,
  captions,
  thumbnails = false,
}: {
  images: string[];
  alt: string;
  captions?: Record<string, string>;
  thumbnails?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const reduceMotion = useReducedMotion();
  const strip = useRef<HTMLDivElement>(null);
  const hasMultiple = images.length > 1;
  const autoplay = hasMultiple && !reduceMotion;

  // Auto-advance only when nobody is looking at or tabbed into the slider, never
  // after the visitor pressed pause, and never for visitors who asked for reduced motion.
  useEffect(() => {
    if (!autoplay || paused || stopped) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [autoplay, paused, stopped, images.length]);

  // Keep the active thumbnail in view without scrolling the page.
  useEffect(() => {
    const el = strip.current?.children[index] as HTMLElement | undefined;
    if (el && strip.current) {
      strip.current.scrollTo({ left: el.offsetLeft - strip.current.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
    }
  }, [index]);

  if (images.length === 0) {
    return (
      <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-3xl bg-brand-gradient sm:aspect-[21/9]">
        <Trophy className="h-14 w-14 text-night-950/40" strokeWidth={1.5} />
      </div>
    );
  }

  const go = (delta: number) => setIndex((current) => (current + delta + images.length) % images.length);
  const caption = captions?.[images[index]];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={`${alt} photos`}
        tabIndex={hasMultiple ? 0 : undefined}
        onKeyDown={(event) => {
          if (!hasMultiple) return;
          if (event.key === "ArrowLeft") go(-1);
          if (event.key === "ArrowRight") go(1);
        }}
        className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-night-950/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 sm:aspect-[16/9]"
      >
        {/* Photos and posters come in mixed shapes, so each is shown whole. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <PosterImage
              src={images[index]}
              alt={caption ?? `${alt}, photo ${index + 1} of ${images.length}`}
              sizes="(min-width: 1024px) 1024px, 100vw"
              priority={index === 0}
            />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-950/70 via-transparent to-transparent" />

        {caption && (
          <p className="pointer-events-none absolute bottom-4 left-4 right-24 line-clamp-2 text-sm font-medium text-white">
            {caption}
          </p>
        )}

        {hasMultiple && (
          <>
            <button type="button" aria-label="Previous photo" onClick={() => go(-1)} className={cn(arrowClasses, "left-4")}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Next photo" onClick={() => go(1)} className={cn(arrowClasses, "right-4")}>
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Always visible, so touch visitors (who can't hover to pause) can stop the slideshow. */}
            {autoplay && (
              <button
                type="button"
                onClick={() => setStopped((value) => !value)}
                aria-label={stopped ? "Play slideshow" : "Pause slideshow"}
                className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-night-900/60 text-white backdrop-blur-md transition-colors hover:bg-night-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
              >
                {stopped ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
            )}

            <p
              aria-live={paused ? "polite" : "off"}
              className={cn(
                "absolute rounded-full bg-night-900/60 px-3 py-1 font-mono text-xs text-white backdrop-blur-md",
                thumbnails ? "bottom-4 right-4" : "right-4 top-4",
              )}
            >
              {index + 1} / {images.length}
            </p>

            {!thumbnails && images.length <= MAX_DOTS && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                {images.map((image, dotIndex) => (
                  <button
                    key={image + dotIndex}
                    type="button"
                    aria-label={`Go to photo ${dotIndex + 1}`}
                    aria-current={dotIndex === index}
                    onClick={() => setIndex(dotIndex)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      dotIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60",
                    )}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {thumbnails && hasMultiple && (
        <div ref={strip} className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, thumbIndex) => (
            <button
              key={image + thumbIndex}
              type="button"
              aria-label={`Show photo ${thumbIndex + 1}`}
              aria-current={thumbIndex === index}
              onClick={() => setIndex(thumbIndex)}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-16 sm:w-24",
                thumbIndex === index ? "border-blue-400" : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <Image src={image} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
