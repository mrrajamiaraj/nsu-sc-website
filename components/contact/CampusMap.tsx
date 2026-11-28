"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Minus, Plus, RotateCcw } from "lucide-react";
import { CAMPUS_POINT } from "@/lib/contact-extras";
import { cn } from "@/lib/utils";

const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("North South University, Bashundhara, Dhaka")}`;

// OpenStreetMap's embed, loaded only when asked (it's a third-party page).
function osmSrc(zoom: number) {
  const span = 0.006 / 2 ** zoom;
  const { lat, lon } = CAMPUS_POINT;
  const bbox = [lon - span * 1.6, lat - span, lon + span * 1.6, lat + span].map((n) => n.toFixed(5)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
}

// A styled map card (a drawing in the page's greens, not a street plan) with the campus pin.
// Click loads the live map. It fills its column, so it ends level with the form beside it.
export function CampusMap({ className }: { className?: string }) {
  const [live, setLive] = useState(false);
  const [zoom, setZoom] = useState(0);
  const control =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#0b2524]/90 text-[#f5f1e8] backdrop-blur-sm hover:-translate-y-0.5 hover:bg-[#0f302e] disabled:opacity-40";

  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-[#082120] lg:aspect-auto lg:min-h-[180px]", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {live ? (
          <motion.div key="live" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} data-cursor="drag">
            <iframe key={zoom} title="Map of North South University (OpenStreetMap)" src={osmSrc(zoom)} className="h-full w-full [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.6)_brightness(0.9)]" />
            <div className="absolute right-2 top-2 flex flex-col gap-1.5">
              <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(3, z + 1))} disabled={zoom >= 3} className={control}>
                <Plus aria-hidden className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(-2, z - 1))} disabled={zoom <= -2} className={control}>
                <Minus aria-hidden className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Reset view" onClick={() => setZoom(0)} className={control}>
                <RotateCcw aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <p className="absolute bottom-1 left-2 rounded bg-[#0b2524]/80 px-1.5 text-[10px] text-[#f5f1e8]/60">© OpenStreetMap contributors</p>
          </motion.div>
        ) : (
          <motion.div key="static" className="group absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <button type="button" onClick={() => setLive(true)} aria-label="Load the live map of North South University" data-cursor="view" className="absolute inset-0 block h-full w-full overflow-hidden">
              <svg aria-hidden viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none">
                <rect width="400" height="300" fill="#0b2a28" />
                <g fill="none" stroke="#f5f1e8" strokeOpacity="0.09" strokeLinecap="round">
                  <path d="M-10 70 C80 80 140 50 230 62 S360 90 420 80" strokeWidth="12" />
                  <path d="M-10 220 C70 210 160 232 250 218 S380 200 420 210" strokeWidth="8" />
                  <path d="M120 -10 C130 80 110 170 128 310" strokeWidth="7" />
                  <path d="M300 -10 C292 90 310 190 296 310" strokeWidth="9" />
                  <path d="M0 150 H400 M200 0 V300" strokeWidth="2" strokeDasharray="4 8" />
                </g>
                <g fill="#3fcfca" fillOpacity="0.06">
                  <rect x="150" y="100" width="120" height="90" rx="5" />
                  <rect x="20" y="110" width="80" height="64" rx="5" />
                  <rect x="320" y="118" width="70" height="56" rx="5" />
                </g>
              </svg>
              {/* Campus pin with a slow pulse. */}
              <span aria-hidden className="absolute left-1/2 top-[44%] flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                <span className="map-radar absolute inset-0 rounded-full border-2 border-[#3fcfca]" />
                <span className="relative h-3.5 w-3.5 rounded-full border-2 border-[#0b2524] bg-[#3fcfca]" />
              </span>
              <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-[#0b2524]/85 px-3 py-1 text-[12px] font-semibold text-[#f5f1e8]/80 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                Load live map
              </span>
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[#071a19]/95 to-transparent px-4 pb-3 pt-10">
              <span className="text-[15px] font-semibold text-[#f5f1e8]">NSU, Bashundhara R/A</span>
              <a href={DIRECTIONS} target="_blank" rel="noopener noreferrer" className="pointer-events-auto inline-flex min-h-[36px] items-center gap-1 text-[14px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
                Get directions
                <ArrowUpRight aria-hidden className="h-4 w-4" />
                <span className="sr-only">(opens Google Maps)</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
