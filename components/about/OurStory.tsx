import Image from "next/image";
import { CheckCircle2, Globe } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Eyebrow } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/motion/Reveal";

export function OurStory({
  history,
  heading,
  highlights,
}: {
  history?: string | null;
  heading: string;
  highlights: string[];
}) {
  return (
    <section className="px-4 pb-16">
      <Reveal className="mx-auto max-w-6xl">
        <GlassCard className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow icon={Globe} className="mb-4">
              Our Story
            </Eyebrow>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{heading}</h2>

            {history ? (
              <div
                className="mt-4 space-y-4 text-slate-400 [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: history }}
              />
            ) : (
              // Fallback when the admin history is empty: describes the club without unverifiable claims.
              <div className="mt-4 space-y-4 text-slate-400">
                <p>
                  The NSU Games &amp; Sports Club brings together North South University students who play, compete
                  and organise sport on campus — from football and cricket to basketball and badminton.
                </p>
                <p>
                  We run intra-university tournaments, field squads in inter-university competitions, and welcome
                  players of every skill level.
                </p>
              </div>
            )}

            {highlights.length > 0 && (
              <ul className="mt-6 space-y-3">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
            <Image
              src="/images/about/our-story.png"
              alt="NSU SC athlete at the starting blocks"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}
