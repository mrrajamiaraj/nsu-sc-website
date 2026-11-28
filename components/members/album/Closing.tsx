import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DISPLAY, EmptySlot } from "@/components/members/album/Card";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { cn } from "@/lib/utils";

// The album's last page: an empty slot waiting for the next panel.
export function Closing() {
  return (
    <section aria-labelledby="own-card-heading" className="album-linen relative mt-16 overflow-hidden rounded-[20px] border border-[#f5f1e8]/10 px-6 py-12 md:px-14 md:py-16">
      <div className="grid items-center gap-10 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:gap-16">
        <div className="album-wobble relative mx-auto aspect-[3/4] w-[62%] max-w-[260px] md:w-full">
          <EmptySlot label="Your photo here" className="inset-0" />
        </div>
        <div>
          <h2 id="own-card-heading" className={cn(DISPLAY, "!text-[44px] !font-extrabold uppercase !leading-[0.92] text-[#f5f1e8] md:!text-[56px]")}>
            Want your own card?
          </h2>
          <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-[#f5f1e8]/75">Panel elections are held every year. Ask the panel how nominations work.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Magnetic>
              <Link
                href="/contact?topic=other&to=Panel"
                data-haptic
                className="group inline-flex min-h-[52px] items-center gap-2 rounded-full bg-[#3fcfca] px-7 text-base font-semibold text-[#002e2c] transition hover:bg-[#6fe0dc]"
              >
                Ask the panel
                <ArrowRight aria-hidden className="h-5 w-5 transition-transform duration-150 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <Link href="/alumni" className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
              See past panels
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
