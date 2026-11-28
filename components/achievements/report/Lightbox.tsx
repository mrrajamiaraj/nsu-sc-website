"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { ArrowLeft, ArrowRight, Download, ZoomIn, ZoomOut } from "lucide-react";
import { Dialog } from "@/components/contact/interaction/Dialog";
import { cn } from "@/lib/utils";

const MAX = 4;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Full-screen photo viewer: click or double-tap to zoom, wheel or pinch to zoom further,
// drag to pan while zoomed, ←/→ through the photos, download, "1 / N".
export function Lightbox({
  open,
  photos,
  index,
  title,
  onIndex,
  onClose,
}: {
  open: boolean;
  photos: string[];
  index: number;
  title: string;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const moved = useRef(false);
  const lastTap = useRef(0);
  const n = photos.length;

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [index, open]);

  const go = (step: number) => n > 1 && onIndex((index + step + n) % n);
  const zoomTo = (z: number) => {
    const next = clamp(z, 1, MAX);
    setZoom(next);
    if (next === 1) setPan({ x: 0, y: 0 });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const last = pointers.current.get(e.pointerId);
    if (!last) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true;
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = Array.from(pointers.current.values());
      zoomTo((pinch.current.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.dist);
    } else if (zoom > 1) {
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    }
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointers.current.get(e.pointerId);
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (!start || moved.current) return;
    // Mouse: a click toggles zoom. Touch: a double-tap does (one tap is too easy to hit while swiping).
    if (e.pointerType === "mouse") zoomTo(zoom > 1 ? 1 : 2.5);
    else {
      const now = performance.now();
      if (now - lastTap.current < 300) zoomTo(zoom > 1 ? 1 : 2.5);
      lastTap.current = now;
    }
  };
  const onWheel = (e: ReactWheelEvent) => zoomTo(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15));

  const download = async () => {
    const src = photos[index];
    const name = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${index + 1}.${src.split(".").pop()?.split("?")[0] || "jpg"}`;
    try {
      const blob = await (await fetch(src)).blob();
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: name });
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // The image host may not allow downloads from script; open it instead.
      window.open(src, "_blank", "noopener");
    }
  };

  const button = "flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#0b2524] transition hover:-translate-y-0.5 hover:bg-white/10 disabled:opacity-40";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="lightbox-title"
      variant="lightbox"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          go(e.key === "ArrowRight" ? 1 : -1);
        } else if (e.key === "+" || e.key === "=") zoomTo(zoom * 1.5);
        else if (e.key === "-") zoomTo(zoom / 1.5);
      }}
    >
      <div className="flex items-center gap-3 pr-14">
        <p id="lightbox-title" className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[#f5f1e8]/80">
          {title}
        </p>
        <span className="text-[14px] tabular-nums text-[#f5f1e8]/60" aria-live="polite">
          {index + 1} / {n}
        </span>
      </div>
      <div
        data-cursor="native"
        className={cn("relative mt-3 min-h-0 flex-1 touch-none select-none overflow-hidden rounded-lg bg-black/30", zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        {photos[index] && (
          // eslint-disable-next-line @next/next/no-img-element -- zoomed far past any fixed size
          <img
            src={photos[index]}
            alt={`${title}, photo ${index + 1} of ${n}`}
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain transition-transform duration-150 ease-out motion-reduce:transition-none"
            style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` }}
          />
        )}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <button type="button" onClick={() => go(-1)} disabled={n < 2} aria-label="Previous photo" className={button}>
          <ArrowLeft aria-hidden className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => zoomTo(zoom / 1.5)} disabled={zoom <= 1} aria-label="Zoom out" className={button}>
          <ZoomOut aria-hidden className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => zoomTo(zoom * 1.5)} disabled={zoom >= MAX} aria-label="Zoom in" className={button}>
          <ZoomIn aria-hidden className="h-4 w-4" />
        </button>
        <button type="button" onClick={download} aria-label="Download photo" className={button}>
          <Download aria-hidden className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => go(1)} disabled={n < 2} aria-label="Next photo" className={button}>
          <ArrowRight aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </Dialog>
  );
}
