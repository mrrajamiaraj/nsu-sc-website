"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { ToFormButton } from "@/components/contact/extras/FormLinks";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import type { PartnerLogo } from "@/lib/about";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";

// One logo on an off-white plate, as on the About page's partner wall.
function Plate({ logo, copy }: { logo: PartnerLogo; copy?: boolean }) {
  return (
    <li aria-hidden={copy || undefined} className="flex h-[66px] w-[132px] shrink-0 md:h-[88px] md:w-[176px] items-center justify-center rounded-lg bg-[#f5f1e8] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
      <span className="partner-logo relative block" style={{ "--s": logo.scale ?? 1 } as CSSProperties}>
        <Image src={logo.src} alt={copy ? "" : logo.name} fill sizes="(min-width: 768px) 172px, 130px" draggable={false} className="select-none object-contain mix-blend-multiply" />
      </span>
    </li>
  );
}

// Sponsorship band: the club's own counts, one slow row of past partners (it pauses on hover;
// a still grid with reduced motion), and the way to start a partnership conversation.
export function PartnerBand({ partners, eventCount }: { partners: PartnerLogo[]; eventCount: number }) {
  const reduce = Boolean(useReducedMotion());
  const { sponsorDeckUrl } = CONTACT_EXTRAS;
  const facts = [eventCount > 0 && `${eventCount} events on record`, partners.length > 0 && `${partners.length} partners so far`].filter(Boolean).join(", ");

  return (
    <div className="border-y border-white/10 bg-[#0f2724] py-14">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <h2 id="partner-heading" className="text-[40px] !font-extrabold leading-none text-[#f5f1e8]">
          Partner with NSU SC
        </h2>
        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-[#f5f1e8]/80">
          {facts && `${facts}. `}Sponsorships, kit partners, venue partners.
        </p>
      </div>

      {partners.length > 0 &&
        (reduce ? (
          <ul aria-label="Some past partners" className="mx-auto mt-10 flex max-w-[1200px] flex-wrap gap-3 px-6 lg:px-8">
            {partners.map((logo) => (
              <Plate key={logo.id} logo={logo} />
            ))}
          </ul>
        ) : (
          <div className="mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
            <ul aria-label="Some past partners" className="partner-marquee flex w-max gap-3 pr-3" style={{ animationDuration: `${Math.max(40, partners.length * 3)}s` }}>
              {[...partners, ...partners].map((logo, i) => (
                <Plate key={`${logo.id}-${i}`} logo={logo} copy={i >= partners.length} />
              ))}
            </ul>
          </div>
        ))}

      <div className="mx-auto mt-10 flex max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-4 px-6 lg:px-8">
        <Magnetic>
          <ToFormButton
            topic="partnership"
            className="group inline-flex min-h-[52px] items-center gap-2 rounded-full bg-[#3fcfca] px-7 text-base font-semibold text-[#002e2c] transition hover:bg-[#6fe0dc]"
          >
            Talk partnerships
            <ArrowRight aria-hidden className="h-5 w-5 transition-transform duration-150 group-hover:translate-x-1" />
          </ToFormButton>
        </Magnetic>
        {sponsorDeckUrl && (
          <a href={sponsorDeckUrl} download className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
            Sponsorship deck
            <ArrowDown aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-y-0.5" />
            <span className="sr-only">(PDF)</span>
          </a>
        )}
      </div>
    </div>
  );
}
