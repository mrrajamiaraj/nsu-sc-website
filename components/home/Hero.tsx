import Image from "next/image";
import { ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

interface HeroProps {
  tagline: string;
  videoSrc?: string | null;
  posterImage?: string | null;
}

// Right-hand showcase box — sized 1290:1080 per spec. Plays a video when
// videoSrc is set (swap in later, e.g. a highlight reel), otherwise falls
// back to the same gradient + icon placeholder pattern used elsewhere.
function HeroShowcase({ videoSrc, posterImage }: { videoSrc?: string | null; posterImage?: string | null }) {
  return (
    <Reveal delay={0.2} className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="glass-panel relative aspect-[1290/1080] w-full overflow-hidden">
        {videoSrc ? (
          <video
            src={videoSrc}
            poster={posterImage ?? undefined}
            controls
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-brand-gradient">
            {posterImage && (
              <Image src={posterImage} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            )}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand-gradient shadow-glow ring-4 ring-white/20">
              <Trophy className="h-10 w-10 text-night-950" strokeWidth={1.75} />
            </div>
          </div>
        )}

        <div className="glass-panel absolute right-4 top-4 px-4 py-3 text-right">
          <p className="text-xl font-bold text-white">8+</p>
          <p className="text-xs text-slate-300">Championships</p>
        </div>

        <div className="glass-panel absolute bottom-4 left-4 flex items-center gap-2.5 px-4 py-2.5">
          <span className="h-8 w-8 shrink-0 rounded-full bg-teal-400" />
          <p className="text-xs font-medium leading-tight text-white">
            Top Rated
            <br />
            Sports Club
          </p>
        </div>
      </div>
    </Reveal>
  );
}

export function Hero({ tagline, videoSrc, posterImage }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:pb-28 sm:pt-16">
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="text-center lg:text-left">
          <Reveal y={16}>
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 lg:mx-0">
              <Trophy className="h-3.5 w-3.5 text-amber-300" />
              North South University
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
              NSU <span className="text-gradient-brand">Games and Sports Club</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-slate-400 sm:text-xl lg:mx-0">{tagline}</p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button href="/events" size="lg">
                Explore Events
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/teams" variant="secondary" size="lg">
                Meet the Teams
              </Button>
            </div>
          </Reveal>
        </div>

        <HeroShowcase videoSrc={videoSrc} posterImage={posterImage} />
      </div>
    </section>
  );
}
