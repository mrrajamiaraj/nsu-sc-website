"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ToFormButton } from "@/components/contact/extras/FormLinks";
import { Ph } from "@/components/contact/extras/shared";
import { haptic } from "@/components/contact/interaction/hooks";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import type { Sponsor } from "@/lib/types";
import { cn } from "@/lib/utils";

// Download button: on press a small arrow drops into a tray, then a tick.
function DeckButton({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "dropping" | "done">("idle");
  return (
    <a
      href={url}
      download
      data-haptic
      onClick={() => {
        haptic();
        setState("dropping");
        window.setTimeout(() => setState("done"), 450);
        window.setTimeout(() => setState("idle"), 2200);
      }}
      className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#3fcfca] px-6 text-[15px] font-semibold text-[#3fcfca] transition hover:-translate-y-0.5 hover:bg-[#3fcfca]/10 active:scale-[0.97]"
    >
      Download sponsorship deck (PDF)
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15v4h16v-4" />
        {state === "done" ? (
          <motion.path d="M8 11.5l3 3 5-6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.25 }} />
        ) : (
          <motion.g animate={state === "dropping" ? { y: [0, 6, 4], opacity: [1, 1, 0] } : { y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
            <path d="M12 4v9M8.5 9.5 12 13l3.5-3.5" />
          </motion.g>
        )}
      </svg>
      <span className="sr-only" role="status">
        {state === "done" ? "Download started" : ""}
      </span>
    </a>
  );
}

// Full-width sponsorship band. The event count and partner logos are the club's own
// records; the student reach and the deck are placeholders until confirmed.
export function PartnerBand({ partners, eventCount, year, className }: { partners: Sponsor[]; eventCount: number; year: string; className?: string }) {
  const { studentReach, sponsorDeckUrl } = CONTACT_EXTRAS;
  const logos = partners.filter((partner) => partner.logo);

  return (
    <section aria-labelledby="partner-heading" className={cn("border-y border-white/10 bg-[#0f302e] py-14", className)}>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-14 lg:px-8">
        <div className="min-w-0 max-w-2xl">
          <h2 id="partner-heading" className="text-[36px] !font-extrabold uppercase leading-none text-[#f5f1e8] sm:text-[44px]">
            Partner with NSU SC
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-[#f5f1e8]/80">
            Reach {studentReach ?? <Ph>X,000</Ph>}+ students across {eventCount} club events in {year}. Sponsorships, kit partners, venue partners.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:shrink-0">
          {sponsorDeckUrl ? (
            <DeckButton url={sponsorDeckUrl} />
          ) : (
            <span className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-dashed border-white/25 px-5 text-[14px] text-[#f5f1e8]/60">
              Download sponsorship deck (PDF) <Ph>deck link</Ph>
            </span>
          )}
          <ToFormButton
            topic="partnership"
            className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline"
          >
            Talk partnerships
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
          </ToFormButton>
        </div>
      </div>

      {/* Past partners, drifting slowly sideways; hovering the row pauses it. */}
      {logos.length > 0 && (
        <div className="mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <ul aria-label="Some past partners" className="partner-marquee flex w-max items-center gap-12 px-6">
            {[...logos, ...logos].map((partner, i) => (
              <li key={`${partner.id}-${i}`} aria-hidden={i >= logos.length || undefined} className="relative h-10 w-24 shrink-0 transition-transform duration-200 hover:-translate-y-1">
                <Image
                  src={partner.logo!}
                  alt={i < logos.length ? partner.name : ""}
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
