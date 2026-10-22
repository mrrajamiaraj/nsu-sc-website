"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 4000;
const MAX_DOTS = 10; // past this the dots get cramped; the "2 / 6" counter covers it

// Arrows show on hover/focus with a mouse, and always on touch screens (no hover there).
const arrowClasses =
  "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-night-900/60 text-white backdrop-blur-md transition-opacity duration-200 hover:bg-night-900/80 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100";

export function EventGallerySlider({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const hasMultiple = images.length > 1;

  // Auto-advance only when nobody is looking at or tabbed into the slider,
  // and never for visitors who asked for reduced motion.
  useEffect(() => {
    if (!hasMultiple || paused || reduceMotion) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [hasMultiple, paused, reduceMotion, images.length]);

  if (images.length === 0) {
    return (
      <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-3xl bg-brand-gradient sm:aspect-[21/9]">
        <Trophy className="h-14 w-14 text-night-950/40" strokeWidth={1.5} />
      </div>
    );
  }

  const go = (delta: number) => setIndex((current) => (current + delta + images.length) % images.length);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${alt} photos`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      onKeyDown={(event) => {
        if (!hasMultiple) return;
        if (event.key === "ArrowLeft") go(-1);
        if (event.key === "ArrowRight") go(1);
      }}
      className="group relative aspect-[16/9] w-full overflow-hidden rounded-3xl sm:aspect-[21/9]"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={images[index]}
            alt={`${alt} — photo ${index + 1} of ${images.length}`}
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            priority={index === 0}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-950/70 via-transparent to-transparent" />

      {hasMultiple && (
        <>
          <button type="button" aria-label="Previous photo" onClick={() => go(-1)} className={cn(arrowClasses, "left-4")}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Next photo" onClick={() => go(1)} className={cn(arrowClasses, "right-4")}>
            <ChevronRight className="h-5 w-5" />
          </button>

          <p
            aria-live={paused ? "polite" : "off"}
            className="absolute right-4 top-4 rounded-full bg-night-900/60 px-3 py-1 font-mono text-xs text-white backdrop-blur-md"
          >
            {index + 1} / {images.length}
          </p>

          {images.length <= MAX_DOTS && (
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
  );
}
