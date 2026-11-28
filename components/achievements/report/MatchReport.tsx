"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMotionValue, useSpring } from "framer-motion";
import { SportIcon } from "@/components/home/SportIcon";
import { anton } from "@/components/achievements/report/fonts";
import { Congrats } from "@/components/achievements/report/Congrats";
import { FactSheet } from "@/components/achievements/report/FactSheet";
import { Lightbox } from "@/components/achievements/report/Lightbox";
import { CtaStrip, MoreWins } from "@/components/achievements/report/MoreWins";
import { People } from "@/components/achievements/report/People";
import { Poster } from "@/components/achievements/report/Poster";
import { Story } from "@/components/achievements/report/Story";
import { TopBar } from "@/components/achievements/report/TopBar";
import { ANTON, ReportNavProvider, typingIn } from "@/components/achievements/report/shared";
import type { ReportData } from "@/lib/report";
import { TYPE_LABEL, sportKey } from "@/lib/trophy";
import { cn } from "@/lib/utils";

const BAR_HEIGHT = 56;
export const TROPHY_QUERY_KEY = "nsusc:trophy-query";

// "Match report": one achievement as a sports-magazine feature. Rendered on the server as the
// full page at /achievements/<slug>, and inside the trophy room's story overlay (`mode="overlay"`,
// where previous / next swap the story in place and Esc or "Trophy room" close it).
export function MatchReport({ data, mode, onGo, onClose }: { data: ReportData; mode: "page" | "overlay"; onGo?: (id: string) => void; onClose?: () => void }) {
  const router = useRouter();
  const { entry } = data;
  const root = useRef<HTMLDivElement>(null);
  const article = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [photo, setPhoto] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [crumbs, setCrumbs] = useState(false);
  const [origin, setOrigin] = useState("");
  const [backHref, setBackHref] = useState("/achievements");
  const rawProgress = useMotionValue(0);
  const progress = useSpring(rawProgress, { stiffness: 220, damping: 32, restDelta: 0.001 });

  const overlay = mode === "overlay";
  const url = `${origin}${data.href}`;
  const photos = data.photos.map((p) => p.src);
  const firstTag = entry.tags[0];

  useEffect(() => setOrigin(window.location.origin), []);

  // The full page's back link returns to the room with the filters the visitor left it on.
  useEffect(() => {
    if (overlay) return;
    try {
      const q = window.sessionStorage.getItem(TROPHY_QUERY_KEY);
      if (q) setBackHref(`/achievements${q}`);
    } catch {
      /* storage blocked: plain link */
    }
  }, [overlay]);

  // New story: back to the first photo, and (in the overlay) back to the top.
  useEffect(() => {
    setPhoto(0);
    setLightbox(false);
    if (overlay) root.current?.closest<HTMLElement>("[role='dialog']")?.scrollTo({ top: 0 });
  }, [entry.id, overlay]);

  // Reading progress through the article, and the breadcrumb once the headline has gone
  // under the bar. Capture-phase scroll hears both the window and the overlay's own scroll.
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = article.current;
      const bar = root.current?.querySelector<HTMLElement>("[data-report-bar]");
      if (!el) return;
      const barBottom = bar ? bar.getBoundingClientRect().bottom : BAR_HEIGHT;
      const box = el.getBoundingClientRect();
      const span = box.height - (window.innerHeight - barBottom);
      rawProgress.set(span > 0 ? Math.min(1, Math.max(0, (barBottom - box.top) / span)) : 1);
      setCrumbs((heading.current?.getBoundingClientRect().bottom ?? 1) < barBottom);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [rawProgress, entry.id]);

  // ←/→ previous / next achievement, L the lightbox. Open dialogs (lightbox, profile) and
  // fields keep their own keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || typingIn(e.target) || lightbox) return;
      if (document.querySelector("[aria-labelledby='profile-name']")) return;
      if (e.key === "l" || e.key === "L") {
        if (!photos.length) return;
        e.preventDefault();
        setLightbox(true);
        return;
      }
      const to = e.key === "ArrowLeft" ? data.prev : e.key === "ArrowRight" ? data.next : null;
      if (!to) return;
      e.preventDefault();
      if (onGo) onGo(to.id);
      else router.push(to.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data.prev, data.next, lightbox, onGo, photos.length, router]);

  const Heading = overlay ? "h2" : "h1";
  const long = entry.headline.length > 26;
  const crumbTrail = [
    { label: "Trophy room", href: "/achievements" },
    ...(entry.year ? [{ label: String(entry.year), href: `/achievements?year=${entry.year}` }] : []),
    { label: firstTag.label.replace(/^\w/, (c) => c.toUpperCase()), href: `/achievements?type=${firstTag.type}` },
  ];
  const meta = "underline-offset-4 decoration-[#3fcfca] decoration-2 hover:underline focus-visible:underline";

  return (
    <ReportNavProvider value={{ mode, onGo }}>
      <div ref={root} className={cn(anton.variable, "overflow-x-clip", overlay ? "[--bar-top:28px]" : "[--bar-top:84px] md:[--bar-top:92px]")}>
        <TopBar
          backHref={overlay ? "/achievements" : backHref}
          onBack={overlay ? onClose : undefined}
          crumbs={crumbTrail}
          showCrumbs={crumbs}
          progress={progress}
          share={{ url, title: entry.title, text: entry.summary }}
          prev={data.prev}
          next={data.next}
        />

        <article ref={article} aria-labelledby="report-title" className="mx-auto max-w-[1280px] px-4 pb-6 pt-6 md:px-6 md:pt-10 lg:px-8 lg:pt-12">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Poster: sticky beside the text on desktop, full width on top on phones. */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-[calc(var(--bar-top)+80px)]">
                <Poster photos={data.photos} title={entry.title} selected={photo} onSelect={setPhoto} onOpen={(i) => (setPhoto(i), setLightbox(true))} />
              </div>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <header>
                <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[#f5f1e8]/70">
                  {entry.tags.map((tag) => (
                    <li key={tag.label}>
                      <Link
                        href={`/achievements?type=${tag.type}`}
                        title={`All ${TYPE_LABEL[tag.type].tab.toLowerCase()}`}
                        className="inline-flex h-7 items-center border border-[#3fcfca] px-2.5 text-[12px] font-bold uppercase leading-none tracking-[0.14em] text-[#3fcfca] transition hover:bg-[#3fcfca]/10"
                      >
                        {tag.label}
                      </Link>
                    </li>
                  ))}
                  {entry.sport !== "Club" && (
                    <li>
                      <Link href={`/achievements?sport=${sportKey(entry.sport)}`} className={cn("inline-flex items-center gap-1.5", meta)}>
                        <SportIcon aria-hidden sport={entry.sport} strokeWidth={1.75} className="h-4 w-4 text-[#3fcfca]" />
                        {entry.sport.replace(/\s*\(.*\)$/, "")}
                      </Link>
                    </li>
                  )}
                  {entry.year && (
                    <li>
                      <Link href={`/achievements?year=${entry.year}`} className={cn("font-semibold tabular-nums", meta)}>
                        {entry.year}
                      </Link>
                    </li>
                  )}
                </ul>

                <Heading
                  id="report-title"
                  ref={heading}
                  className={cn(ANTON, "mt-5 text-balance !leading-[0.95] text-[#f5f1e8]", long ? "text-[34px] md:text-[52px]" : "text-[40px] md:text-[64px]")}
                >
                  {entry.headline}
                  {entry.kicker && (
                    <span className={cn(ANTON, "mt-2 block !leading-[1.05] text-[#3fcfca]", long ? "text-[22px] md:text-[28px]" : "text-[24px] md:text-[32px]")}>{entry.kicker}</span>
                  )}
                </Heading>

                <p className="mt-6 max-w-[640px] text-[18px] font-medium leading-[1.55] text-[#f5f1e8] md:text-[20px]">{entry.summary}</p>
              </header>

              <div className="mt-8">
                <FactSheet facts={entry.facts} />
              </div>

              <div className="mt-12">
                <Story blocks={entry.blocks} attribution={`NSU Games & Sports Club, ${entry.title}`} url={url} />
                <People people={data.people} currentId={entry.id} />
                {/* Phones: rides along the bottom while reading, then settles here before the footer. */}
                <div className="sticky bottom-3 z-20 mt-12 max-md:ml-12 md:static">
                  <div className="rounded-full border border-white/10 bg-[#0b2524]/95 p-1.5 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.8)] backdrop-blur-sm md:inline-flex md:border-0 md:bg-transparent md:p-0 md:shadow-none">
                    <Congrats id={entry.id} initial={data.congrats} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <MoreWins data={data} />
          <CtaStrip cta={data.cta} />
        </article>

        <Lightbox open={lightbox} photos={photos} index={photo} title={entry.title} onIndex={setPhoto} onClose={() => setLightbox(false)} />
      </div>
    </ReportNavProvider>
  );
}
