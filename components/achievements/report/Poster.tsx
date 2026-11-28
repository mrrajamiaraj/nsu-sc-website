"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionTemplate, useSpring } from "framer-motion";
import { Expand } from "lucide-react";
import { useRichPointer } from "@/components/contact/interaction/hooks";
import { BLUR } from "@/components/achievements/trophy/shared";
import { cn } from "@/lib/utils";

const THUMBS = 5;

// The poster at its natural ratio: tilts toward the cursor (5° max) with a sheen that follows
// it, opens the lightbox on click, and swipes between photos on phones. More than one photo
// adds a thumbnail strip: hover previews, click selects, ←/→ cycle while it has focus.
export function Poster({
  photos,
  title,
  selected,
  onSelect,
  onOpen,
}: {
  photos: { src: string; ratio: number | null }[];
  title: string;
  selected: number;
  onSelect: (i: number) => void;
  onOpen: (i: number) => void;
}) {
  const rich = useRichPointer();
  const [preview, setPreview] = useState<number | null>(null);
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });
  const sx = useSpring(50, { stiffness: 200, damping: 24 });
  const sy = useSpring(30, { stiffness: 200, damping: 24 });
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${sx}% ${sy}%, rgba(255,255,255,0.16), transparent 60%)`;
  const [hover, setHover] = useState(false);
  const swipe = useRef<number | null>(null);
  const swiped = useRef(false);

  const shown = preview ?? selected;
  const photo = photos[shown];
  const ratio = photo?.ratio ?? 4 / 5;
  const n = photos.length;

  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!rich || e.pointerType !== "mouse") return;
    const box = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - box.left) / box.width;
    const py = (e.clientY - box.top) / box.height;
    ry.set((px - 0.5) * 10);
    rx.set(-(py - 0.5) * 10);
    sx.set(px * 100);
    sy.set(py * 100);
  };
  const reset = () => {
    setHover(false);
    rx.set(0);
    ry.set(0);
  };

  const onThumbKey = (e: ReactKeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (selected + (e.key === "ArrowRight" ? 1 : -1) + n) % n;
    onSelect(next);
    (e.currentTarget.querySelectorAll<HTMLButtonElement>("button")[Math.min(next, THUMBS - 1)] ?? null)?.focus();
  };

  if (!photo) return <div className="aspect-[4/5] w-full rounded-[10px] bg-[#0f302e]" />;

  return (
    <div>
      <div className="[perspective:1100px]">
        <motion.button
          type="button"
          onClick={() => !swiped.current && onOpen(shown)}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
          onPointerMove={onMove}
          onPointerLeave={reset}
          onPointerDown={(e) => {
            swiped.current = false;
            if (e.pointerType === "touch") swipe.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (swipe.current === null) return;
            const dx = e.clientX - swipe.current;
            swipe.current = null;
            if (n > 1 && Math.abs(dx) > 50) {
              swiped.current = true;
              onSelect((selected + (dx < 0 ? 1 : -1) + n) % n);
            }
          }}
          style={{ aspectRatio: String(ratio), width: `min(100%, calc((100svh - var(--bar-top, 0px) - 120px) * ${ratio}))`, ...(rich ? { rotateX: rx, rotateY: ry } : {}) }}
          data-cursor="view"
          aria-label={`Open the photo${n > 1 ? `s (${shown + 1} of ${n})` : ""} full screen. Shortcut: L`}
          className="group relative mx-auto block touch-pan-y overflow-hidden rounded-[10px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.75),0_12px_24px_-16px_rgba(0,0,0,0.5)] transition-shadow duration-300 hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85),0_16px_30px_-16px_rgba(0,0,0,0.55)]"
        >
          <Image
            key={photo.src}
            src={photo.src}
            alt={n > 1 ? `${title}, photo ${shown + 1} of ${n}` : title}
            fill
            priority={shown === 0}
            sizes="(min-width: 1024px) 40vw, 100vw"
            placeholder="blur"
            blurDataURL={BLUR}
            className="object-cover"
          />
          {rich && <motion.span aria-hidden className={cn("pointer-events-none absolute inset-0 transition-opacity duration-300", hover ? "opacity-100" : "opacity-0")} style={{ backgroundImage: sheen }} />}
          <span
            aria-hidden
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-[#0b2524]/80 text-[#f5f1e8] opacity-80 transition group-hover:opacity-100 group-focus-visible:opacity-100 md:opacity-0"
          >
            <Expand className="h-4 w-4" />
          </span>
        </motion.button>
      </div>

      {n > 1 && (
        <div role="group" aria-label="Photos" onKeyDown={onThumbKey} onPointerLeave={() => setPreview(null)} className="mt-3 flex gap-2">
          {photos.slice(0, THUMBS).map((p, i) => {
            const more = i === THUMBS - 1 && n > THUMBS ? n - THUMBS + 1 : 0;
            return (
              <button
                key={p.src}
                type="button"
                aria-label={more ? `Open all ${n} photos` : `Show photo ${i + 1} of ${n}`}
                aria-pressed={!more && selected === i}
                tabIndex={i === Math.min(selected, THUMBS - 1) ? 0 : -1}
                onPointerEnter={(e) => e.pointerType === "mouse" && !more && setPreview(i)}
                onFocus={() => !more && setPreview(null)}
                onClick={() => (more ? onOpen(i) : onSelect(i))}
                className={cn(
                  "relative aspect-square w-[18%] max-w-[72px] overflow-hidden rounded-md border-2 transition hover:-translate-y-0.5",
                  selected === i && !more ? "border-[#3fcfca]" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={p.src} alt="" fill sizes="72px" loading="lazy" className="object-cover" />
                {more > 0 && <span className="absolute inset-0 flex items-center justify-center bg-[#0b2524]/75 text-[15px] font-bold text-[#f5f1e8]">+{more}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
