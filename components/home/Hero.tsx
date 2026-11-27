import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { ClubRegistration } from "@/lib/registration";

interface HeroProps {
  /** Admin "org name" (home_badge), shown as the small teal line above the club name. */
  eyebrow: string;
  /** Admin tagline (home_tagline), shown in full under the club name. */
  tagline: string;
  photo: string;
  club: ClubRegistration;
}

// Shared button styles for the homepage: one accent fill, one outline.
export const btnAccent =
  "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#3fcfca] px-7 text-base font-semibold text-[#002e2c] transition hover:bg-[#6fe0dc] active:scale-[0.98] active:bg-[#2fbab5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2524]";
export const btnOutline =
  "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-white/80 px-7 text-base font-semibold text-white transition hover:border-white hover:bg-white/10 active:scale-[0.98] active:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2524]";

// Full-viewport action photo with the club's name low and left, over two dark gradients
// so the text never sits on a busy part of the frame. The bottom edge is cut on a diagonal.
export function Hero({ eyebrow, tagline, photo, club }: HeroProps) {
  return (
    <section className="grain relative -mt-28 flex min-h-[100svh] flex-col justify-end overflow-hidden [clip-path:polygon(0_0,100%_0,100%_calc(100%-56px),0_100%)]">
      <Image
        src={photo}
        alt="A player strikes the ball mid-kick at the NSU Inter Batch Football Tournament"
        fill
        priority
        sizes="100vw"
        // Slightly zoomed toward the action so the photo's own corner watermarks fall outside the frame.
        className="origin-[70%_75%] scale-[1.12] object-cover object-[68%_center] lg:object-[70%_center]"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0b2524] via-[#0b2524]/55 to-[#0b2524]/20" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#0b2524]/85 via-[#0b2524]/30 to-transparent" />

      {/* pt clears the floating navbar (it ends ~72px down) even when the text fills a short phone screen. */}
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-28 sm:pb-32 sm:pt-40">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3fcfca] sm:text-sm">{eyebrow}</p>

        {/* The no-break space keeps "Games &" together, so balanced wrapping splits the name
            evenly ("NSU Games & / Sports Club") instead of leaving "Club" on its own line. */}
        <h1 className="mt-3 text-[clamp(3rem,14vw,4.5rem)] !font-extrabold uppercase leading-[0.88] tracking-[-0.01em] text-white [text-wrap:balance] sm:text-[5.75rem] lg:text-[7.25rem]">
          NSU Games{" "}&amp; Sports Club
        </h1>
        <p className="mt-5 max-w-xl text-lg text-slate-200 [text-wrap:pretty] sm:max-w-2xl sm:text-xl">{tagline}</p>

        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0b2524]/70 px-3.5 py-1.5 text-sm font-medium text-white ring-1 ring-white/15 backdrop-blur-sm">
          <span aria-hidden className="relative flex h-2.5 w-2.5">
            {club.open && <span className="absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-70 motion-safe:animate-ping" />}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${club.open ? "bg-[#4ade80]" : "bg-slate-400"}`} />
          </span>
          {club.open ? "Sign-ups open" : club.status}
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {club.formUrl ? (
            <a href={club.formUrl} target="_blank" rel="noopener noreferrer" className={btnAccent}>
              Join the club
              <ArrowRight aria-hidden className="h-5 w-5" />
            </a>
          ) : (
            <Link href="/contact" className={btnAccent}>
              Ask the panel
              <ArrowRight aria-hidden className="h-5 w-5" />
            </Link>
          )}
          <Link href="/events" className={btnOutline}>
            See what&rsquo;s on
          </Link>
        </div>
      </div>

      <a
        href="#live"
        className="absolute bottom-16 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white sm:flex"
      >
        Scroll
        <ChevronDown aria-hidden className="h-5 w-5 motion-safe:animate-bounce" />
      </a>
    </section>
  );
}
