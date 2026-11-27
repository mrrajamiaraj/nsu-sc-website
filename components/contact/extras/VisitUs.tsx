import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Ph, SectionHeading } from "@/components/contact/extras/shared";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import { cn } from "@/lib/utils";

const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("North South University, Bashundhara, Dhaka")}`;

export function VisitUs({ className }: { className?: string }) {
  const { clubRoom, dropInHours, wayfinding, visitPhoto } = CONTACT_EXTRAS;
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
    { label: "How to find us", value: wayfinding ?? <Ph>Gate to use and where the room is</Ph> },
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
          </dl>
          <a
            href={MAPS}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-[44px] items-center gap-1 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
          >
            Open in Google Maps
            <ArrowUpRight aria-hidden className="h-4 w-4" />
            <span className="sr-only">(opens Google Maps)</span>
          </a>
        </div>
        <div className="relative aspect-[4/3] self-start overflow-hidden rounded-lg md:mt-16">
          {visitPhoto ? (
            <Image src={visitPhoto} alt="Entrance to the club room" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center border border-dashed border-white/20 p-6 text-center">
              <Ph>Photo of the club room or sports complex entrance</Ph>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
