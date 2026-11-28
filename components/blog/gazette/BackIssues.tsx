"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, categoryKey, dateline, postHref, type GazettePost } from "@/lib/blog";
import { cn } from "@/lib/utils";

const PAGE = 10;
const SERIF = "[font-family:var(--font-news),Georgia,serif]";

export type BackState = { cat: string; sport: string; year: string; sort: "newest" | "oldest" };
export type BackHandle = { setCategory: (key: string) => void };

// Wobbly underline that inks in under the hovered headline.
function Scribble() {
  return (
    <svg aria-hidden viewBox="0 0 300 12" preserveAspectRatio="none" className="pointer-events-none mt-1 block h-3 w-full max-w-[18rem] overflow-visible">
      <path d="M2 8.5c22-3.6 41-4.2 63-1.6 21 2.5 37 2.6 58-.6 25-3.8 47-3.4 71 .4 20 3.1 39 2.7 57-.9 17-3.2 31-3 47-1.3" pathLength={1} className="gazette-scribble" style={{ stroke: "#3fcfca" }} />
    </svg>
  );
}

function Row({ post, active }: { post: GazettePost; active: boolean }) {
  return (
    <li>
      <Link
        href={postHref(post)}
        data-cursor="view"
        data-story
        className={cn(
          "group grid grid-cols-1 gap-4 border-b border-white/10 py-6 transition-colors duration-200 hover:bg-white/[0.03] md:grid-cols-[120px_minmax(0,1fr)_200px] md:gap-6 md:px-3",
          active && "bg-white/[0.04]",
        )}
      >
        <time dateTime={post.date} className="order-2 font-mono text-[12px] uppercase tracking-[0.12em] text-[#f5f1e8]/55 md:order-1 md:pt-1">
          {dateline(post.date)}
        </time>
        <span className="order-3 min-w-0 md:order-2">
          <span className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#3fcfca]">
            {post.category}
            {post.sport && <span className="text-[#f5f1e8]/50"> · {post.sport}</span>}
          </span>
          <span className={cn(SERIF, "mt-2 block text-[22px] font-bold leading-[1.15] text-[#f5f1e8] md:text-[26px]")}>{post.title}</span>
          <Scribble />
          <span className={cn(SERIF, "mt-1 block text-[16px] italic leading-snug text-[#f5f1e8]/70")}>{post.standfirst}</span>
          <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.12em] text-[#f5f1e8]/45">
            By {post.author.name} · {post.readTime} min read
          </span>
        </span>
        <span className="relative order-1 block aspect-[200/130] overflow-hidden bg-[#0f302e] md:order-3">
          {post.cover && (
            <>
              <Image src={post.cover} alt="" fill sizes="(min-width: 768px) 200px, 100vw" className="object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-[1.04] group-hover:grayscale-0" />
              <span aria-hidden className="absolute inset-0 bg-[#3fcfca] mix-blend-multiply transition-opacity duration-500 [opacity:0.45] group-hover:opacity-0" />
            </>
          )}
        </span>
      </Link>
    </li>
  );
}

// "Back issues": every story as an editorial row, filterable and kept in the URL.
export const BackIssues = forwardRef<BackHandle, { posts: GazettePost[]; initial: BackState }>(function BackIssues({ posts, initial }, ref) {
  const router = useRouter();
  const [state, setState] = useState<BackState>(initial);
  const [shown, setShown] = useState(PAGE);
  const [active, setActive] = useState(-1);
  const touched = useRef(false);
  const section = useRef<HTMLElement>(null);
  const set = (patch: Partial<BackState>) => {
    touched.current = true;
    setShown(PAGE);
    setActive(-1);
    setState((s) => ({ ...s, ...patch }));
  };

  useImperativeHandle(ref, () => ({
    setCategory: (key) => {
      set({ cat: key });
      section.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  }));

  useEffect(() => {
    if (!touched.current) return;
    const url = new URL(window.location.href);
    for (const k of ["cat", "sport", "year", "sort"] as const) url.searchParams.delete(k);
    if (state.cat) url.searchParams.set("cat", state.cat);
    if (state.sport) url.searchParams.set("sport", state.sport);
    if (state.year) url.searchParams.set("year", state.year);
    if (state.sort !== "newest") url.searchParams.set("sort", state.sort);
    window.history.replaceState(window.history.state, "", url);
  }, [state]);

  const filtered = useMemo(() => {
    const list = posts.filter(
      (p) => (!state.cat || categoryKey(p.category) === state.cat) && (!state.sport || p.sport === state.sport) && (!state.year || p.date.startsWith(state.year)),
    );
    return state.sort === "oldest" ? [...list].reverse() : list;
  }, [posts, state]);
  const visible = filtered.slice(0, shown);

  // J / K move between stories, Enter opens.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof Element && t.closest("input, textarea, select")) return;
      if (e.key !== "j" && e.key !== "k") return;
      const next = Math.max(0, Math.min(visible.length - 1, active + (e.key === "j" ? 1 : -1)));
      setActive(next);
      const el = section.current?.querySelectorAll<HTMLAnchorElement>("[data-story]")[next];
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, visible.length]);

  const counts = Object.fromEntries(CATEGORIES.map((c) => [categoryKey(c), posts.filter((p) => p.category === c).length]));
  const sports = Array.from(new Set(posts.map((p) => p.sport).filter(Boolean) as string[])).sort();
  const years = Array.from(new Set(posts.map((p) => p.date.slice(0, 4)))).sort().reverse();
  const catLabel = CATEGORIES.find((c) => categoryKey(c) === state.cat);
  const select = "min-h-[40px] rounded-full border border-white/15 bg-[#071a19] px-3 text-[14px] text-[#f5f1e8] focus:border-[#3fcfca] focus:outline-none";

  if (posts.length === 0) return null;
  return (
    <section ref={section} aria-labelledby="back-heading" className="mx-auto mt-24 max-w-[1280px] scroll-mt-24 px-4 sm:px-6 lg:mt-28 lg:px-8">
      <h2 id="back-heading" className="text-[40px] !font-extrabold leading-none text-[#f5f1e8] md:text-[48px]">
        Back issues
      </h2>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-white/10 py-3">
        <div role="radiogroup" aria-label="Category" className="no-scrollbar flex gap-1 overflow-x-auto">
          {[{ key: "", label: "All", n: posts.length }, ...CATEGORIES.filter((c) => counts[categoryKey(c)] > 0).map((c) => ({ key: categoryKey(c), label: c, n: counts[categoryKey(c)] }))].map((c) => {
            const on = state.cat === c.key;
            return (
              <button key={c.key || "all"} type="button" role="radio" aria-checked={on} onClick={() => set({ cat: c.key })} className={cn("relative shrink-0 px-2.5 py-2 text-[14px] font-medium", on ? "text-[#3fcfca]" : "text-[#f5f1e8]/65 hover:text-[#f5f1e8]")}>
                {c.label} <span className="tabular-nums opacity-60">{c.n}</span>
                {on && <motion.span layoutId="back-cat" aria-hidden className="absolute inset-x-2 bottom-0.5 h-[2px] rounded-full bg-[#3fcfca]" />}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sports.length > 0 && (
            <label>
              <span className="sr-only">Sport</span>
              <select value={state.sport} onChange={(e) => set({ sport: e.target.value })} className={select}>
                <option value="">All sports</option>
                {sports.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          )}
          {years.length > 1 && (
            <label>
              <span className="sr-only">Year</span>
              <select value={state.year} onChange={(e) => set({ year: e.target.value })} className={select}>
                <option value="">All years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            <span className="sr-only">Sort</span>
            <select value={state.sort} onChange={(e) => set({ sort: e.target.value as BackState["sort"] })} className={select}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>
        </div>
      </div>
      <p aria-live="polite" className="mt-3 text-[13px] text-[#f5f1e8]/55">
        Showing {visible.length} of {filtered.length}
        <span className="hidden md:inline"> · J / K to move between stories</span>
      </p>

      {filtered.length === 0 ? (
        <div className="border-b border-white/10 py-10">
          <p className="text-[18px] text-[#f5f1e8]">No {catLabel ? catLabel.toLowerCase() : ""} stories yet.</p>
          <button type="button" onClick={() => router.push("/contact?topic=other#contact-form")} className="mt-2 min-h-[44px] text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
            Got one? Tell the media team →
          </button>
        </div>
      ) : (
        <ul className="mt-2 border-t border-white/10">
          {visible.map((p, i) => (
            <Row key={p.id} post={p} active={i === active} />
          ))}
        </ul>
      )}
      {visible.length < filtered.length && (
        <button type="button" onClick={() => setShown((n) => n + PAGE)} className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/25 px-6 text-[15px] font-semibold hover:-translate-y-0.5 hover:border-white/50">
          Load more
          <ArrowRight aria-hidden className="h-4 w-4 rotate-90" />
        </button>
      )}
    </section>
  );
});
