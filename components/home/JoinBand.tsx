import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { btnAccent, btnOutline } from "@/components/home/Hero";
import type { ClubRegistration } from "@/lib/registration";

// Closing call: full-bleed team photo under a heavy overlay. Keeps id="register" for /#register links.
export function JoinBand({ club, photo }: { club: ClubRegistration; photo: string }) {
  return (
    <section
      id="register"
      aria-labelledby="join-heading"
      className="grain relative scroll-mt-24 overflow-hidden py-28 [clip-path:polygon(0_56px,100%_0,100%_100%,0_100%)] sm:py-36"
    >
      <Image src={photo} alt="" fill sizes="100vw" className="object-cover object-[50%_30%]" />
      <div aria-hidden className="absolute inset-0 bg-[#0b2524]/80" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#0b2524] via-[#0b2524]/60 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4">
        <h2 id="join-heading" className="text-[4rem] !font-extrabold leading-[0.85] text-white sm:text-[7rem] lg:text-[8.5rem]">
          Play for NSU.
        </h2>
        <p className="mt-5 max-w-lg text-lg text-slate-200">
          {club.open ? "Sign up and the panel will contact you about trials." : club.body}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {club.formUrl ? (
            <a href={club.formUrl} target="_blank" rel="noopener noreferrer" className={btnAccent}>
              Join the club
              <ArrowRight aria-hidden className="h-5 w-5" />
            </a>
          ) : null}
          <Link href="/contact" className={club.formUrl ? btnOutline : btnAccent}>
            Ask the panel
          </Link>
        </div>
      </div>
    </section>
  );
}
