"use client";

import Image from "next/image";
import { useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Expand } from "lucide-react";
import { Dialog } from "@/components/contact/interaction/Dialog";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import { cn } from "@/lib/utils";

const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("North South University, Bashundhara, Dhaka")}`;

export interface VisitPhoto {
  src: string;
  caption: string; // what and where, e.g. the event's name
}

// Small lightbox over the club's photos; arrows, arrow keys or a swipe move through them.
function Gallery({ photos, open, start, onClose }: { photos: VisitPhoto[]; open: boolean; start: number; onClose: () => void }) {
  const [index, setIndex] = useState(start);
  const [down, setDown] = useState<number | null>(null);
  const go = (step: number) => setIndex((i) => (i + step + photos.length) % photos.length);
  const photo = photos[index] ?? photos[0];
  if (!photo) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="visit-gallery-title"
      variant="lightbox"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <h2 id="visit-gallery-title" className="pr-14 text-[22px] !font-extrabold leading-none text-[#f5f1e8]">
        Around the club
      </h2>
      <p className="mt-1 text-[14px] text-[#f5f1e8]/60">
        {photo.caption} · {index + 1} of {photos.length}
      </p>
      <div
        className="relative mt-4 flex-1 touch-pan-y overflow-hidden rounded-lg"
        onPointerDown={(e: ReactPointerEvent) => setDown(e.clientX)}
        onPointerUp={(e: ReactPointerEvent) => {
          if (down !== null && Math.abs(e.clientX - down) > 50) go(e.clientX < down ? 1 : -1);
          setDown(null);
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0">
            <Image src={photo.src} alt={photo.caption} fill sizes="90vw" className="object-contain" />
          </motion.div>
        </AnimatePresence>
      </div>
      {photos.length > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-[#f5f1e8] hover:bg-white/10">
            <ArrowLeft aria-hidden className="h-5 w-5" />
          </button>
          <div className="flex gap-2" aria-hidden>
            {photos.map((p, i) => (
              <span key={p.src} className={cn("h-1.5 w-6 rounded-full transition-colors", i === index ? "bg-[#3fcfca]" : "bg-white/20")} />
            ))}
          </div>
          <button type="button" onClick={() => go(1)} aria-label="Next photo" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-[#f5f1e8] hover:bg-white/10">
            <ArrowRight aria-hidden className="h-5 w-5" />
          </button>
        </div>
      )}
    </Dialog>
  );
}

// Where to find the club. Rows without confirmed details use the real fallback line or stay
// hidden (the club room and the walk from the gate appear once set in lib/contact-extras.ts).
export function VisitUs({ photos }: { photos: VisitPhoto[] }) {
  const { clubRoom, dropInHours, routeSteps } = CONTACT_EXTRAS;
  const [gallery, setGallery] = useState(false);
  const steps = routeSteps.filter((s): s is string => Boolean(s));
  const lead = photos[0];

  const rows: { label: string; value: ReactNode }[] = [
    {
      label: "Where",
      value: (
        <>
          North South University, Bashundhara R/A, Dhaka 1229
          {clubRoom && <span className="mt-1 block text-[#f5f1e8]/75">Club room: {clubRoom}</span>}
        </>
      ),
    },
    { label: "Best time", value: dropInHours ?? "Match days and event days" },
    { label: "Visitors", value: "Non-NSU visitors: bring a photo ID; campus security may ask for it at the gate." },
  ];
  if (steps.length > 0)
    rows.push({
      label: "How to find us",
      value: (
        <ol className="space-y-1.5">
          {steps.map((step, i) => (
            <li key={step} className="flex items-baseline gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3fcfca] text-[12px] font-bold text-[#3fcfca]">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      ),
    });

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-12">
      <div className="md:col-span-6">
        <h2 id="visit-heading" className="text-[40px] !font-extrabold leading-none text-[#f5f1e8]">
          Visit us
        </h2>
        <dl className="mt-8">
          {rows.map((row) => (
            <div key={row.label} className="grid gap-1 border-t border-white/10 py-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-6">
              <dt className="text-[14px] text-[#f5f1e8]/60">{row.label}</dt>
              <dd className="text-[16px] leading-relaxed text-[#f5f1e8]">{row.value}</dd>
            </div>
          ))}
        </dl>
        <a href={MAPS} target="_blank" rel="noopener noreferrer" className="group mt-3 inline-flex min-h-[44px] items-center gap-1 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
          Open in Google Maps
          <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          <span className="sr-only">(opens Google Maps)</span>
        </a>
      </div>

      {lead && (
        <figure className="md:col-span-6 md:pt-16">
          <button
            type="button"
            onClick={() => setGallery(true)}
            aria-label={`Open the photo gallery (${photos.length} ${photos.length === 1 ? "photo" : "photos"})`}
            className="group relative block aspect-video w-full overflow-hidden rounded-[10px]"
          >
            <Image src={lead.src} alt={lead.caption} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-[1.02] group-hover:grayscale-0 motion-reduce:transition-[filter]" />
            {/* Teal duotone that lifts on hover. */}
            <span aria-hidden className="absolute inset-0 bg-[#3fcfca] mix-blend-multiply transition-opacity duration-500 [opacity:0.45] group-hover:opacity-0 group-focus-visible:opacity-0" />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-[#0b2524]/85 px-3 py-1 text-[12px] font-semibold text-[#f5f1e8]">
              <Expand aria-hidden className="h-3.5 w-3.5" />
              {photos.length > 1 ? `${photos.length} photos` : "View"}
            </span>
          </button>
          <figcaption className="mt-3 text-[14px] text-[#f5f1e8]/60">{lead.caption}</figcaption>
        </figure>
      )}
      {lead && <Gallery photos={photos} open={gallery} start={0} onClose={() => setGallery(false)} />}
    </div>
  );
}
