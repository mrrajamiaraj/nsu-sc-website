"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 4000;

export function EventGallerySlider({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [hasMultiple, images.length]);

  if (images.length === 0) {
    return (
      <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-3xl bg-brand-gradient sm:aspect-[21/9]">
        <Trophy className="h-14 w-14 text-night-950/40" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-3xl sm:aspect-[21/9]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={images[index]}
            alt={`${alt} — photo ${index + 1}`}
            fill
            sizes="100vw"
            priority={index === 0}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-950/70 via-transparent to-transparent" />

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => setIndex((current) => (current - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-night-900/60 text-white opacity-0 backdrop-blur-md transition-opacity duration-200 hover:bg-night-900/80 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => setIndex((current) => (current + 1) % images.length)}
            className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-night-900/60 text-white opacity-0 backdrop-blur-md transition-opacity duration-200 hover:bg-night-900/80 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {images.map((image, dotIndex) => (
              <button
                key={image + dotIndex}
                type="button"
                aria-label={`Go to photo ${dotIndex + 1}`}
                onClick={() => setIndex(dotIndex)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  dotIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
