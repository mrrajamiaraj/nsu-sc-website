"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import type { ClubRegistration } from "@/lib/registration";

// Closing band: full-bleed team photo and the two next steps.
export function YourTurn({
  photo,
  club,
  title = "Your turn to play for NSU.",
  secondary = { label: "Talk to the panel", href: "/contact" },
}: {
  photo: string;
  club: ClubRegistration;
  title?: string;
  secondary?: { label: string; href: string };
}) {
  return (
    <section aria-labelledby="your-turn-heading" className="relative mt-28 overflow-hidden">
      <Image src={photo} alt="" fill sizes="100vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0 bg-[#0b2524]/80" />
      <div className="relative mx-auto max-w-[1280px] px-6 py-28 lg:px-8 lg:py-36">
        <h2 id="your-turn-heading" className="max-w-4xl text-[48px] !font-extrabold uppercase leading-[0.92] text-[#f5f1e8] md:text-[96px]">
          {title}
        </h2>
        <p className="mt-6 inline-flex items-center gap-2.5 text-[15px] font-medium text-[#f5f1e8]/85">
          <span aria-hidden className="relative flex h-2.5 w-2.5">
            {club.open && <span className="absolute inline-flex h-full w-full rounded-full bg-[#3fcfca] opacity-70 motion-safe:animate-ping" />}
            <span className={club.open ? "relative inline-flex h-2.5 w-2.5 rounded-full bg-[#3fcfca]" : "relative inline-flex h-2.5 w-2.5 rounded-full bg-[#f5f1e8]/40"} />
          </span>
          {club.open ? "Sign-ups open" : club.status}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {club.formUrl ? (
            <Magnetic>
              <a
                href={club.formUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-haptic
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#3fcfca] px-7 text-[16px] font-semibold text-[#0b2524] transition hover:bg-[#6fe0dc]"
              >
                Join the club
                <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                <span className="sr-only">(opens the sign-up form)</span>
              </a>
            </Magnetic>
          ) : null}
          <Link
            href={secondary.href}
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-[#f5f1e8]/80 px-7 text-[16px] font-semibold text-[#f5f1e8] transition hover:-translate-y-0.5 hover:border-[#f5f1e8] hover:bg-white/10"
          >
            {secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
