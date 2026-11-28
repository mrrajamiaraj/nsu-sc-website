import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import { cn } from "@/lib/utils";

// Closing band: the club's accounts (only those with a real URL) and a photo of where to
// find it. With no accounts set yet, the photo carries the band on its own.
export function FollowVisit({ photo }: { photo: string }) {
  const accounts = CONTACT_EXTRAS.socials.filter((s) => s.url && ["Facebook", "Instagram", "YouTube"].includes(s.label));
  return (
    <section aria-label="Follow and visit" className="border-y border-white/10 bg-[#0f2724]">
      <div className={cn("mx-auto grid max-w-[1200px] gap-10 px-6 py-14 lg:px-8", accounts.length > 0 && "md:grid-cols-2 md:items-center")}>
        {accounts.length > 0 && (
          <div className="order-2 md:order-1">
            <h2 className="text-[28px] !font-extrabold leading-none text-[#f5f1e8]">Follow the club</h2>
            <ul className="mt-6 space-y-2">
              {accounts.map((a) => (
                <li key={a.label}>
                  <a href={a.url!} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 font-display text-[40px] font-extrabold uppercase leading-none text-[#f5f1e8] hover:text-[#3fcfca]">
                    {a.label}
                    <ArrowUpRight aria-hidden className="h-7 w-7 -translate-x-2 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <figure className={cn("order-1 md:order-2", accounts.length === 0 && "md:grid md:grid-cols-12 md:items-center md:gap-10")}>
          <div className={cn("group relative aspect-video overflow-hidden rounded-[10px]", accounts.length === 0 && "md:col-span-7")}>
            <Image src={photo} alt="NSU Games & Sports Club players at North South University" fill sizes="(min-width: 768px) 600px, 100vw" className="object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-[1.02] group-hover:grayscale-0" />
            <span aria-hidden className="absolute inset-0 bg-[#3fcfca] mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0 [opacity:0.45]" />
          </div>
          <figcaption className={cn("mt-3 text-[15px] text-[#f5f1e8]/70", accounts.length === 0 && "md:col-span-5 md:mt-0 md:text-[20px] md:leading-snug md:text-[#f5f1e8]/85")}>
            Find us at NSU, Bashundhara. Drop by on match days.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
