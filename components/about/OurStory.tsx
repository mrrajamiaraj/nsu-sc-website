import Image from "next/image";
import { CheckCircle2, Globe } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              Our Story
            </div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{heading}</h2>

            {history ? (
              <div
                className="mt-4 space-y-4 text-slate-400 [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: history }}
              />
            ) : (
              <div className="mt-4 space-y-4 text-slate-400">
                <p>
                  Founded in 1992, the NSU Games &amp; Sports Club has been at the forefront of promoting athletic
                  excellence and healthy competition among students at North South University. We believe that sports
                  are not just about winning — they&rsquo;re about building character, fostering teamwork, and
                  creating lifelong memories.
                </p>
                <p>
                  Our club provides a platform for students to pursue their athletic passions while maintaining
                  academic excellence. From football to cricket, basketball to badminton, we offer a diverse range of
                  sports programs designed to cater to all skill levels.
                </p>
                <p>
                  Over the past three decades, we&rsquo;ve produced countless champions, hosted numerous
                  inter-university tournaments, and created a vibrant sports culture that defines the NSU experience.
                  Join us and become part of this winning legacy.
                </p>
              </div>
            )}

            <ul className="mt-6 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
            <Image
              src="/images/about/our-story.png"
              alt="NSU SC athlete at the starting blocks"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="glass-panel absolute bottom-4 right-4 px-5 py-3 text-center">
              <p className="text-2xl font-bold text-blue-300">#1</p>
              <p className="text-sm font-semibold text-white">Sports Club</p>
              <p className="text-xs text-slate-300">in Bangladesh Universities</p>
            </div>
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}
