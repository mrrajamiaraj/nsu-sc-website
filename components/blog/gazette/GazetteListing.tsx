"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { BackIssues, type BackHandle, type BackState } from "@/components/blog/gazette/BackIssues";
import { FrontPage } from "@/components/blog/gazette/FrontPage";
import type { GazettePost } from "@/lib/blog";
import type { ScoreLine } from "@/lib/gazette";

// The Blog: the Gazette's front page, its back issues, and an invitation to pitch a story.
// The front page's section links filter the back issues below.
export function GazetteListing({ posts, scores, volume, initial }: { posts: GazettePost[]; scores: (ScoreLine & { href: string })[]; volume: number; initial: BackState }) {
  const back = useRef<BackHandle>(null);
  return (
    <>
      <FrontPage posts={posts} scores={scores} volume={volume} onSection={(key) => back.current?.setCategory(key)} />
      <BackIssues ref={back} posts={posts} initial={initial} />

      <section aria-labelledby="pitch-heading" className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6 lg:mt-32 lg:px-8">
        <div className="border-t border-white/15 pt-12 lg:grid lg:grid-cols-12 lg:items-end lg:gap-10 lg:pt-16">
          <div className="lg:col-span-7">
            <h2 id="pitch-heading" className="text-[40px] !font-extrabold leading-[0.95] text-[#f5f1e8] md:text-[56px]">
              Got a story? We&rsquo;re listening.
            </h2>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-[#f5f1e8]/75">Match photos, a player who deserves a spotlight, a result we missed.</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:mt-0 lg:justify-end">
            <Magnetic>
              <Link href="/contact?topic=other#contact-form" data-haptic className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#3fcfca] px-7 text-[16px] font-semibold text-[#002e2c] hover:bg-[#6fe0dc]">
                Pitch a story
                <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <Link href="/contact?topic=events#contact-form" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-[#f5f1e8]/70 px-7 text-[16px] font-semibold text-[#f5f1e8] hover:-translate-y-0.5 hover:border-[#f5f1e8] hover:bg-white/10">
              Share event photos
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
