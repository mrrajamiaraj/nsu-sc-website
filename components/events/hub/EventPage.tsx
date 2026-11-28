"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Download, MapPin, Medal, Trophy, X } from "lucide-react";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { BLUR, SportType, StatusMark, eventHref } from "@/components/events/hub/shared";
import { ShareButton } from "@/components/events/hub/NowBoard";
import { dateRange, sportLabel, type HubEvent } from "@/lib/events-hub";
import { cn } from "@/lib/utils";

type Tab = "overview" | "results" | "gallery";
const TAB_LABEL: Record<Tab, string> = { overview: "Overview", results: "Results", gallery: "Gallery" };

// ---- Lightbox

function Lightbox({ photos, index, captions, name, onIndex, onClose }: { photos: string[]; index: number; captions: Record<string, string>; name: string; onIndex: (i: number) => void; onClose: () => void }) {
  const reduce = Boolean(useReducedMotion());
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipe = useRef<number | null>(null);
  const src = photos[index];
  const go = useCallback((by: number) => onIndex((index + by + photos.length) % photos.length), [index, photos.length, onIndex]);
  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "Tab") {
      e.preventDefault();
      closeRef.current?.focus();
    }
  };
  const down = (e: ReactPointerEvent) => {
    if (e.pointerType === "touch") swipe.current = e.clientX;
  };
  const up = (e: ReactPointerEvent) => {
    if (swipe.current === null) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${name} photos`} onKeyDown={onKey} className="contact-page fixed inset-0 z-[170] flex flex-col bg-[#050f0e]/95 text-[#f5f1e8] [font-family:var(--font-home),system-ui,sans-serif]">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-[13px] tabular-nums text-[#f5f1e8]/70">
          {index + 1} / {photos.length}
        </p>
        <div className="flex gap-2">
          <a href={src} download target="_blank" rel="noopener noreferrer" aria-label="Download photo" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 hover:bg-white/10">
            <Download aria-hidden className="h-4 w-4" />
          </a>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close photos" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 touch-pan-y" onPointerDown={down} onPointerUp={up}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0.1 : 0.2 }}>
            <Image src={src} alt={captions[src] ?? `${name}, photo ${index + 1}`} fill sizes="100vw" className="object-contain" />
          </motion.div>
        </AnimatePresence>
        {photos.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 hover:bg-black/60">
              <ArrowLeft aria-hidden className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 hover:bg-black/60">
              <ArrowRight aria-hidden className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {captions[src] && <p className="px-4 py-3 text-center text-[14px] text-[#f5f1e8]/75">{captions[src]}</p>}
    </div>,
    document.body,
  );
}

// ---- Pieces

function Podium({ event }: { event: HubEvent }) {
  if (!event.champions.length && !event.runnersUp.length && !event.bestPlayer) return <p className="text-[16px] text-[#f5f1e8]/60">Results for this event haven&rsquo;t been published.</p>;
  const cats = Array.from(new Set([...event.champions, ...event.runnersUp].map((c) => c.category ?? "")));
  return (
    <div className="flex flex-col gap-8">
      {cats.map((cat) => {
        const first = event.champions.find((c) => (c.category ?? "") === cat);
        const second = event.runnersUp.find((c) => (c.category ?? "") === cat);
        return (
          <div key={cat || "all"}>
            {cat && <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">{cat}</h3>}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {first && (
                <div className="flex items-center gap-4 border-l-2 border-[#3fcfca] bg-[#0f302e] px-5 py-4">
                  <Trophy aria-hidden className="h-7 w-7 shrink-0 text-[#3fcfca]" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3fcfca]">Champions</p>
                    <p className="font-display text-[28px] font-extrabold uppercase leading-none text-[#f5f1e8]">{first.names}</p>
                  </div>
                </div>
              )}
              {second && (
                <div className="flex items-center gap-4 border-l-2 border-[#f5f1e8]/40 bg-[#0f302e]/60 px-5 py-4">
                  <Medal aria-hidden className="h-7 w-7 shrink-0 text-[#f5f1e8]/70" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/60">Runners-up</p>
                    <p className="font-display text-[24px] font-extrabold uppercase leading-none text-[#f5f1e8]/90">{second.names}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {event.bestPlayer && (
        <p className="text-[16px] text-[#f5f1e8]">
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">Player of the tournament · </span>
          {event.bestPlayer}
        </p>
      )}
      {event.prizes.length > 0 && <p className="text-[15px] text-[#f5f1e8]/70">Prizes: {event.prizes.join(" · ")}</p>}
    </div>
  );
}

function RegisterPanel({ event }: { event: HubEvent }) {
  if (event.status !== "registration-open" || !event.registration.url) return null;
  return (
    <aside className="border border-[#3fcfca]/40 bg-[#0f302e] p-5 lg:sticky lg:top-28">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3fcfca]">Registration open</p>
      {event.registration.closes && <p className="mt-2 text-[15px] text-[#f5f1e8]">Closes {dateRange({ start: event.registration.closes, end: null, yearOnly: false })}</p>}
      <Magnetic className="mt-4 w-full">
        <a href={event.registration.url} target="_blank" rel="noopener noreferrer" data-haptic className="group inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#3fcfca] px-6 text-[16px] font-semibold text-[#002e2c] hover:bg-[#6fe0dc]">
          Register now
          <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </a>
      </Magnetic>
    </aside>
  );
}

// ---- Page

export function EventPage({ event, prev, next, more, initialTab }: { event: HubEvent; prev: HubEvent | null; next: HubEvent | null; more: HubEvent[]; initialTab: string | null }) {
  const photos = Array.from(new Set([...event.gallery, ...(event.poster && !event.gallery.length ? [event.poster] : [])]));
  const tabs = (["overview", "results", "gallery"] as Tab[]).filter((t) => (t === "gallery" ? photos.length > 0 : true));
  const [tab, setTab] = useState<Tab>(tabs.includes(initialTab as Tab) ? (initialTab as Tab) : "overview");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const touched = useRef(false);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!touched.current) return;
    const url = new URL(window.location.href);
    if (tab === "overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", tab);
    window.history.replaceState(window.history.state, "", url);
  }, [tab]);
  const pick = (t: Tab) => {
    touched.current = true;
    setTab(t);
  };
  const onTabKey = (e: ReactKeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = tabs.indexOf(tab);
    const t = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    pick(t);
    tabRefs.current[t]?.focus();
  };
  const maps = event.venue ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue}, North South University, Dhaka`)}` : null;

  return (
    <article>
      {/* Hero: cover photo, code wordmark and the facts. */}
      <header className="relative isolate overflow-hidden">
        {event.poster && <Image src={event.poster} alt="" fill priority sizes="100vw" placeholder="blur" blurDataURL={BLUR} className="-z-10 object-cover" />}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b2524] via-[#0b2524]/80 to-[#0b2524]/45" />
        <div className="mx-auto max-w-[1280px] px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
          <Link href="/events" className="group inline-flex min-h-[40px] items-center gap-2 text-[14px] font-medium text-[#f5f1e8]/75 hover:text-[#f5f1e8]">
            <ArrowLeft aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            All events
          </Link>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <SportType event={event} />
            <StatusMark status={event.status} />
          </div>
          <p aria-hidden className="mt-3 font-display text-[72px] font-extrabold uppercase leading-[0.82] text-[#f5f1e8] md:text-[120px]">
            {event.code}
          </p>
          <h1 className="mt-3 max-w-3xl text-[28px] !font-extrabold leading-[1] text-[#3fcfca] md:text-[40px]">{event.name}</h1>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[15px]">
            {dateRange(event) && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">Dates</dt>
                <dd className="mt-1 text-[#f5f1e8]">{dateRange(event)}</dd>
              </div>
            )}
            {event.venue && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">Venue</dt>
                <dd className="mt-1">
                  <a href={maps!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#f5f1e8] underline decoration-[#3fcfca]/50 underline-offset-4 hover:text-[#3fcfca]">
                    <MapPin aria-hidden className="h-4 w-4" />
                    {event.venue}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">Organised by</dt>
              <dd className="mt-1 text-[#f5f1e8]">{event.type === "inter-university" ? "Played by NSU" : "NSU Games & Sports Club"}</dd>
            </div>
            {event.teams && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">Teams</dt>
                <dd className="mt-1 text-[#f5f1e8]">{event.teams}</dd>
              </div>
            )}
          </dl>
          <div className="mt-6">
            <ShareButton path={eventHref(event)} title={event.name} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div role="tablist" aria-label="Event sections" onKeyDown={onTabKey} className="no-scrollbar sticky top-[84px] z-30 -mx-4 flex gap-6 overflow-x-auto border-b border-white/10 bg-[#0b2524]/92 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {tabs.map((t) => (
            <button
              key={t}
              ref={(el) => {
                tabRefs.current[t] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              tabIndex={tab === t ? 0 : -1}
              onClick={() => pick(t)}
              className={cn("relative shrink-0 py-4 text-[15px] font-semibold", tab === t ? "text-[#3fcfca]" : "text-[#f5f1e8]/65 hover:text-[#f5f1e8]")}
            >
              {TAB_LABEL[t]}
              {t === "gallery" && <span className="ml-1.5 tabular-nums opacity-60">{photos.length}</span>}
              {tab === t && <motion.span layoutId="event-tab" aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#3fcfca]" />}
            </button>
          ))}
        </div>

        <div className="grid gap-10 pt-10 lg:grid-cols-12">
          <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className={cn(event.status === "registration-open" ? "lg:col-span-8" : "lg:col-span-12")}>
            {tab === "overview" && (
              <div className="grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  {event.description ? <p className="max-w-[64ch] whitespace-pre-line text-[17px] leading-[1.75] text-[#f5f1e8]/85">{event.description}</p> : <p className="text-[#f5f1e8]/60">No write-up yet.</p>}
                </div>
                {(event.champions.length > 0 || event.bestPlayer) && (
                  <div className="lg:col-span-5">
                    <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">Result</h2>
                    <div className="mt-4">
                      <Podium event={event} />
                    </div>
                    <button type="button" onClick={() => pick("results")} className="mt-4 min-h-[44px] text-[14px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
                      Full results →
                    </button>
                  </div>
                )}
              </div>
            )}
            {tab === "results" && <Podium event={event} />}
            {tab === "gallery" && (
              <ul className="columns-2 gap-3 md:columns-3 lg:columns-4">
                {photos.map((src, i) => (
                  <li key={src} className="mb-3 break-inside-avoid">
                    <button type="button" data-cursor="view" onClick={() => setLightbox(i)} aria-label={`Open photo ${i + 1} of ${photos.length}`} className="group relative block w-full overflow-hidden rounded-md bg-[#0f302e]">
                      <Image src={src} alt={event.captions[src] ?? ""} width={600} height={i % 3 === 0 ? 800 : 450} sizes="(min-width: 1024px) 300px, 50vw" placeholder="blur" blurDataURL={BLUR} className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {event.status === "registration-open" && (
            <div className="lg:col-span-4">
              <RegisterPanel event={event} />
            </div>
          )}
        </div>

        {/* Previous / next and more of the same sport. */}
        <nav aria-label="More events" className="mt-20 grid gap-3 border-t border-white/10 pt-8 md:grid-cols-2">
          {[prev, next].map((e, i) =>
            e ? (
              <Link key={e.id} href={eventHref(e)} className={cn("group flex min-h-[88px] flex-col justify-center border border-white/10 px-5 py-4 hover:border-[#3fcfca]/50 hover:bg-white/[0.03]", i === 1 && "md:items-end md:text-right")}>
                <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">{i === 0 ? "← Newer" : "Older →"}</span>
                <span className="mt-1 font-display text-[24px] font-extrabold uppercase leading-none text-[#f5f1e8] group-hover:text-[#3fcfca]">
                  {e.year ? `${e.year} · ` : ""}
                  {e.name}
                </span>
              </Link>
            ) : (
              <span key={i} />
            ),
          )}
        </nav>
        {more.length > 0 && (
          <section aria-labelledby="more-heading" className="mt-16">
            <h2 id="more-heading" className="text-[32px] !font-extrabold leading-none text-[#f5f1e8] md:text-[40px]">
              More {sportLabel(more[0].sport)?.toLowerCase() ?? ""} events
            </h2>
            <ul className="no-scrollbar mt-6 flex snap-x gap-4 overflow-x-auto pb-2">
              {more.map((e) => (
                <li key={e.id} className="w-[220px] shrink-0 snap-start">
                  <Link href={eventHref(e)} data-cursor="view" className="group block">
                    <span className="relative block aspect-[4/5] overflow-hidden rounded-lg bg-[#0f302e]">
                      {e.poster && <Image src={e.poster} alt="" fill sizes="220px" placeholder="blur" blurDataURL={BLUR} className="object-cover grayscale transition duration-300 group-hover:scale-105 group-hover:grayscale-0" />}
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#071a19] to-transparent" />
                      <span className="absolute bottom-3 left-3 font-display text-[40px] font-extrabold uppercase leading-none text-[#f5f1e8]">{e.code}</span>
                    </span>
                    <span className="mt-2 block text-[14px] font-medium text-[#f5f1e8] group-hover:text-[#3fcfca]">{e.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {lightbox !== null && <Lightbox photos={photos} index={lightbox} captions={event.captions} name={event.name} onIndex={setLightbox} onClose={() => setLightbox(null)} />}
    </article>
  );
}
