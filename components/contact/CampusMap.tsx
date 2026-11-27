"use client";

import Image from "next/image";
import { useId, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useSpring } from "framer-motion";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Ph } from "@/components/contact/extras/shared";
import { useRichPointer } from "@/components/contact/interaction/hooks";
import { CAMPUS_POINT, CONTACT_EXTRAS } from "@/lib/contact-extras";
import { cn } from "@/lib/utils";

// Live map: OpenStreetMap's embed, loaded only when asked (it's a third-party page).
// Zoom buttons change the area shown; Reset view returns to the campus.
function osmSrc(zoom: number) {
  const span = 0.006 / 2 ** zoom;
  const { lat, lon } = CAMPUS_POINT;
  const bbox = [lon - span * 1.6, lat - span, lon + span * 1.6, lat + span].map((n) => n.toFixed(5)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
}

// A drawn, schematic map (not a real street plan) with the campus pin; tilts toward the cursor.
function StaticMap({ onLoad }: { onLoad: () => void }) {
  const rich = useRichPointer();
  const [pinOpen, setPinOpen] = useState(false);
  const cardId = useId();
  const rx = useSpring(0, { stiffness: 160, damping: 18 });
  const ry = useSpring(0, { stiffness: 160, damping: 18 });

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!rich) return;
    const box = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - box.left) / box.width - 0.5) * 8);
    rx.set(-((e.clientY - box.top) / box.height - 0.5) * 8);
  };

  return (
    <div className="[perspective:1000px]" onPointerMove={onMove} onPointerLeave={() => (rx.set(0), ry.set(0))}>
      <motion.div style={{ rotateX: rx, rotateY: ry }} className="relative h-56 overflow-hidden rounded-lg border border-white/10 bg-[#082120]">
        <svg aria-hidden viewBox="0 0 400 224" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <g fill="none" stroke="#f5f1e8" strokeOpacity="0.09" strokeLinecap="round">
            <path d="M-10 60 C80 70 140 40 230 52 S360 80 420 70" strokeWidth="10" />
            <path d="M-10 170 C70 160 160 180 250 168 S380 150 420 160" strokeWidth="7" />
            <path d="M120 -10 C130 60 110 130 128 240" strokeWidth="6" />
            <path d="M300 -10 C292 70 310 150 296 240" strokeWidth="8" />
            <path d="M0 112 H400 M200 0 V224" strokeWidth="2" strokeDasharray="4 8" />
          </g>
          <g fill="#f5f1e8" fillOpacity="0.04">
            <rect x="150" y="76" width="120" height="70" rx="4" />
            <rect x="20" y="84" width="80" height="56" rx="4" />
            <rect x="320" y="92" width="70" height="50" rx="4" />
          </g>
        </svg>

        {/* Click anywhere on the drawing to load the live map. */}
        <button type="button" onClick={onLoad} className="absolute inset-0 flex items-end justify-start p-3" aria-label="Load the live map of North South University">
          <span className="rounded-full border border-white/15 bg-[#0b2524]/85 px-3 py-1.5 text-[13px] font-semibold text-[#f5f1e8] backdrop-blur-sm">
            Click to load the live map
          </span>
        </button>

        {/* Campus pin with a radar pulse; hover, focus or tap shows a mini card. */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            type="button"
            aria-expanded={pinOpen}
            aria-controls={cardId}
            aria-label="North South University campus"
            onPointerEnter={(e) => e.pointerType === "mouse" && setPinOpen(true)}
            onPointerLeave={(e) => e.pointerType === "mouse" && setPinOpen(false)}
            onFocus={() => setPinOpen(true)}
            onBlur={() => setPinOpen(false)}
            onClick={(e) => {
              e.stopPropagation();
              setPinOpen((o) => !o);
            }}
            className="group/pin relative flex h-8 w-8 items-center justify-center"
          >
            <span aria-hidden className={cn("map-radar absolute inset-0 rounded-full border-2 border-[#3fcfca]", pinOpen && "map-radar-fast")} />
            <span aria-hidden className="relative h-3.5 w-3.5 rounded-full border-2 border-[#0b2524] bg-[#3fcfca]" />
          </button>
          <AnimatePresence>
            {pinOpen && (
              <motion.div
                id={cardId}
                role="tooltip"
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="absolute bottom-full left-1/2 z-10 mb-2 flex w-60 -translate-x-1/2 items-center gap-3 rounded-lg border border-white/15 bg-[#082120] p-2.5 text-left shadow-[0_16px_30px_-12px_rgba(0,0,0,0.8)]"
              >
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-[#0f302e] text-[10px]">
                  {CONTACT_EXTRAS.visitPhoto ? <Image src={CONTACT_EXTRAS.visitPhoto} alt="" fill sizes="48px" className="object-cover" /> : <Ph>photo</Ph>}
                </span>
                <span className="text-[13px] leading-snug text-[#f5f1e8]">
                  North South University campus · {CONTACT_EXTRAS.clubRoom ?? <Ph>Building, Room</Ph>}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export function CampusMap({ className }: { className?: string }) {
  const [live, setLive] = useState(false);
  const [zoom, setZoom] = useState(0);
  const control =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#0b2524]/90 text-[#f5f1e8] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-[#0f302e] active:scale-[0.97] disabled:opacity-40";

  return (
    <div className={className}>
      <AnimatePresence mode="wait" initial={false}>
        {live ? (
          <motion.div
            key="live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            data-cursor="drag"
            className="relative h-56 overflow-hidden rounded-lg border border-white/10"
          >
            <iframe
              key={zoom}
              title="Map of North South University (OpenStreetMap)"
              src={osmSrc(zoom)}
              className="h-full w-full [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.6)_brightness(0.9)]"
            />
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
          </motion.div>
        ) : (
          <motion.div key="static" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <StaticMap onLoad={() => setLive(true)} />
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-2 text-[12px] text-[#f5f1e8]/45">{live ? "Map data © OpenStreetMap contributors." : "Drawing only. The live map loads from OpenStreetMap."}</p>
    </div>
  );
}
