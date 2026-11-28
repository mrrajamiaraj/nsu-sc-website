"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring, type Variants } from "framer-motion";
import { Search, X } from "lucide-react";
import { useMedia } from "@/components/contact/interaction/hooks";
import { EASE, INK, Kicker, META, PrintedPhoto, Rule, SERIF, Scribble, Wipe, stamp } from "@/components/blog/gazette/print";
import { CATEGORIES, categoryKey, dateline, postHref, type Category, type GazettePost } from "@/lib/blog";
import type { ScoreLine } from "@/lib/gazette";
import { cn } from "@/lib/utils";

const NAV: ("All" | Category)[] = ["All", "Match report", "Results", "Profiles", "Club news", "Behind the scenes"];
const navLabel = (c: string) => (c === "Match report" ? "Match reports" : c);

function Mark({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-[#006663]/15 text-[#006663]">
            {p}
          </mark>
        ) : (
          p
        ),
      )}
    </>
  );
}

// Search: an icon that opens a field with live results under it.
function SearchBox({ posts }: { posts: GazettePost[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (e.key !== "/" || (t instanceof Element && t.closest("input, textarea, select"))) return;
      e.preventDefault();
      setOpen(true);
      window.setTimeout(() => input.current?.focus(), 30);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const needle = q.trim().toLowerCase();
  const hits = needle ? posts.filter((p) => `${p.title} ${p.standfirst} ${p.opening} ${p.tags.join(" ")}`.toLowerCase().includes(needle)).slice(0, 6) : [];
  return (
    <div className="relative flex items-center">
      <AnimatePresence initial={false}>
        {open && (
          <motion.label initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <span className="sr-only">Search the Gazette</span>
            <input
              ref={input}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && (setOpen(false), setQ(""))}
              placeholder="Search stories…"
              className={cn(SERIF, "w-full border-0 border-b border-[#0b2524]/50 bg-transparent px-1 py-1 text-[16px] italic text-[#0b2524] placeholder:text-[#0b2524]/45 focus:border-[#006663] focus:outline-none [&::-webkit-search-cancel-button]:hidden")}
            />
          </motion.label>
        )}
      </AnimatePresence>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close search" : "Search the Gazette"}
        onClick={() => {
          setOpen((o) => !o);
          setQ("");
          window.setTimeout(() => input.current?.focus(), 30);
        }}
        className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-[#0b2524] hover:bg-[#0b2524]/10"
      >
        {open ? <X aria-hidden className="h-4 w-4" /> : <Search aria-hidden className="h-4 w-4" />}
      </button>
      <AnimatePresence>
        {open && needle && (
          <motion.ul
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            aria-live="polite"
            className="absolute right-0 top-full z-30 mt-2 w-[min(22rem,80vw)] border border-[#0b2524] bg-[#f5f1e8] p-2 shadow-[0_18px_30px_-12px_rgba(0,0,0,0.45)]"
          >
            {hits.length === 0 ? (
              <li className={cn(SERIF, "px-2 py-2 text-[15px] italic text-[#0b2524]/70")}>No story mentions “{q.trim()}”.</li>
            ) : (
              hits.map((p) => (
                <li key={p.id}>
                  <Link href={postHref(p)} className="block px-2 py-2 hover:bg-[#0b2524]/[0.06]">
                    <span className={cn(META, "block text-[11px] font-bold text-[#006663]")}>{p.category}</span>
                    <span className={cn(SERIF, "block text-[17px] font-bold leading-snug text-[#0b2524]")}>
                      <Mark text={p.title} q={q.trim()} />
                    </span>
                  </Link>
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function Lead({ post }: { post: GazettePost }) {
  return (
    <article className="group flex min-w-0 flex-col lg:col-span-8 lg:pr-10">
      <div>
        <Kicker>{post.sport ? `${post.category} · ${post.sport}` : post.category}</Kicker>
        <Link href={postHref(post)} data-cursor="view" className="mt-3 block focus-visible:outline-none">
          <Wipe as="h2" className={cn(SERIF, INK, "text-[34px] font-extrabold leading-[1.04] tracking-[-0.015em] [text-wrap:balance] md:text-[56px]")}>
            {post.title}
          </Wipe>
          <Scribble />
        </Link>
        <Wipe as="p" delay={0.2} className={cn(SERIF, "mt-3 text-[19px] italic leading-[1.35] text-[#0b2524]/80 md:text-[22px]")}>
          {post.standfirst}
        </Wipe>
        <p className={cn(META, "mt-4 text-[#0b2524]/70")}>
          By {post.author.name} · <time dateTime={post.date}>{dateline(post.date)}</time> · {post.readTime} min read
        </p>
      </div>
      <figure className="order-first mb-6 md:order-none md:mb-0 md:mt-6">
        <Link href={postHref(post)} tabIndex={-1} aria-hidden data-cursor="view" className="block">
          <PrintedPhoto src={post.cover} sizes="(min-width: 1024px) 760px, 100vw" className="aspect-[16/10]" />
        </Link>
        <figcaption className={cn(SERIF, "mt-2 text-[13px] italic text-[#0b2524]/70")}>Photo: {post.coverCredit}</figcaption>
      </figure>
      {post.opening && (
        <p
          className={cn(
            SERIF,
            "mt-6 hyphens-auto text-justify text-[16px] leading-[1.6] text-[#0b2524] [column-gap:2rem] [column-rule:1px_solid_rgba(11,37,36,0.25)] md:columns-2",
            "first-letter:float-left first-letter:mr-2 first-letter:mt-[0.3rem] first-letter:font-display first-letter:text-[5.4rem] first-letter:font-extrabold first-letter:leading-[0.74] first-letter:text-[#006663]",
          )}
        >
          {post.opening}{" "}
          <Link href={postHref(post)} className="whitespace-nowrap font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-[#006663] underline-offset-4 hover:underline">
            Continued →
          </Link>
        </p>
      )}
    </article>
  );
}

function Side({ post }: { post: GazettePost }) {
  return (
    <article className="group flow-root py-5">
      <Kicker>{post.category}</Kicker>
      <Link href={postHref(post)} tabIndex={-1} aria-hidden className="float-right mb-2 ml-4 mt-3 block w-[30%]">
        <PrintedPhoto src={post.cover} sizes="120px" className="aspect-square" />
      </Link>
      <Link href={postHref(post)} className="mt-3 block focus-visible:outline-none">
        <Wipe as="h3" className={cn(SERIF, INK, "text-[22px] font-bold leading-[1.1] tracking-[-0.01em] md:text-[24px]")}>
          {post.title}
        </Wipe>
        <Scribble />
      </Link>
      <p className={cn(SERIF, "mt-2 line-clamp-1 text-[15px] text-[#0b2524]/80")}>{post.standfirst}</p>
      <p className={cn(META, "mt-2 text-[#0b2524]/70")}>
        <time dateTime={post.date}>{dateline(post.date)}</time>
      </p>
    </article>
  );
}

function Scoreboard({ scores }: { scores: ScoreLine[] }) {
  if (!scores.length) return null;
  return (
    <section aria-labelledby="scoreboard-heading" className="mt-10 border border-[#0b2524] p-4 md:p-5">
      <h2 id="scoreboard-heading" className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#0b2524]">
        Scoreboard
      </h2>
      <Rule className="mt-2" delay={0.3} />
      <ul className="mt-3 grid gap-x-8 gap-y-2 font-mono text-[12px] leading-snug text-[#0b2524] md:grid-cols-3">
        {scores.map((line) => (
          <li key={line.id}>
            <Link href={line.href} className="font-bold underline-offset-2 hover:underline">
              {line.event}
            </Link>
            <span className="block text-[#0b2524]/80">{line.result}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// The front page: masthead, section nav and search, lead story, the sidebar and the scoreboard,
// printed on a sheet tossed onto the dark table.
export function FrontPage({ posts, scores, volume, onSection }: { posts: GazettePost[]; scores: (ScoreLine & { href: string })[]; volume: number; onSection: (key: string) => void }) {
  const reduce = Boolean(useReducedMotion());
  const phone = useMedia("(max-width: 767px)");
  const fine = useMedia("(hover: hover) and (pointer: fine)");
  const [today, setToday] = useState("");
  const tiltX = useSpring(0, { stiffness: 120, damping: 20 });
  const tiltY = useSpring(0, { stiffness: 120, damping: 20 });
  useEffect(() => setToday(new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" })), []);
  const [lead, ...rest] = posts;
  const side = rest.slice(0, 3);
  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c, posts.filter((p) => p.category === c).length])), [posts]);
  const tilt = fine && !phone && !reduce;
  const resting = phone ? 0 : -0.4;
  const sheet: Variants = {
    hidden: { y: reduce ? 0 : 120, rotate: phone || reduce ? 0 : -3, opacity: 0 },
    shown: { y: 0, rotate: resting, opacity: 1, transition: reduce ? { duration: 0.15 } : { y: { type: "spring", stiffness: 110, damping: 15 }, rotate: { type: "spring", stiffness: 90, damping: 14 }, opacity: { duration: 0.2 } } },
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const box = e.currentTarget.getBoundingClientRect();
    tiltY.set(((e.clientX - box.left) / box.width - 0.5) * 3);
    tiltX.set(-((e.clientY - box.top) / box.height - 0.5) * 3);
  };
  const title = "The NSU SC Gazette";

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-6 sm:px-6 lg:px-8" style={{ perspective: 1400 }} onPointerMove={onMove} onPointerLeave={() => (tiltX.set(0), tiltY.set(0))}>
      <motion.div initial="hidden" animate="shown" variants={sheet} style={{ rotateX: tiltX, rotateY: tiltY }} className={cn("newsprint relative bg-[#f5f1e8] p-5 shadow-[0_40px_70px_-24px_rgba(0,0,0,0.8),0_12px_24px_-10px_rgba(0,0,0,0.55)] md:p-12", INK)}>
        <header>
          <div className={cn(META, "flex flex-wrap justify-between gap-x-6 gap-y-1 text-[11px] md:text-[12px]")}>
            <span>
              Vol. {volume} · No. {posts.length} · North South University, Dhaka
            </span>
            <time suppressHydrationWarning>{today}</time>
          </div>
          <Rule className="mt-3" />
          <h1 className="my-3 text-center font-display text-[44px] !font-extrabold uppercase leading-[0.92] tracking-[0.01em] text-[#0b2524] md:my-5 md:text-[80px] lg:text-[110px]">
            <span className="sr-only">{title}</span>
            <span aria-hidden>
              {title.split(" ").map((word, w, words) => {
                const offset = words.slice(0, w).join(" ").length + (w > 0 ? 1 : 0);
                return (
                  <span key={w} className="inline-block whitespace-nowrap">
                    {Array.from(word).map((char, i) => (
                      <motion.span key={i} custom={offset + i} variants={reduce ? undefined : stamp} className="inline-block">
                        {char}
                      </motion.span>
                    ))}
                    {w < words.length - 1 && <>&nbsp;</>}
                  </span>
                );
              })}
            </span>
          </h1>
          <Rule delay={0.1} />
          <Rule delay={0.18} className="mt-[3px]" />
          <div className="mt-2 flex items-center justify-between gap-4">
            <nav aria-label="Sections" className="no-scrollbar -mx-1 flex overflow-x-auto">
              {NAV.filter((c) => c === "All" || counts[c] > 0).map((c) => (
                <button key={c} type="button" onClick={() => onSection(c === "All" ? "" : categoryKey(c))} className={cn(META, "group relative shrink-0 px-2 py-2 font-bold text-[#0b2524] hover:text-[#006663]")}>
                  {navLabel(c)}
                  <span aria-hidden className="absolute inset-x-2 bottom-1 h-px origin-left scale-x-0 bg-[#006663] transition-transform duration-200 group-hover:scale-x-100" />
                </button>
              ))}
            </nav>
            {posts.length > 0 && <SearchBox posts={posts} />}
          </div>
        </header>

        {lead ? (
          <>
            <div className="mt-6 grid md:mt-8 lg:grid-cols-12">
              <Lead post={lead} />
              {side.length > 0 && (
                <aside aria-labelledby="also-heading" className="relative mt-10 lg:col-span-4 lg:mt-0 lg:pl-10">
                  <motion.span aria-hidden variants={{ hidden: { scaleY: 0 }, shown: { scaleY: 1, transition: { duration: 0.9, delay: 0.5, ease: EASE } } }} className="absolute inset-y-0 left-0 hidden w-px origin-top bg-[#0b2524]/30 lg:block" />
                  <Rule delay={0.2} />
                  <h2 id="also-heading" className="py-2 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#0b2524]">
                    Also in this issue
                  </h2>
                  <Rule delay={0.25} />
                  {side.map((p, i) => (
                    <div key={p.id}>
                      {i > 0 && <Rule delay={0.3} className="bg-[#0b2524]/40" />}
                      <Side post={p} />
                    </div>
                  ))}
                </aside>
              )}
            </div>
            <Scoreboard scores={scores} />
          </>
        ) : (
          // No published story yet: say so plainly, and still give the results.
          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Kicker>Today&rsquo;s edition</Kicker>
              <p className={cn(SERIF, "mt-3 text-[34px] font-extrabold leading-[1.05] md:text-[48px]")}>The first stories are being written.</p>
              <p className={cn(SERIF, "mt-3 text-[20px] italic text-[#0b2524]/80")}>Match reports, results and profiles from NSU Games &amp; Sports Club will be printed here.</p>
              <Link href="/contact?topic=other#contact-form" className={cn(META, "mt-5 inline-block font-bold text-[#006663] underline-offset-4 hover:underline")}>
                Got a story? Tell the media team →
              </Link>
            </div>
            <div className="lg:col-span-4">
              <Scoreboard scores={scores} />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
