"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Compass, Link2, Minus, Plus, Share2, Trophy, UserPlus, X } from "lucide-react";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { FlapText } from "@/components/home/matchday/SplitFlap";
import { categoryKey, dateline, isCutout, postHref, type GazettePost } from "@/lib/blog";
import { cn } from "@/lib/utils";

const SERIF = "[font-family:var(--font-news),Georgia,serif]";
const SIZES = [17, 19, 21];

export type RelatedCard = { kind: "event" | "achievement" | "team" | "page" | "join"; href: string; title: string; image: string | null; label: string };
const CARD_ACTION: Record<RelatedCard["kind"], string> = { event: "View event", achievement: "View achievement", team: "View team", page: "Open", join: "Sign up" };
export type ResultRow = { category: string | null; champion: string; runnerUp: string | null };

// ---- Small pieces

function useCopied() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }, []);
  return { copied, copy };
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Photo" onKeyDown={(e) => (e.key === "Escape" || e.key === "Tab") && (e.preventDefault(), e.key === "Escape" && onClose())} className="fixed inset-0 z-[170] flex flex-col bg-[#050f0e]/95">
      <div className="flex justify-end p-3">
        <button ref={close} type="button" onClick={onClose} aria-label="Close photo" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#f5f1e8] hover:bg-white/20">
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>
      <div className="relative min-h-0 flex-1" onClick={onClose}>
        <Image src={src} alt={alt} fill sizes="100vw" className="object-contain" />
      </div>
    </div>,
    document.body,
  );
}

// ---- Top bar: back, reading progress, share, text size.

function TopBar({ title, size, onSize }: { title: string; size: number; onSize: (n: number) => void }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const { copied, copy } = useCopied();
  const share = async () => {
    const url = window.location.href.split("#")[0];
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    copy(url);
  };
  const btn = "flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full px-2 text-[13px] font-semibold text-[#f5f1e8]/80 hover:bg-white/10 hover:text-[#f5f1e8] disabled:opacity-40";
  return (
    <div className="sticky top-[76px] z-30 border-b border-white/10 bg-[#0b2524]/92 backdrop-blur-md md:top-[84px]">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-1.5 sm:px-6">
        <Link href="/blog" className="group inline-flex min-h-[40px] items-center gap-2 text-[14px] font-medium text-[#f5f1e8]/80 hover:text-[#f5f1e8]">
          <ArrowLeft aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          The Gazette
        </Link>
        <div className="flex items-center gap-1">
          <span className="hidden items-center sm:flex" role="group" aria-label="Text size">
            <button type="button" onClick={() => onSize(size - 1)} disabled={size === 0} aria-label="Smaller text" className={btn}>
              A<Minus aria-hidden className="h-3 w-3" />
            </button>
            <button type="button" onClick={() => onSize(size + 1)} disabled={size === SIZES.length - 1} aria-label="Larger text" className={btn}>
              A<Plus aria-hidden className="h-3 w-3" />
            </button>
          </span>
          <button type="button" onClick={share} className={btn} aria-live="polite">
            {copied ? <Check aria-hidden className="h-4 w-4 text-[#3fcfca]" /> : <Share2 aria-hidden className="h-4 w-4" />}
            {copied ? "Copied" : "Share"}
          </button>
        </div>
      </div>
      <motion.span aria-hidden className="absolute inset-x-0 bottom-0 block h-[2px] origin-left bg-[#3fcfca]" style={{ scaleX: progress }} />
    </div>
  );
}

// ---- "In this story": sticky in the margin on desktop, collapsible on phones.

function Contents({ headings }: { headings: GazettePost["headings"] }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (top) setActive(top.target.id);
    }, { rootMargin: "-20% 0px -65% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);
  if (headings.length < 2) return null;
  const list = (
    <ol className="space-y-1">
      {headings.map((h) => (
        <li key={h.id}>
          <a href={`#${h.id}`} onClick={() => setOpen(false)} className={cn("block border-l-2 py-1 pl-3 text-[14px] leading-snug", active === h.id ? "border-[#3fcfca] text-[#3fcfca]" : "border-white/10 text-[#f5f1e8]/60 hover:text-[#f5f1e8]")}>
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <>
      <nav aria-label="In this story" className="hidden xl:block">
        <div className="sticky top-40">
          <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#f5f1e8]/50">In this story</p>
          {list}
        </div>
      </nav>
      <div className="mb-8 border-y border-white/10 xl:hidden">
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-3 font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#f5f1e8]/70">
          In this story
          <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden pb-3">
              {list}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ---- Results block: the linked event's champions, flipping in like a scoreboard.

function Results({ code, rows }: { code: string; rows: ResultRow[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const play = useInView(ref, { once: true, amount: 0.4 });
  const reduce = Boolean(useReducedMotion());
  return (
    <div ref={ref} className="my-10 border border-white/15 bg-[#071a19] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="sr-only">{code} results</span>
        <FlapText text={code} play={play} still={reduce} className="text-[22px]" />
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#f5f1e8]/55">Results</span>
      </div>
      <table className="mt-4 w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-white/15 font-mono text-[11px] uppercase tracking-[0.16em] text-[#f5f1e8]/55">
            <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
            <th scope="col" className="py-2 pr-3 font-semibold">Champions</th>
            <th scope="col" className="py-2 font-semibold">Runners-up</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <motion.tr key={i} initial={{ opacity: 0 }} animate={play ? { opacity: 1 } : undefined} transition={{ delay: reduce ? 0 : 0.25 + i * 0.12 }} className="border-b border-white/10 text-[15px]">
              <td className="py-2.5 pr-3 text-[#f5f1e8]/70">{r.category ?? "—"}</td>
              <td className="py-2.5 pr-3 font-semibold text-[#f5f1e8]">
                <Trophy aria-hidden className="mr-1.5 inline h-4 w-4 text-[#3fcfca]" />
                {r.champion}
              </td>
              <td className="py-2.5 text-[#f5f1e8]/75">{r.runnerUp ?? "—"}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Body: the post's HTML with a drop cap, pull quotes you can copy, and click-to-zoom images.

// The HTML renders once and never again (memo), so the buttons added to it below survive
// re-renders such as a text-size change (React would otherwise rewrite the markup).
const Html = memo(function Html({ html, className, innerRef }: { html: string; className: string; innerRef: RefObject<HTMLDivElement> }) {
  return <div ref={innerRef} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});

function Body({ html, size, attribution, onImage }: { html: string; size: number; attribution: string; onImage: (src: string, alt: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cleanups: (() => void)[] = [];
    root.querySelectorAll("blockquote").forEach((q) => {
      if (q.querySelector("[data-copy]")) return;
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.copy = "1";
      b.textContent = "Copy quote";
      b.className = "quote-copy";
      const onClick = async () => {
        try {
          await navigator.clipboard.writeText(`“${q.textContent?.replace("Copy quote", "").replace("Copied ✓", "").trim()}” (${attribution})`);
          b.textContent = "Copied ✓";
          window.setTimeout(() => (b.textContent = "Copy quote"), 1800);
        } catch {
          /* blocked */
        }
      };
      b.addEventListener("click", onClick);
      q.appendChild(b);
      cleanups.push(() => b.removeEventListener("click", onClick));
    });
    // Photos zoom; the small thumbnails in event and people lists are links instead.
    root.querySelectorAll<HTMLImageElement>("img:not([data-thumb])").forEach((img) => {
      img.setAttribute("data-cursor", "view");
      img.tabIndex = 0;
      const open = () => onImage(img.src, img.alt);
      const key = (e: KeyboardEvent) => e.key === "Enter" && open();
      img.addEventListener("click", open);
      img.addEventListener("keydown", key);
      cleanups.push(() => (img.removeEventListener("click", open), img.removeEventListener("keydown", key)));
    });
    return () => cleanups.forEach((c) => c());
  }, [html, attribution, onImage]);
  return (
    <div style={{ fontSize: SIZES[size] }}>
      <Html
        innerRef={ref}
        html={html}
        className={cn(
        SERIF,
        "article-body break-words leading-[1.75] text-[#f5f1e8]/90",
        "[&_p]:mb-6 [&_a]:text-[#3fcfca] [&_a]:underline [&_a]:decoration-[#3fcfca]/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-[#3fcfca]",
        "[&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:scroll-mt-40 [&_h2]:![font-family:var(--font-news),Georgia,serif] [&_h2]:text-[28px] [&_h2]:!font-bold [&_h2]:!normal-case [&_h2]:!leading-tight [&_h2]:text-[#f5f1e8] md:[&_h2]:text-[32px]",
        "[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-[22px] [&_h3]:font-bold [&_h3]:text-[#f5f1e8]",
        "[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_li::marker]:text-[#3fcfca]",
        "[&_strong]:text-[#f5f1e8]",
        "[&_img]:my-8 [&_img]:h-auto [&_img]:w-full [&_img]:cursor-zoom-in [&_img]:rounded-md",
        "[&_hr]:my-10 [&_hr]:border-white/15",
        "[&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:mt-1 [&>p:first-of-type]:first-letter:font-display [&>p:first-of-type]:first-letter:text-[4.6em] [&>p:first-of-type]:first-letter:font-extrabold [&>p:first-of-type]:first-letter:leading-[0.8] [&>p:first-of-type]:first-letter:text-[#3fcfca]",
      )}
      />
    </div>
  );
}

// ---- Reaction: one per visitor; hidden until the club's database has the count table.

function Clap({ id, initial }: { id: string; initial: number | null }) {
  const reduce = Boolean(useReducedMotion());
  const [count, setCount] = useState(initial);
  const [sent, setSent] = useState(false);
  const [burst, setBurst] = useState(0);
  const key = `clap-${id}`;
  useEffect(() => {
    try {
      setSent(window.localStorage.getItem(key) === "1");
    } catch {
      /* storage blocked */
    }
  }, [key]);
  if (count === null) return null;
  const send = async () => {
    if (sent) return;
    setSent(true);
    setCount((c) => (c ?? 0) + 1);
    setBurst((b) => b + 1);
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      /* storage blocked */
    }
    const res = await fetch(`/api/blog/${id}/clap`, { method: "POST" }).catch(() => null);
    const data = res && res.ok ? ((await res.json()) as { count: number }) : null;
    if (data) setCount(data.count);
  };
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={send} disabled={sent} aria-pressed={sent} className="relative inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#3fcfca]/60 px-5 text-[15px] font-semibold text-[#f5f1e8] hover:bg-[#3fcfca]/10 disabled:cursor-default disabled:opacity-100">
        <motion.span key={burst} animate={burst && !reduce ? { y: [0, -6, 0], rotate: [0, -12, 8, 0] } : undefined} transition={{ duration: 0.5 }}>
          <Trophy aria-hidden className="h-5 w-5 text-[#3fcfca]" />
        </motion.span>
        {sent ? "Congrats sent" : "Send congrats"}
        {!reduce &&
          burst > 0 &&
          Array.from({ length: 12 }, (_, i) => (
            <motion.span
              key={`${burst}-${i}`}
              aria-hidden
              className="pointer-events-none absolute left-6 top-1/2 h-1.5 w-1.5 rounded-full bg-[#3fcfca]"
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x: Math.cos((i / 12) * Math.PI * 2) * 34, y: Math.sin((i / 12) * Math.PI * 2) * 34, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
      </button>
      <span aria-live="polite" className="font-mono text-[13px] tabular-nums text-[#f5f1e8]/65">
        {count} congrats
      </span>
    </div>
  );
}

function ShareRow({ title }: { title: string }) {
  const { copied, copy } = useCopied();
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href.split("#")[0]), []);
  const item = "inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 px-4 text-[14px] font-semibold hover:-translate-y-0.5 hover:border-white/45";
  return (
    <div className="flex flex-wrap gap-2">
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={item}>
        <FacebookIcon className="h-4 w-4" />
        Facebook
      </a>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" className={item}>
        WhatsApp
      </a>
      <button type="button" onClick={() => copy(url)} className={item} aria-live="polite">
        {copied ? <Check aria-hidden className="h-4 w-4 text-[#3fcfca]" /> : <Link2 aria-hidden className="h-4 w-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

function Avatar({ name, photo, size }: { name: string; photo: string | null; size: number }) {
  return (
    <span className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#13312d] font-display font-extrabold text-[#3fcfca]" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {photo ? (
        <Image src={photo} alt="" fill sizes={`${size * 2}px`} className="object-cover" />
      ) : /^NSU SC/i.test(name) ? (
        "SC"
      ) : (
        name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase()
      )}
    </span>
  );
}

// ---- Page

export function ArticleView({
  post,
  related,
  results,
  resultsCode,
  more,
  byAuthor,
  prev,
  next,
  claps,
}: {
  post: GazettePost;
  related: RelatedCard[];
  results: ResultRow[];
  resultsCode: string | null;
  more: GazettePost[];
  byAuthor: GazettePost[];
  prev: GazettePost | null;
  next: GazettePost | null;
  claps: number | null;
}) {
  const [size, setSize] = useState(1);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const [authorCard, setAuthorCard] = useState(false);
  const onImage = useCallback((src: string, alt: string) => setZoom({ src, alt }), []);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("gazette-size");
      const saved = raw === null ? NaN : Number(raw);
      if (saved >= 0 && saved < SIZES.length) setSize(saved);
    } catch {
      /* storage blocked */
    }
  }, []);
  const pickSize = (n: number) => {
    const v = Math.max(0, Math.min(SIZES.length - 1, n));
    setSize(v);
    try {
      window.localStorage.setItem("gazette-size", String(v));
    } catch {
      /* storage blocked */
    }
  };
  // ←/→ move to the previous / next story.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (zoom || (t instanceof Element && t.closest("input, textarea, select, [role='dialog']"))) return;
      if (e.key === "ArrowLeft" && prev) window.location.href = postHref(prev);
      if (e.key === "ArrowRight" && next) window.location.href = postHref(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, zoom]);
  const onAuthorKey = (e: ReactKeyboardEvent) => e.key === "Escape" && setAuthorCard(false);
  const otherByAuthor = byAuthor.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <article>
      <TopBar title={post.title} size={size} onSize={pickSize} />

      <header className="mx-auto max-w-[760px] px-4 pt-12 sm:px-6 md:pt-16">
        <p className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#3fcfca]">
          <Link href={`/blog?cat=${categoryKey(post.category)}#back-heading`} className="hover:underline">
            {post.category}
          </Link>
          {post.sport && (
            <>
              {" · "}
              <Link href={`/blog?sport=${encodeURIComponent(post.sport)}#back-heading`} className="hover:underline">
                {post.sport}
              </Link>
            </>
          )}
        </p>
        <h1 className={cn(SERIF, "![font-family:var(--font-news),Georgia,serif] !normal-case !font-extrabold !leading-[1.04] !tracking-[-0.015em] mt-4 text-[38px] text-[#f5f1e8] [text-wrap:balance] md:text-[60px]")}>{post.title}</h1>
        <p className={cn(SERIF, "mt-5 text-[21px] italic leading-[1.4] text-[#f5f1e8]/75 md:text-[24px]")}>{post.standfirst}</p>
        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-white/10 py-4">
          <div className="relative" onPointerEnter={() => setAuthorCard(true)} onPointerLeave={() => setAuthorCard(false)} onKeyDown={onAuthorKey}>
            <button type="button" aria-expanded={authorCard} onClick={() => setAuthorCard((o) => !o)} className="flex items-center gap-3 text-left">
              <Avatar name={post.author.name} photo={post.author.photo} size={40} />
              <span>
                <span className="block text-[15px] font-semibold text-[#f5f1e8]">{post.author.name}</span>
                {post.author.role && <span className="block text-[13px] text-[#f5f1e8]/60">{post.author.role}</span>}
              </span>
            </button>
            <AnimatePresence>
              {authorCard && otherByAuthor.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute left-0 top-full z-30 mt-2 w-72 rounded-lg border border-white/15 bg-[#082120] p-3 shadow-xl">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/55">Also by {post.author.name}</p>
                  <ul className="mt-2 space-y-1.5">
                    {otherByAuthor.map((p) => (
                      <li key={p.id}>
                        <Link href={postHref(p)} className={cn(SERIF, "block text-[15px] font-bold leading-snug text-[#f5f1e8] hover:text-[#3fcfca]")}>
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-[#f5f1e8]/60">
            <time dateTime={post.date}>{dateline(post.date)}</time>
            {post.updated && (
              <>
                {" · Updated "}
                <time dateTime={post.updated}>{dateline(post.updated)}</time>
              </>
            )}
            {" · "}
            {post.readTime} min read
          </p>
        </div>
      </header>

      {post.cover && (
        <figure className="mx-auto mt-10 max-w-[1100px] px-4 sm:px-6">
          <button
            type="button"
            data-cursor="view"
            onClick={() => setZoom({ src: post.cover!, alt: post.coverCaption ?? post.title })}
            aria-label="Open the cover photo"
            className={cn("relative block aspect-[16/9] w-full overflow-hidden rounded-md bg-[#0f302e]", isCutout(post.cover) && "bg-[radial-gradient(ellipse_at_50%_85%,#13504b_0%,#0f302e_55%,#071a19_100%)]")}
          >
            {/* A cut-out portrait stands whole on the stage; a photo fills the frame. */}
            <Image src={post.cover} alt={post.coverCaption ?? post.title} fill priority sizes="(min-width: 1100px) 1100px, 100vw" className={isCutout(post.cover) ? "object-contain object-bottom pt-6" : "object-cover"} />
          </button>
          <figcaption className={cn(SERIF, "mt-2 text-[14px] italic text-[#f5f1e8]/60")}>
            {post.coverCaption && <span className="not-italic text-[#f5f1e8]/80">{post.coverCaption} </span>}
            Photo: {post.coverCredit}
          </figcaption>
        </figure>
      )}

      <div className="mx-auto mt-12 grid max-w-[1100px] gap-10 px-4 sm:px-6 xl:grid-cols-[200px_minmax(0,720px)]">
        <Contents headings={post.headings} />
        <div className="min-w-0 xl:col-start-2">
          <Body html={post.html} size={size} attribution={`${post.title}, The NSU SC Gazette`} onImage={onImage} />
          {resultsCode && results.length > 0 && <Results code={resultsCode} rows={results} />}
          {related.length > 0 && (
            <ul className="my-10 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="group flex items-center gap-4 border border-white/15 p-3 hover:border-[#3fcfca]/60 hover:bg-white/[0.03]">
                    <span className="relative flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden bg-[#0f302e]">
                      {r.image ? (
                        <Image src={r.image} alt="" fill sizes="64px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : r.kind === "join" ? (
                        <UserPlus aria-hidden className="h-6 w-6 text-[#3fcfca] transition-transform duration-300 group-hover:scale-110" />
                      ) : (
                        <Compass aria-hidden className="h-6 w-6 text-[#3fcfca] transition-transform duration-300 group-hover:rotate-45" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/55">{r.label}</span>
                      <span className="mt-1 block text-[15px] font-semibold leading-snug text-[#f5f1e8] group-hover:text-[#3fcfca]">{r.title}</span>
                      <span className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-[#3fcfca]">
                        {CARD_ACTION[r.kind]} <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* End of the article */}
          <footer className="mt-12 space-y-8 border-t border-white/10 pt-8">
            {post.tags.length > 0 && (
              <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px] uppercase tracking-[0.12em]">
                {post.tags.map((t) => (
                  <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}#back-heading`} className="text-[#f5f1e8]/65 hover:text-[#3fcfca]">
                    #{t}
                  </Link>
                ))}
              </p>
            )}
            <Clap id={post.id} initial={claps} />
            <ShareRow title={post.title} />
            <div className="flex items-center gap-4 border-y border-white/10 py-5">
              <Avatar name={post.author.name} photo={post.author.photo} size={56} />
              <div>
                <p className="text-[16px] font-semibold text-[#f5f1e8]">{post.author.name}</p>
                <p className="text-[14px] text-[#f5f1e8]/60">{post.author.role ?? "Writes for The NSU SC Gazette"}</p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-heading" className="mx-auto mt-20 max-w-[1100px] px-4 sm:px-6">
          <h2 id="more-heading" className="text-[32px] !font-extrabold leading-none text-[#f5f1e8] md:text-[40px]">
            More from the Gazette
          </h2>
          <ul className="mt-6 border-t border-white/10">
            {more.map((p) => (
              <li key={p.id}>
                <Link href={postHref(p)} className="group grid grid-cols-[minmax(0,1fr)_120px] items-center gap-5 border-b border-white/10 py-5 hover:bg-white/[0.03] md:grid-cols-[120px_minmax(0,1fr)_160px] md:px-3">
                  <time dateTime={p.date} className="hidden font-mono text-[12px] uppercase tracking-[0.12em] text-[#f5f1e8]/55 md:block">
                    {dateline(p.date)}
                  </time>
                  <span>
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#3fcfca]">{p.category}</span>
                    <span className={cn(SERIF, "mt-1 block text-[20px] font-bold leading-snug text-[#f5f1e8] group-hover:text-[#3fcfca]")}>{p.title}</span>
                  </span>
                  <span className="relative block aspect-[4/3] overflow-hidden bg-[#0f302e]">
                    {p.cover && (
                      <>
                        <Image src={p.cover} alt="" fill sizes="160px" className={cn("object-cover grayscale transition duration-500 group-hover:grayscale-0", isCutout(p.cover) && "object-top")} />
                        <span aria-hidden className="absolute inset-0 bg-[#3fcfca] mix-blend-multiply transition-opacity duration-500 [opacity:0.45] group-hover:opacity-0" />
                      </>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(prev || next) && (
        <nav aria-label="Previous and next stories" className="mx-auto mt-16 grid max-w-[1100px] gap-3 px-4 sm:px-6 md:grid-cols-2">
          {[prev, next].map((p, i) =>
            p ? (
              <Link key={p.id} href={postHref(p)} className={cn("group relative flex min-h-[140px] flex-col justify-end overflow-hidden border border-white/10 p-5 transition-[flex] hover:border-[#3fcfca]/50", i === 1 && "md:items-end md:text-right")}>
                {p.cover && <Image src={p.cover} alt="" fill sizes="550px" className="-z-10 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-30" />}
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/55">{i === 0 ? "← Newer story" : "Older story →"}</span>
                <span className={cn(SERIF, "mt-1 text-[22px] font-bold leading-snug text-[#f5f1e8] group-hover:text-[#3fcfca]")}>{p.title}</span>
              </Link>
            ) : (
              <span key={i} />
            ),
          )}
        </nav>
      )}

      {zoom && <Lightbox src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} />}
    </article>
  );
}
