"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarPlus, Check, Link2, Share2, Trophy } from "lucide-react";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { FlapText } from "@/components/home/matchday/SplitFlap";
import { PosterStack } from "@/components/home/matchday/PosterStack";
import { SportIcon } from "@/components/home/SportIcon";
import { BLUR, SportType, StatusMark, eventHref } from "@/components/events/hub/shared";
import { SPORTS, dateRange, googleCalendarUrl, icsFor, type HubEvent, type SportKey } from "@/lib/events-hub";
import type { BoardEvent } from "@/lib/matchday";
import { cn } from "@/lib/utils";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const PRIMARY =
  "group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#3fcfca] px-7 text-[16px] font-semibold text-[#002e2c] hover:bg-[#6fe0dc]";
const QUIET =
  "inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 px-4 text-[14px] font-semibold text-[#f5f1e8]/85 hover:-translate-y-0.5 hover:border-white/50 hover:text-[#f5f1e8] disabled:opacity-40";

// ---- Countdown: split-flap days / hours / minutes to a moment.

function Countdown({ to, label }: { to: string; label: string }) {
  const reduce = Boolean(useReducedMotion());
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, []);
  const ms = Math.max(0, Date.parse(to) - (now ?? Date.parse(to)));
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const cells = [
    { v: String(d).padStart(2, "0"), u: "Days" },
    { v: String(h).padStart(2, "0"), u: "Hrs" },
    { v: String(m).padStart(2, "0"), u: "Min" },
  ];
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">{label}</p>
      <div className="mt-2 flex gap-4" role="timer" aria-label={`${d} days, ${h} hours, ${m} minutes`}>
        {cells.map((c) => (
          <div key={c.u} className="flex flex-col items-start">
            <FlapText text={c.v} charset="0123456789" play={now !== null} still={reduce} cycle={false} className="text-[32px] md:text-[40px]" />
            <span aria-hidden className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8]/55">
              {c.u}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Calendar and share

function CalendarButtons({ event }: { event: HubEvent }) {
  const [open, setOpen] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}${eventHref(event)}` : eventHref(event);
  const google = googleCalendarUrl(event, url);
  if (!event.start) return null;
  const download = () => {
    const blob = new Blob([icsFor(event, url)], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${event.slug}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="relative">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={QUIET}>
        <CalendarPlus aria-hidden className="h-4 w-4" />
        Add to calendar
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute left-0 top-full z-20 mt-2 flex w-56 flex-col rounded-lg border border-white/15 bg-[#082120] p-1.5 shadow-xl">
            <button type="button" onClick={download} className="rounded-md px-3 py-2 text-left text-[14px] hover:bg-white/10">
              Apple / Outlook (.ics)
            </button>
            {google && (
              <a href={google} target="_blank" rel="noopener noreferrer" className="rounded-md px-3 py-2 text-[14px] hover:bg-white/10">
                Google Calendar
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ShareButton({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}${path}`;
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled: fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <button type="button" onClick={share} className={QUIET} aria-live="polite">
      {copied ? <Check aria-hidden className="h-4 w-4 text-[#3fcfca]" /> : <Share2 aria-hidden className="h-4 w-4" />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

// ---- A) Live

function LiveBoard({ event }: { event: HubEvent }) {
  const router = useRouter();
  // Results come from the admin; refresh the page data every minute while it's on.
  useEffect(() => {
    const t = window.setInterval(() => router.refresh(), 60000);
    return () => window.clearInterval(t);
  }, [router]);
  return (
    <section aria-labelledby="now-heading" className="relative isolate overflow-hidden">
      {event.poster && <Image src={event.poster} alt="" fill priority sizes="100vw" placeholder="blur" blurDataURL={BLUR} className="-z-10 object-cover" />}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071a19] via-[#071a19]/85 to-[#071a19]/40" />
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <StatusMark status="live" className="text-[15px]" />
        <h1 id="now-heading" className="mt-4 max-w-4xl text-[52px] !font-extrabold leading-[0.9] text-[#f5f1e8] md:text-[96px]">
          {event.name}
        </h1>
        <p className="mt-5 text-[17px] text-[#f5f1e8]/80">{[dateRange(event), event.venue].filter(Boolean).join(" · ")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Magnetic>
            <Link href={eventHref(event)} data-haptic className={PRIMARY}>
              Fixtures &amp; results
              <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Magnetic>
          <ShareButton path={eventHref(event)} title={event.name} />
        </div>
      </div>
    </section>
  );
}

// ---- B) Upcoming / registration open

const toBoard = (e: HubEvent): BoardEvent => ({
  id: e.id,
  name: e.name,
  status: "upcoming",
  dateLabel: e.start ? new Date(`${e.start}T00:00:00+06:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "Asia/Dhaka" }).toUpperCase() : "TBA",
  startsAt: e.start ? `${e.start}T00:00:00+06:00` : null,
  venue: e.venue,
  poster: e.poster,
  champions: [],
  registerUrl: e.status === "registration-open" ? e.registration.url : null,
  stage: null,
  href: eventHref(e),
});

function UpcomingBoard({ events }: { events: HubEvent[] }) {
  const [active, setActive] = useState(0);
  const boards = useMemo(() => events.map(toBoard), [events]);
  const e = events[active];
  const open = e.status === "registration-open" && e.registration.url;
  const countdownTo = open && e.registration.closes ? `${e.registration.closes}T23:59:00+06:00` : e.start ? `${e.start}T00:00:00+06:00` : null;
  const hero = useRef<HTMLElement>(null);
  const inView = useInView(hero, { amount: 0.2 });
  return (
    <section ref={hero} aria-labelledby="now-heading" className="mx-auto max-w-[1280px] px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-14">
      <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#3fcfca]/80">Events · What&rsquo;s next</p>
      {events.length > 1 && (
        <div role="tablist" aria-label="Upcoming events" className="mt-4 flex flex-wrap gap-1">
          {events.map((x, i) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn("relative px-3 py-2 font-display text-[20px] font-extrabold uppercase", i === active ? "text-[#3fcfca]" : "text-[#f5f1e8]/55 hover:text-[#f5f1e8]")}
            >
              {x.code}
              {i === active && <motion.span layoutId="now-tab" aria-hidden className="absolute inset-x-3 bottom-0 h-[2px] bg-[#3fcfca]" />}
            </button>
          ))}
        </div>
      )}
      <div className="mt-8 grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <PosterStack events={boards} active={active} swipe onSelect={setActive} />
        </div>
        <div className="lg:col-span-7">
          <StatusMark status={e.status} />
          <h1 id="now-heading" className="mt-3 text-[48px] !font-extrabold leading-[0.9] text-[#f5f1e8] md:text-[80px]">
            {e.name}
          </h1>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-[15px] sm:grid-cols-3">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/50">Dates</dt>
              <dd className="mt-1 text-[#f5f1e8]">{dateRange(e) ?? "To be announced"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/50">Venue</dt>
              <dd className="mt-1 text-[#f5f1e8]">{e.venue ?? "To be announced"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/50">Sport</dt>
              <dd className="mt-1">
                <SportType event={e} className="text-[14px] normal-case tracking-normal" />
              </dd>
            </div>
          </dl>
          {countdownTo && (
            <div className="mt-8">
              <Countdown to={countdownTo} label={open && e.registration.closes ? "Registration closes in" : "Starts in"} />
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {open ? (
              <Magnetic>
                <a href={e.registration.url!} target="_blank" rel="noopener noreferrer" data-haptic className={PRIMARY}>
                  Register now
                  <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Magnetic>
            ) : (
              <Link href={eventHref(e)} className={PRIMARY}>
                Event details
                <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            <CalendarButtons event={e} />
            <ShareButton path={eventHref(e)} title={e.name} />
          </div>
        </div>
      </div>
      {/* Phones: a sticky Register bar while the board is on screen. */}
      {open && inView && (
        <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
          <a href={e.registration.url!} target="_blank" rel="noopener noreferrer" className={cn(PRIMARY, "w-full shadow-xl")}>
            Register for {e.code}
            <ArrowRight aria-hidden className="h-5 w-5" />
          </a>
        </div>
      )}
    </section>
  );
}

// ---- C) Off-season

function Whistle({ play }: { play: boolean }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="h-12 w-12 text-[#3fcfca]">
      <motion.g animate={play ? { rotate: [0, -12, 10, -6, 0] } : undefined} transition={{ duration: 0.6 }} style={{ originX: "50%", originY: "50%" }}>
        <path d="M8 22a10 10 0 1 0 20 0v-4h14v-6H18a10 10 0 0 0-10 10z" fill="currentColor" />
        <circle cx="18" cy="22" r="4" fill="#0b2524" />
      </motion.g>
      {play &&
        [0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d={`M${34 + i * 4} ${6 - i} q3 -3 6 0`}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: [0, 1, 0], y: -4 }}
            transition={{ duration: 0.9, delay: 0.1 * i, repeat: 1 }}
          />
        ))}
    </svg>
  );
}

// "Notify me": no sign-up list exists yet, so this writes the request as an email to the club.
function NotifyMe({ email }: { email: string }) {
  const [contact, setContact] = useState("");
  const [sports, setSports] = useState<SportKey[]>([]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const toggle = (k: SportKey) => setSports((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = contact.trim();
    if (!/@|\d{6,}/.test(value.replace(/[\s-]/g, ""))) {
      setError(true);
      return;
    }
    const names = SPORTS.filter((s) => sports.includes(s.key)).map((s) => s.label);
    const body = [`Please let me know when the next event is announced.`, `Contact: ${value}`, names.length ? `Sports: ${names.join(", ")}` : null].filter(Boolean).join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent("Notify me: next NSUSC event")}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div key="sent" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex items-center gap-4">
          <Whistle play />
          <div>
            <p className="text-[20px] font-semibold text-[#f5f1e8]">Nearly there.</p>
            <p className="text-[15px] text-[#f5f1e8]/70">Send the email that just opened and you&rsquo;re on the list.</p>
          </div>
        </motion.div>
      ) : (
        <motion.form key="form" noValidate onSubmit={submit} exit={{ opacity: 0 }} className="mt-8">
          <label htmlFor="notify-contact" className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">
            Email or WhatsApp number
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="notify-contact"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                setError(false);
              }}
              aria-invalid={error || undefined}
              aria-describedby={error ? "notify-error" : undefined}
              placeholder="you@northsouth.edu or 01XXXXXXXXX"
              className={cn(
                "min-h-[52px] flex-1 rounded-full border bg-[#071a19] px-5 text-[16px] text-[#f5f1e8] placeholder:text-[#f5f1e8]/35 focus:outline-none",
                error ? "border-[#f87171]" : "border-white/20 focus:border-[#3fcfca]",
              )}
            />
            <Magnetic>
              <button type="submit" data-haptic className={PRIMARY}>
                Notify me
                <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Magnetic>
          </div>
          {error && (
            <p id="notify-error" className="mt-2 text-[14px] text-[#f87171]">
              Add an email address or a phone number.
            </p>
          )}
          <fieldset className="mt-5">
            <legend className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">Sports you&rsquo;d play (optional)</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPORTS.map((s) => {
                const on = sports.includes(s.key);
                return (
                  <button
                    key={s.key}
                    type="button"
                    aria-pressed={on}
                    title={s.label}
                    onClick={() => toggle(s.key)}
                    className={cn("group flex h-11 w-11 items-center justify-center rounded-xl border", on ? "border-[#3fcfca] bg-[#3fcfca]/10 text-[#3fcfca]" : "border-white/15 text-[#f5f1e8]/60 hover:border-white/40 hover:text-[#f5f1e8]")}
                  >
                    <SportIcon aria-hidden sport={s.icon} className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="sr-only">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function OffSeason({ last, next, email }: { last: HubEvent | null; next: { month: number; code: string; name: string; slug: string }[]; email: string }) {
  return (
    <section aria-labelledby="now-heading" className="mx-auto max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-16">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#3fcfca]/80">Events</p>
          <h1 id="now-heading" className="mt-4 text-[60px] !font-extrabold leading-[0.88] text-[#f5f1e8] md:text-[96px]">
            Off-season.
          </h1>
          <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-[#f5f1e8]/70">The panel is planning the next one. Be the first to know.</p>
          <NotifyMe email={email} />
        </div>
        <div className="flex flex-col gap-8 lg:col-span-5">
          {last && (
            <Link href={eventHref(last)} data-cursor="view" className="group grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-y border-white/10 py-5 hover:bg-white/[0.03]">
              <span className="relative block aspect-[4/5] overflow-hidden rounded-md bg-[#0f302e]">
                {last.poster && <Image src={last.poster} alt="" fill sizes="112px" placeholder="blur" blurDataURL={BLUR} className="object-cover transition-transform duration-300 group-hover:scale-105" />}
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/50">Last up · {dateRange(last)}</span>
                <span className="mt-1 block font-display text-[26px] font-extrabold uppercase leading-[0.95] text-[#f5f1e8] group-hover:text-[#3fcfca]">{last.name}</span>
                {last.champions.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-[14px] text-[#f5f1e8]/80">
                    {last.champions.slice(0, 3).map((c) => (
                      <li key={`${c.category}-${c.names}`} className="flex items-start gap-1.5">
                        <Trophy aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3fcfca]" />
                        <span>
                          {c.names}
                          {c.category && <span className="text-[#f5f1e8]/50"> · {c.category}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[#3fcfca]">
                  Results &amp; photos <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          )}
          {next.length > 0 && (
            <div>
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">What usually happens next</h2>
              <ol className="mt-3 divide-y divide-white/10 border-y border-white/10">
                {next.map((n) => (
                  <li key={n.code}>
                    <Link href={`/events/${n.slug}`} className="group flex items-baseline gap-4 py-3 hover:bg-white/[0.03]">
                      <span className="w-12 shrink-0 font-display text-[22px] font-extrabold uppercase text-[#3fcfca]">{MONTHS[n.month].slice(0, 3)}</span>
                      <span className="min-w-0 flex-1 text-[15px] text-[#f5f1e8] group-hover:text-[#3fcfca]">{n.name}</span>
                      <Link2 aria-hidden className="h-4 w-4 shrink-0 text-[#f5f1e8]/30 group-hover:text-[#3fcfca]" />
                    </Link>
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-[12px] text-[#f5f1e8]/45">Based on when past editions were held. Dates for the next ones aren&rsquo;t set.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// The page's top: whatever the season calls for, decided from the dates on the server.
export function NowBoard({ events, typical, today, email }: { events: HubEvent[]; typical: { month: number; code: string; name: string; slug: string }[]; today: string; email: string }) {
  const live = events.find((e) => e.status === "live");
  const upcoming = events.filter((e) => e.status === "upcoming" || e.status === "registration-open").sort((a, b) => (a.start ?? "9").localeCompare(b.start ?? "9"));
  if (live) return <LiveBoard event={live} />;
  if (upcoming.length) return <UpcomingBoard events={upcoming} />;
  const month = Number(today.slice(5, 7)) - 1;
  const next = [...typical.filter((t) => t.month > month), ...typical.filter((t) => t.month <= month)].slice(0, 3);
  const last = events.find((e) => e.status === "finished" && e.start && !e.yearOnly) ?? null;
  return <OffSeason last={last} next={next} email={email} />;
}
