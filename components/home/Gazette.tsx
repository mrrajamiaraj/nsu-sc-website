"use client";

import Link from "next/link";
import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useReducedMotion, useSpring, type Variants } from "framer-motion";
import { EASE, INK, Kicker, META, PrintedPhoto, Rule, SERIF, Scribble, Wipe, stamp } from "@/components/blog/gazette/print";
import type { ScoreLine } from "@/lib/gazette";
import { cn } from "@/lib/utils";

// "The NSU SC Gazette": the homepage blog section as a newspaper front page lying on the
// dark table of the site. The one light section on the page. Colours are the site's own:
// warm-white paper (#f5f1e8), deep-teal ink (#0b2524) for text and every photo (duotone),
// and one spot colour, dark teal #006663, for kickers and the hand-drawn underline.

export interface GazetteStory {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTimeMinutes: number;
  coverImage: string | null;
  /** Opening paragraph of the article; only the lead story uses it. */
  opening: string | null;
}

function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);
  return matches;
}

const href = (story: GazetteStory) => `/blog/${story.slug}`;
// Newspaper dateline: "Jul 10, 2026" (shown in capitals by the meta style).
const dateline = (iso: string) => new Date(`${iso}T00:00:00+06:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Dhaka" });
const headlineLink =
  "block focus-visible:outline-none decoration-transparent";

// ---- Stories

function LeadStory({ story }: { story: GazetteStory }) {
  return (
    <article className="group flex min-w-0 flex-col lg:col-span-8 lg:pr-10">
      <div className="mt-6 md:mt-0">
        <Kicker>{story.category}</Kicker>
        <Link href={href(story)} className={cn(headlineLink, "mt-3")}>
          <Wipe as="h3" className={cn(SERIF, INK, "text-[34px] font-extrabold leading-[1.04] tracking-[-0.015em] [text-wrap:balance] md:text-[56px]")}>
            {story.title}
          </Wipe>
          <Scribble />
        </Link>
        {story.excerpt && (
          <Wipe as="p" delay={0.2} className={cn(SERIF, "mt-3 text-[19px] italic leading-[1.35] text-[#0b2524]/80 md:text-[22px]")}>
            {story.excerpt}
          </Wipe>
        )}
        <p className={cn(META, "mt-4 text-[#0b2524]/70")}>
          By {story.author} · <time dateTime={story.date}>{dateline(story.date)}</time> · {story.readTimeMinutes} min read
        </p>
      </div>

      <figure className="order-first md:order-none md:mt-6">
        <Link href={href(story)} tabIndex={-1} aria-hidden className="block">
          <PrintedPhoto src={story.coverImage} sizes="(min-width: 1024px) 760px, 100vw" className="aspect-[16/10]" />
        </Link>
        <figcaption className={cn(SERIF, "mt-2 text-[13px] italic text-[#0b2524]/70")}>Photo: NSU Games &amp; Sports Club</figcaption>
      </figure>

      {story.opening ? (
        <p
          className={cn(
            SERIF,
            "mt-6 hyphens-auto text-justify text-[16px] leading-[1.6] text-[#0b2524] [column-gap:2rem] [column-rule:1px_solid_rgba(11,37,36,0.25)] md:columns-2",
            "first-letter:float-left first-letter:mr-2 first-letter:mt-[0.3rem] first-letter:text-[5.4rem] first-letter:font-extrabold first-letter:leading-[0.74]",
          )}
        >
          {story.opening}{" "}
          <Link href={href(story)} className="whitespace-nowrap font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-[#006663] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none">
            Continued → Read the story
          </Link>
        </p>
      ) : (
        <p className="mt-5">
          <Link href={href(story)} className="font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-[#006663] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none">
            Continued → Read the story
          </Link>
        </p>
      )}
    </article>
  );
}

function SideStory({ story }: { story: GazetteStory }) {
  return (
    <article className="group flow-root py-6">
      <Kicker>{story.category}</Kicker>
      <Link href={href(story)} tabIndex={-1} aria-hidden className="float-right mb-2 ml-4 mt-3 block w-1/3">
        <PrintedPhoto src={story.coverImage} sizes="(min-width: 1024px) 120px, 33vw" className="aspect-square" />
      </Link>
      <Link href={href(story)} className={cn(headlineLink, "mt-3")}>
        <Wipe as="h4" className={cn(SERIF, INK, "text-[24px] font-bold leading-[1.1] tracking-[-0.01em] md:text-[26px]")}>
          {story.title}
        </Wipe>
        <Scribble />
      </Link>
      {story.excerpt && <p className={cn(SERIF, "mt-2 line-clamp-2 text-[15px] leading-snug text-[#0b2524]/80")}>{story.excerpt}</p>}
      <p className={cn(META, "mt-2 text-[#0b2524]/70")}>
        <time dateTime={story.date}>{dateline(story.date)}</time>
      </p>
    </article>
  );
}

function Scoreboard({ scores }: { scores: ScoreLine[] }) {
  return (
    <section aria-labelledby="scoreboard-heading" className="mt-4 border border-[#0b2524] p-4">
      <h4 id="scoreboard-heading" className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#0b2524]">
        Scoreboard
      </h4>
      <Rule className="mt-2" delay={0.3} />
      <ul className="mt-3 space-y-2 font-mono text-[12px] leading-snug text-[#0b2524]">
        {scores.map((line) => (
          <li key={line.id}>
            <Link href={`/events/${line.id}`} className="font-bold underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none">
              {line.event}
            </Link>
            <span className="text-[#0b2524]/80"> — {line.result}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---- Section

export function Gazette({
  stories,
  scores,
  today,
  volume,
  blogHref,
  blogLabel,
}: {
  stories: GazetteStory[];
  scores: ScoreLine[];
  /** Server's date line ("Saturday, 28 November 2026"); refreshed in the browser. */
  today: string;
  volume: number;
  blogHref: string;
  blogLabel: string;
}) {
  const reduce = Boolean(useReducedMotion());
  const phone = useMedia("(max-width: 767px)");
  const finePointer = useMedia("(hover: hover) and (pointer: fine)");
  const [dateLine, setDateLine] = useState(today);
  const tiltX = useSpring(0, { stiffness: 120, damping: 20 });
  const tiltY = useSpring(0, { stiffness: 120, damping: 20 });

  useEffect(() => {
    setDateLine(
      new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" }),
    );
  }, []);

  const [lead, ...rest] = stories;
  if (!lead) return null;
  const side = rest.slice(0, 2);
  const tilt = finePointer && !phone && !reduce;
  const resting = phone ? 0 : -0.6;

  // The sheet is tossed onto the table: it slides up and settles from −3° to its resting angle.
  const sheet: Variants = {
    hidden: { y: 140, rotate: phone ? 0 : -3, opacity: 0 },
    shown: {
      y: 0,
      rotate: resting,
      opacity: 1,
      transition: { y: { type: "spring", stiffness: 110, damping: 15 }, rotate: { type: "spring", stiffness: 90, damping: 14 }, opacity: { duration: 0.2 } },
    },
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const box = e.currentTarget.getBoundingClientRect();
    tiltY.set(((e.clientX - box.left) / box.width - 0.5) * 3);
    tiltX.set(-((e.clientY - box.top) / box.height - 0.5) * 3);
  };
  const onLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const title = "The NSU SC Gazette";

  return (
    <section aria-labelledby="gazette-heading" lang="en" className="overflow-hidden bg-[#0b2524] py-20 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8" style={{ perspective: 1200 }} onPointerMove={onMove} onPointerLeave={onLeave}>
        <motion.div
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.12 }}
          variants={sheet}
          style={{ rotateX: tiltX, rotateY: tiltY }}
          className={cn("newsprint relative bg-[#f5f1e8] p-5 md:p-12", INK)}
        >
          {/* The sheet's shadow on the table grows in as it lands. */}
          <motion.span
            aria-hidden
            variants={{ hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.9, delay: 0.15 } } }}
            className="pointer-events-none absolute inset-0 -z-10 shadow-[0_40px_70px_-24px_rgba(0,0,0,0.8),0_12px_24px_-10px_rgba(0,0,0,0.55)]"
          />

          <header>
            <div className={cn(META, "flex flex-wrap justify-between gap-x-6 gap-y-1 text-[11px] md:text-[12px]")}>
              <span>Vol. {volume} · North South University · Dhaka</span>
              <time suppressHydrationWarning>{dateLine}</time>
            </div>
            <Rule className="mt-3" />
            <h2 id="gazette-heading" className="my-3 text-center font-display text-[44px] !font-extrabold uppercase leading-[0.92] tracking-[0.01em] text-[#0b2524] md:my-5 md:text-[72px] lg:text-[96px]">
              <span className="sr-only">{title}</span>
              {/* Letters stamp in one by one; each word stays on one line. */}
              <span aria-hidden>
                {title.split(" ").map((word, w, words) => {
                  const offset = words.slice(0, w).join(" ").length + (w > 0 ? 1 : 0);
                  return (
                    <span key={w} className="inline-block whitespace-nowrap">
                      {Array.from(word).map((char, i) => (
                        <motion.span key={i} custom={offset + i} variants={stamp} className="inline-block">
                          {char}
                        </motion.span>
                      ))}
                      {w < words.length - 1 && <>&nbsp;</>}
                    </span>
                  );
                })}
              </span>
            </h2>
            <Rule delay={0.1} />
            <Rule delay={0.18} className="mt-[3px]" />
            <div className="mt-2 flex justify-end">
              <Link href="/blog" className={cn(META, "font-bold text-[#0b2524] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none")}>
                All stories →
              </Link>
            </div>
          </header>

          <div className="mt-6 grid lg:grid-cols-12 md:mt-8">
            <LeadStory story={lead} />

            {(side.length > 0 || scores.length > 0) && (
              <aside aria-labelledby="also-heading" className="relative mt-10 lg:col-span-4 lg:mt-0 lg:pl-10">
                {/* Column rule between the lead and the sidebar. */}
                <motion.span
                  aria-hidden
                  variants={{ hidden: { scaleY: 0 }, shown: { scaleY: 1, transition: { duration: 0.9, delay: 0.5, ease: EASE } } }}
                  className="absolute inset-y-0 left-0 hidden w-px origin-top bg-[#0b2524]/30 lg:block"
                />
                {side.length > 0 && (
                  <>
                    <Rule delay={0.2} />
                    <h3 id="also-heading" className="py-2 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#0b2524]">
                      Also in this issue
                    </h3>
                    <Rule delay={0.25} />
                    {side.map((story, i) => (
                      <div key={story.id}>
                        {i > 0 && <Rule delay={0.3} className="bg-[#0b2524]/40" />}
                        <SideStory story={story} />
                      </div>
                    ))}
                  </>
                )}
                {scores.length > 0 && <Scoreboard scores={scores} />}
              </aside>
            )}
          </div>

          <footer className="mt-10">
            <Rule delay={0.4} />
            <p className={cn(META, "mt-2 text-right text-[#0b2524]/70")}>
              Continued on{" "}
              <Link href={blogHref} className="font-bold text-[#0b2524] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none">
                {blogLabel}
              </Link>
            </p>
          </footer>
        </motion.div>
      </div>
    </section>
  );
}
