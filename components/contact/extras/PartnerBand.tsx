import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { ToFormButton } from "@/components/contact/extras/FormLinks";
import { Ph } from "@/components/contact/extras/shared";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import type { Sponsor } from "@/lib/types";
import { cn } from "@/lib/utils";

// Full-width sponsorship band. The event count and partner logos are the club's own
// records; the student reach and the deck are placeholders until confirmed.
export function PartnerBand({
  partners,
  eventCount,
  year,
  className,
}: {
  partners: Sponsor[];
  eventCount: number;
  year: string;
  className?: string;
}) {
  const { studentReach, sponsorDeckUrl } = CONTACT_EXTRAS;
  const outline =
    "inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#3fcfca] px-6 text-[15px] font-semibold text-[#3fcfca] transition hover:bg-[#3fcfca]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fcfca] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f302e]";

  return (
    <section aria-labelledby="partner-heading" className={cn("border-y border-white/10 bg-[#0f302e] py-14", className)}>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-14 lg:px-8">
        <div className="max-w-2xl">
          <h2 id="partner-heading" className="text-[36px] !font-extrabold uppercase leading-none text-[#f5f1e8] sm:text-[44px]">
            Partner with NSU SC
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-[#f5f1e8]/80">
            Reach {studentReach ?? <Ph>X,000</Ph>}+ students across {eventCount} club events in {year}. Sponsorships, kit partners, venue partners.
          </p>
          {partners.length > 0 && (
            <ul aria-label="Some past partners" className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
              {partners.map((partner) => (
                <li key={partner.id} className="relative h-9 w-24">
                  {partner.logo && (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      sizes="96px"
                      className="object-contain opacity-60 brightness-[1.7] grayscale transition duration-300 hover:opacity-100 hover:brightness-100 hover:grayscale-0 motion-reduce:transition-none"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:shrink-0">
          {sponsorDeckUrl ? (
            <a href={sponsorDeckUrl} download className={outline}>
              Download sponsorship deck (PDF)
              <ArrowDown aria-hidden className="h-4 w-4" />
            </a>
          ) : (
            <span className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-dashed border-white/25 px-5 text-[14px] text-[#f5f1e8]/60">
              Download sponsorship deck (PDF) <Ph>deck link</Ph>
            </span>
          )}
          <ToFormButton
            topic="partnership"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
          >
            Talk partnerships
            <ArrowRight aria-hidden className="h-4 w-4" />
          </ToFormButton>
        </div>
      </div>
    </section>
  );
}
