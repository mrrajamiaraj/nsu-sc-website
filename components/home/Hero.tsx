import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/format";
import type { RegistrationSettings } from "@/lib/types";

interface HeroProps {
  tagline: string;
  orgName: string;
  videoSrc?: string | null;
  registration: RegistrationSettings;
}

// Recognizes youtube.com/watch, youtu.be, youtube.com/shorts, and youtube.com/embed links
// and pulls out the 11-char video id so they can be rendered via the embed iframe instead
// of the native <video> tag (which can't play a YouTube page URL).
function getYoutubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

// Right-hand showcase box (1290:1080). Plays the admin's video when set,
// otherwise shows the club crest.
function HeroShowcase({ videoSrc }: { videoSrc?: string | null }) {
  const youtubeVideoId = videoSrc ? getYoutubeVideoId(videoSrc) : null;

  return (
    <Reveal delay={0.2} className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="glass-panel relative aspect-[1290/1080] w-full overflow-hidden">
        {youtubeVideoId ? (
          <iframe
            // loop=1 only loops when paired with playlist set to the same video id.
            // mute=1 is required for autoplay to be allowed by browsers.
            // controls=0 + modestbranding=1 + rel=0 strip the YouTube chrome (channel name,
            // title bar, expand button) so it reads as a plain background clip.
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}&controls=0&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3`}
            title="Showcase video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            // pointer-events-none stops clicks on the video from toggling pause — it's
            // decorative background footage, not a player the visitor controls.
            className="pointer-events-none h-full w-full"
          />
        ) : videoSrc ? (
          <video
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            className="pointer-events-none h-full w-full object-cover"
          />
        ) : (
          <div className="photo-backdrop flex h-full w-full items-center justify-center">
            <Image
              src="/images/branding/nsu-sc-logo.png"
              alt="NSU Games and Sports Club crest"
              width={320}
              height={320}
              priority
              className="relative h-1/2 w-auto object-contain drop-shadow-[0_0_40px_rgba(45,212,191,0.25)]"
            />
          </div>
        )}
      </div>
    </Reveal>
  );
}

function RegistrationStatus({ registration }: { registration: RegistrationSettings }) {
  const registerHref = registration.googleFormUrl ?? "/#register";
  const external = Boolean(registration.googleFormUrl);

  return (
    <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
      <span className="inline-flex items-center gap-2">
        <span
          className={
            registration.isOpen ? "h-2 w-2 animate-pulse rounded-full bg-green-400" : "h-2 w-2 rounded-full bg-slate-500"
          }
        />
        {registration.isOpen
          ? "Registration is open"
          : registration.nextIntakeDate
            ? `Registration is closed · next intake ${formatDate(registration.nextIntakeDate)}`
            : "Registration is closed"}
      </span>
      {registration.isOpen && (
        <Link
          href={registerHref}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="tap-target inline-flex items-center gap-1 font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Register
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </p>
  );
}

export function Hero({ tagline, orgName, videoSrc, registration }: HeroProps) {
  return (
    <section className="relative px-4 pb-16 pt-10 sm:pb-20 sm:pt-16">
      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <Reveal y={16}>
            <p className="mb-5 font-mono text-xs font-medium uppercase tracking-[0.16em] text-blue-400">{orgName}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl">
              NSU Games <span className="text-gradient-brand">&amp; Sports Club</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-balance text-lg text-slate-400 sm:text-xl">{tagline}</p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/events" size="lg">
                See what&rsquo;s on
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/teams" variant="secondary" size="lg">
                Browse the teams
              </Button>
            </div>
            <RegistrationStatus registration={registration} />
          </Reveal>
        </div>

        <HeroShowcase videoSrc={videoSrc} />
      </div>
    </section>
  );
}
