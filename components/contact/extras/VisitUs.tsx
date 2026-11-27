"use client";

import Image from "next/image";
import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Ph, SectionHeading } from "@/components/contact/extras/shared";
import { Dialog } from "@/components/contact/interaction/Dialog";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import { cn } from "@/lib/utils";

const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("North South University, Bashundhara, Dhaka")}`;
const STEP_HINTS = ["Gate to use", "Which building", "Floor and room"];
// Waypoints on the route sketch (gate -> building -> club room), in sketch coordinates.
const WAYPOINTS = [
  { x: 30, y: 150 },
  { x: 150, y: 70 },
  { x: 260, y: 40 },
];

// Gallery of route photos; swipe or use the arrow keys.
function Gallery({ open, onClose }: { open: boolean; onClose: () => void }) {
  const photos = CONTACT_EXTRAS.routePhotos;
  const [index, setIndex] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const go = (step: number) => setIndex((i) => (i + step + photos.length) % photos.length);
  const photo = photos[index];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="route-gallery-title"
      variant="lightbox"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <h2 id="route-gallery-title" className="pr-14 text-[22px] !font-extrabold uppercase text-[#f5f1e8]">
        The way to the club room
      </h2>
      <p className="text-[14px] text-[#f5f1e8]/60">
        Photo {index + 1} of {photos.length}
      </p>
      <div
        className="relative mt-4 flex-1 touch-pan-y overflow-hidden rounded-lg border border-white/10"
        onPointerDown={(e: ReactPointerEvent) => setStart(e.clientX)}
        onPointerUp={(e: ReactPointerEvent) => {
          if (start !== null && Math.abs(e.clientX - start) > 50) go(e.clientX < start ? 1 : -1);
          setStart(null);
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={index} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="absolute inset-0 flex items-center justify-center">
            {photo ? (
              <Image src={photo} alt={`Route photo ${index + 1}`} fill sizes="90vw" className="object-contain" />
            ) : (
              <Ph>{`Route photo ${index + 1}: ${["the gate", "the walk in", "the building entrance", "the club room door"][index] ?? "route"}`}</Ph>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 hover:bg-white/10">
          <ArrowLeft aria-hidden className="h-5 w-5" />
        </button>
        <div className="flex gap-2" aria-hidden>
          {photos.map((_, i) => (
            <span key={i} className={cn("h-1.5 w-6 rounded-full transition-colors", i === index ? "bg-[#3fcfca]" : "bg-white/20")} />
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label="Next photo" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 hover:bg-white/10">
          <ArrowRight aria-hidden className="h-5 w-5" />
        </button>
      </div>
    </Dialog>
  );
}

// Schematic route from the gate to the club room; the hovered step's spot lights up.
function RouteSketch({ active }: { active: number | null }) {
  const d = `M${WAYPOINTS[0].x} ${WAYPOINTS[0].y} C 70 150, 100 80, ${WAYPOINTS[1].x} ${WAYPOINTS[1].y} S 220 40, ${WAYPOINTS[2].x} ${WAYPOINTS[2].y}`;
  return (
    <figure className="mt-4">
      <svg viewBox="0 0 290 180" className="w-full" aria-hidden>
        <motion.path
          d={d}
          fill="none"
          stroke="#3fcfca"
          strokeOpacity="0.6"
          strokeWidth="2.5"
          strokeDasharray="6 6"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        {WAYPOINTS.map((point, i) => (
          <g key={i}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="14"
              fill="#3fcfca"
              initial={false}
              animate={{ opacity: active === i ? 0.25 : 0, scale: active === i ? 1 : 0.4 }}
              style={{ transformOrigin: `${point.x}px ${point.y}px` }}
            />
            <circle cx={point.x} cy={point.y} r="6" fill={active === i ? "#3fcfca" : "#0b2524"} stroke="#3fcfca" strokeWidth="2" />
            <text x={point.x} y={point.y + 26} textAnchor="middle" fill="#f5f1e8" fillOpacity="0.6" fontSize="11">
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="text-[12px] text-[#f5f1e8]/45">Schematic only, not to scale.</figcaption>
    </figure>
  );
}

export function VisitUs({ className }: { className?: string }) {
  const { clubRoom, dropInHours, visitPhoto, routeSteps } = CONTACT_EXTRAS;
  const [gallery, setGallery] = useState(false);
  const [step, setStep] = useState<number | null>(null);

  const rows = [
    {
      label: "Club room",
      value: (
        <>
          {clubRoom ?? <Ph>Building name, Room number</Ph>}, North South University, Bashundhara R/A, Dhaka 1229
        </>
      ),
    },
    { label: "Best time to drop by", value: dropInHours ?? <Ph>Days and hours, e.g. Sun–Thu, 12:00 PM – 4:00 PM</Ph> },
    { label: "Non-NSU visitors", value: "Bring a photo ID; campus security may ask for it at the gate." },
  ];

  return (
    <section aria-labelledby="visit-heading" className={cn("border-t border-white/10 pt-14", className)}>
      <div className="grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-14">
        <div>
          <SectionHeading id="visit-heading" title="Visit us in person" />
          <dl className="mt-6">
            {rows.map((row) => (
              <div key={row.label} className="grid gap-1 border-t border-white/10 py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
                <dt className="text-[14px] text-[#f5f1e8]/60">{row.label}</dt>
                <dd className="text-[16px] leading-relaxed text-[#f5f1e8]">{row.value}</dd>
              </div>
            ))}
            <div className="grid gap-1 border-t border-white/10 py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
              <dt className="text-[14px] text-[#f5f1e8]/60">How to find us</dt>
              <dd>
                <ol className="space-y-2">
                  {routeSteps.map((text, i) => (
                    // Each step number lights up in order as it scrolls into view.
                    <motion.li
                      key={i}
                      tabIndex={0}
                      onPointerEnter={() => setStep(i)}
                      onPointerLeave={() => setStep(null)}
                      onFocus={() => setStep(i)}
                      onBlur={() => setStep(null)}
                      initial="dim"
                      whileInView="lit"
                      viewport={{ once: true, amount: 1 }}
                      className="flex items-baseline gap-3 rounded-md text-[16px] leading-relaxed text-[#f5f1e8] focus-visible:outline-none"
                    >
                      <motion.span
                        variants={{ dim: { opacity: 0.35, scale: 0.85 }, lit: { opacity: 1, scale: 1, transition: { delay: i * 0.25, type: "spring", stiffness: 400, damping: 18 } } }}
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold transition-colors",
                          step === i ? "border-[#3fcfca] bg-[#3fcfca] text-[#002e2c]" : "border-[#3fcfca] text-[#3fcfca]",
                        )}
                      >
                        {i + 1}
                      </motion.span>
                      <span>{text ?? <Ph>{STEP_HINTS[i] ?? `Step ${i + 1}`}</Ph>}</span>
                    </motion.li>
                  ))}
                </ol>
              </dd>
            </div>
          </dl>
          <a
            href={MAPS}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-[44px] items-center gap-1 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline"
          >
            Open in Google Maps
            <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            <span className="sr-only">(opens Google Maps)</span>
          </a>
        </div>

        <div className="md:mt-16">
          <button
            type="button"
            data-cursor="view"
            onClick={() => setGallery(true)}
            aria-label="Open photos of the route to the club room"
            className="group relative block aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/10"
          >
            {visitPhoto ? (
              <Image src={visitPhoto} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <span className="flex h-full items-center justify-center border border-dashed border-white/20 p-6 text-center transition-transform duration-500 group-hover:scale-105">
                <Ph>Photo of the club room or sports complex entrance</Ph>
              </span>
            )}
            <span className="absolute bottom-3 left-3 rounded-full bg-[#0b2524]/85 px-3 py-1 text-[12px] font-semibold text-[#f5f1e8]">See the route photos</span>
          </button>
          <RouteSketch active={step} />
        </div>
      </div>
      <Gallery open={gallery} onClose={() => setGallery(false)} />
    </section>
  );
}
