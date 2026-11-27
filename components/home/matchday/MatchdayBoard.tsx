"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { btnAccent } from "@/components/home/Hero";
import { FlapText, setFlapSound } from "@/components/home/matchday/SplitFlap";
import { PosterStack } from "@/components/home/matchday/PosterStack";
import type { BoardEvent, BoardStatus } from "@/lib/matchday";
import { cn } from "@/lib/utils";

// "Matchday board": a stack of printed event posters beside a split-flap departures-style
// board. One event is active at a time; the board moves on every 7 s unless the visitor is
// hovering or focused on it. Colours are the site's own teal set: deep teal section,
// darker panel, warm-white text and the hero's bright teal as the single accent.

const ADVANCE_MS = 7000;
const STATUS_LABEL: Record<BoardStatus, string> = { live: "Live", upcoming: "Upcoming", finished: "Finished" };

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

function TextLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const className =
    "group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none";
  const inner = (
    <>
      {children}
      <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-[3px] motion-reduce:transition-none" />
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

// ---- Header pieces

// Each word rises out of its own clipped line. The heading triggers it, since the words
// themselves start hidden and would never count as "in view".
const wordRise: Variants = { hidden: { y: "105%" }, shown: { y: "0%", transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] } } };

function WordsUp({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-[0.06em] align-bottom last:mr-0">
          <motion.span className="inline-block" variants={wordRise}>
            {word}
          </motion.span>
        </span>
      ))}
    </>
  );
}

function dhakaTime() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Dhaka" });
}

// HH:MM in Dhaka on flap tiles. Rendered after mount so server and browser agree.
function BoardClock({ still }: { still: boolean }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTime(dhakaTime());
    tick();
    const timer = window.setInterval(tick, 5000);
    return () => window.clearInterval(timer);
  }, []);
  const [hh, mm] = (time ?? "--:--").split(":");
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#f5f1e8]/60">Dhaka</span>
      <time className="flex items-center gap-1 text-[22px]" aria-label={time ? `Dhaka time ${time}` : "Dhaka time"}>
        <FlapText text={hh} cycle={false} still={still} />
        <span aria-hidden className="font-mono font-bold text-[#f5f1e8]/60">:</span>
        <FlapText text={mm} cycle={false} still={still} />
      </time>
    </div>
  );
}

// ---- Details panel

function TrophySketch({ draw }: { draw: boolean }) {
  // A loose, hand-drawn cup that inks itself in.
  const paths = [
    "M7.2 3.6c3.3-.3 6.4-.2 9.7.1-.1 1.9-.1 3.6-.4 5.2-.6 2.6-2.4 4.1-4.6 4.2-2.3 0-4-1.6-4.5-4.1-.3-1.7-.3-3.5-.2-5.4z",
    "M7.3 5.4c-1.5-.2-2.9.1-3 1.4-.1 1.6 1.4 2.9 3.6 3.1",
    "M16.8 5.3c1.5-.3 2.9 0 3 1.3.1 1.7-1.3 3-3.5 3.3",
    "M12 13.2c-.1 1.3 0 2.5.2 3.7",
    "M8.6 20.4c2.3-.4 4.6-.4 7 .1M9.6 17.1c1.6-.2 3.3-.2 4.9 0l.6 3.2",
    "M9.6 17.1l-.9 3.3",
  ];
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-9 w-9 text-[#3fcfca]" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          initial={draw ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.12, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

function Champions({ event, reduce }: { event: BoardEvent; reduce: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <TrophySketch draw={!reduce} />
        <h3 className="font-display text-3xl font-extrabold uppercase leading-none text-[#f5f1e8]">Champions</h3>
      </div>
      {event.champions.length > 0 ? (
        <dl className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {event.champions.map((row, i) => (
            <motion.div
              key={`${row.category}-${i}`}
              initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 0.55, delay: 0.15 + i * 0.08, ease: [0.3, 0.7, 0.2, 1] }}
            >
              <dt className="text-[13px] text-[#f5f1e8]/60">{row.category}</dt>
              <dd className="mt-0.5 break-words font-display text-2xl font-extrabold uppercase leading-tight text-[#f5f1e8]">{row.names}</dd>
            </motion.div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-[15px] text-[#f5f1e8]/70">Results for this event haven&rsquo;t been published yet.</p>
      )}
    </div>
  );
}

function remaining(startsAt: string) {
  const ms = new Date(startsAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  const pad = (v: number) => String(v).padStart(2, "0");
  return [pad(Math.floor(s / 86400)), pad(Math.floor((s % 86400) / 3600)), pad(Math.floor((s % 3600) / 60)), pad(s % 60)];
}

function Countdown({ startsAt, still }: { startsAt: string; still: boolean }) {
  const [parts, setParts] = useState<string[] | null | undefined>(undefined);
  useEffect(() => {
    const tick = () => setParts(remaining(startsAt));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [startsAt]);

  const when = new Date(startsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" });
  if (parts === null) return <p className="font-display text-3xl font-extrabold uppercase text-[#f5f1e8]">Under way</p>;
  const shown = parts ?? ["--", "--", "--", "--"];
  const labels = ["days", "hrs", "min", "sec"];
  return (
    <div>
      <p className="sr-only">Starts {when}</p>
      <div aria-hidden className="flex items-start gap-2 text-[26px] sm:gap-3 sm:text-[34px]">
        {shown.map((value, i) => (
          <div key={labels[i]} className="flex items-start gap-2 sm:gap-3">
            {i > 0 && <span className="pt-[0.15em] font-mono font-bold text-[#f5f1e8]/50">:</span>}
            <div className="flex flex-col items-center gap-1.5">
              <FlapText text={value} cycle={false} still={still} />
              <span className="text-[11px] font-medium tracking-[0.12em] text-[#f5f1e8]/60">{labels[i]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Details({ event, reduce }: { event: BoardEvent; reduce: boolean }) {
  return (
    <div className="flex flex-col gap-5">
      {event.status === "finished" && <Champions event={event} reduce={reduce} />}

      {event.status === "upcoming" && (
        <div className="flex flex-col gap-5">
          <h3 className="font-display text-3xl font-extrabold uppercase leading-none text-[#f5f1e8]">Kick-off in</h3>
          {event.startsAt ? (
            <Countdown startsAt={event.startsAt} still={reduce} />
          ) : (
            <p className="text-[15px] text-[#f5f1e8]/70">The date hasn&rsquo;t been announced yet.</p>
          )}
          {event.registerUrl && (
            <a href={event.registerUrl} target="_blank" rel="noopener noreferrer" className={cn(btnAccent, "self-start")}>
              Register now
              <ArrowRight aria-hidden className="h-5 w-5" />
            </a>
          )}
        </div>
      )}

      {event.status === "live" && (
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-3 font-display text-3xl font-extrabold uppercase leading-none text-[#f5f1e8]">
            <span aria-hidden className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#3fcfca] opacity-70 motion-safe:animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#3fcfca]" />
            </span>
            Live now
          </h3>
          {event.stage && <p className="text-[15px] text-[#f5f1e8]/80">{event.stage}</p>}
          <TextLink href={event.href}>Follow live</TextLink>
        </div>
      )}

      {event.status !== "live" && (
        <div className="border-t border-white/10 pt-2">
          <TextLink href={event.href}>{event.status === "finished" ? "Full results & photos" : "Event details"}</TextLink>
        </div>
      )}
    </div>
  );
}

// ---- Board

export function MatchdayBoard({ events, initial = 0 }: { events: BoardEvent[]; initial?: number }) {
  const reduce = Boolean(useReducedMotion());
  const phone = useMedia("(max-width: 767px)");
  const section = useRef<HTMLElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const entered = useInView(board, { once: true, amount: 0.25 });
  const visible = useInView(section, { amount: 0.1 });

  const [active, setActive] = useState(Math.min(initial, events.length - 1));
  const [round, setRound] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [sound, setSound] = useState(false);
  const hoverTimer = useRef<number | undefined>(undefined);
  const hoverRow = useRef<number | null>(null);
  // How many times each row has become active, so only the newly active row re-flips.
  const [flips, setFlips] = useState<number[]>(() => events.map(() => 0));

  const n = events.length;
  const select = useCallback((index: number) => {
    setActive(index);
    setRound((r) => r + 1);
  }, []);
  const advance = () => setActive((index) => (index + 1) % n);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);
  useEffect(() => setFlapSound(sound), [sound]);
  useEffect(() => {
    setFlips((counts) => counts.map((count, i) => (i === active ? count + 1 : count)));
  }, [active]);

  const autoAdvance = n > 1 && !reduce;
  const paused = hovering || focused || !visible;
  const event = events[active];
  const flapsStill = reduce;

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
  };

  return (
    <section
      ref={section}
      id="matchday"
      aria-labelledby="board-heading"
      className="grain grain-faint relative scroll-mt-24 overflow-hidden bg-[#0d2b2a] py-20 text-[#f5f1e8]"
    >
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <motion.h2
              id="board-heading"
              initial="hidden"
              whileInView="shown"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ staggerChildren: 0.09 }}
              className="text-5xl !font-extrabold uppercase leading-none text-[#f5f1e8] sm:text-[64px]"
            >
              <WordsUp text="Matchday board" />
            </motion.h2>
            <p className="mt-3 text-[15px] text-[#f5f1e8]/60">Everything happening at NSU SC</p>
          </div>
          <div className="flex items-end gap-5">
            <BoardClock still={flapsStill} />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSound((on) => !on)}
                aria-pressed={sound}
                aria-label="Board flip sound"
                title={sound ? "Sound on" : "Sound off"}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-[#f5f1e8]/80 transition hover:bg-white/10 hover:text-[#f5f1e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fcfca]"
              >
                {sound ? <Volume2 aria-hidden className="h-[18px] w-[18px]" /> : <VolumeX aria-hidden className="h-[18px] w-[18px]" />}
              </button>
              <TextLink href="/events">All events</TextLink>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Prints tossed onto the table: drop in from above with a little bounce. */}
          <motion.div
            className="lg:col-span-5 lg:pt-4"
            initial={{ y: -90, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ y: { type: "spring", stiffness: 260, damping: 13 }, opacity: { duration: 0.2 } }}
          >
            <PosterStack events={events} active={active} swipe={phone} onSelect={select} />
            {phone && n > 1 && <p className="mt-6 text-center text-[13px] text-[#f5f1e8]/60">Swipe the poster to change event</p>}
          </motion.div>

          <div className="min-w-0 lg:col-span-7">
            <div
              ref={board}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
              onPointerLeave={() => {
                setHovering(false);
                window.clearTimeout(hoverTimer.current);
              }}
              onFocus={() => setFocused(true)}
              onBlur={onBlur}
              className="overflow-hidden rounded-lg bg-[#0b2524]"
            >
              <ul className="divide-y divide-white/10 [perspective:900px]">
                {events.map((item, i) => {
                  const isActive = i === active;
                  const label = [STATUS_LABEL[item.status], item.dateLabel === "TBA" ? "date to be announced" : item.dateLabel, item.name, item.venue]
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <motion.li
                      key={item.id}
                      initial={{ rotateX: -90, opacity: 0 }}
                      animate={entered ? { rotateX: 0, opacity: 1 } : undefined}
                      transition={{ duration: 0.45, delay: i * 0.12, ease: [0.3, 0.7, 0.3, 1] }}
                      style={{ transformOrigin: "50% 0%" }}
                    >
                      <button
                        type="button"
                        onClick={() => select(i)}
                        // Movement, not enter: a row scrolling under a resting cursor shouldn't switch events.
                        onPointerMove={(e) => {
                          if (e.pointerType !== "mouse" || isActive || hoverRow.current === i) return;
                          hoverRow.current = i;
                          window.clearTimeout(hoverTimer.current);
                          hoverTimer.current = window.setTimeout(() => select(i), 140);
                        }}
                        onPointerLeave={() => {
                          hoverRow.current = null;
                          window.clearTimeout(hoverTimer.current);
                        }}
                        aria-pressed={isActive}
                        aria-controls="matchday-details"
                        aria-label={label}
                        className={cn(
                          "relative flex w-full flex-col gap-2.5 px-4 py-4 text-left transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3fcfca] sm:grid sm:grid-cols-[7.25rem_minmax(0,1fr)] sm:gap-x-5 sm:px-5 sm:py-5",
                          isActive ? "opacity-100" : "opacity-50 hover:opacity-80",
                        )}
                      >
                        <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px] bg-[#3fcfca] transition-opacity", isActive ? "opacity-100" : "opacity-0")} />
                        <span className="flex gap-2 text-[12px] sm:flex-col sm:gap-1.5 sm:text-[13px]">
                          <FlapText text={STATUS_LABEL[item.status]} accent={item.status === "live"} replay={flips[i]} play={entered} still={flapsStill || (phone && !isActive)} delay={i * 120} />
                          <FlapText text={item.dateLabel} replay={flips[i]} play={entered} still={flapsStill || (phone && !isActive)} delay={i * 120 + 90} />
                        </span>
                        <span className="flex min-w-0 flex-col gap-2">
                          <FlapText
                            text={item.name}
                            replay={flips[i]}
                            play={entered}
                            still={flapsStill || (phone && !isActive)}
                            delay={i * 120 + 60}
                            className="text-[14px] sm:text-[17px]"
                          />
                          {item.venue && (
                            <FlapText text={item.venue} play={entered} still={flapsStill || (phone && !isActive)} delay={i * 120 + 180} className="text-[11px] opacity-70 sm:text-[12px]" />
                          )}
                        </span>
                        {isActive && autoAdvance && (
                          <span
                            key={`${active}-${round}`}
                            aria-hidden
                            onAnimationEnd={advance}
                            className="board-progress absolute inset-x-0 bottom-0 h-px bg-[#3fcfca]"
                            style={{ animationDuration: `${ADVANCE_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
                          />
                        )}
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            <div id="matchday-details" className="mt-8 min-h-[12rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  <Details event={event} reduce={reduce} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
