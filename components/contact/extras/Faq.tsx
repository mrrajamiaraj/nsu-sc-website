"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Check, Link2, Plus, Search, ThumbsDown, ThumbsUp } from "lucide-react";
import { ToFormButton } from "@/components/contact/extras/FormLinks";
import { SectionHeading } from "@/components/contact/extras/shared";
import { useCopy } from "@/components/contact/interaction/hooks";
import { cn } from "@/lib/utils";

export interface FaqItem {
  slug: string; // deep link: /contact#faq-<slug>
  question: string;
  answer: ReactNode;
  keywords?: string; // extra words the search should match
}

const FEEDBACK_KEY = "nsusc-faq-feedback";

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-transparent text-[#3fcfca]">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

// "Was this helpful?" Counts are kept in this browser only.
// [placeholder] Send these to the club's analytics once there is one.
function Helpful({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  const vote = (helpful: boolean) => {
    try {
      const all = JSON.parse(window.localStorage.getItem(FEEDBACK_KEY) ?? "{}") as Record<string, { up: number; down: number }>;
      const entry = all[slug] ?? { up: 0, down: 0 };
      entry[helpful ? "up" : "down"] += 1;
      all[slug] = entry;
      window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all));
    } catch {
      // Storage blocked: just say thanks.
    }
    setDone(true);
  };
  return (
    <div className="mt-4 flex items-center gap-3 text-[14px] text-[#f5f1e8]/60" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.span key="thanks" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[#3fcfca]">
            Thanks!
          </motion.span>
        ) : (
          <motion.span key="ask" exit={{ opacity: 0, y: -4 }} className="inline-flex items-center gap-3">
            Was this helpful?
            <button type="button" onClick={() => vote(true)} className="inline-flex items-center gap-1 font-semibold text-[#f5f1e8]/80 hover:text-[#3fcfca]">
              <ThumbsUp aria-hidden className="h-4 w-4" />
              Yes
            </button>
            <button type="button" onClick={() => vote(false)} className="inline-flex items-center gap-1 font-semibold text-[#f5f1e8]/80 hover:text-[#3fcfca]">
              <ThumbsDown aria-hidden className="h-4 w-4" />
              No
            </button>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function CopyLink({ slug, question }: { slug: string; question: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(`${window.location.origin}${window.location.pathname}#faq-${slug}`)}
      aria-label={copied ? "Link copied" : `Copy a link to “${question}”`}
      title={copied ? "Link copied" : "Copy link"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#f5f1e8]/50 transition-colors hover:text-[#3fcfca]"
    >
      {copied ? <Check aria-hidden className="h-4 w-4 text-[#3fcfca]" /> : <Link2 aria-hidden className="h-4 w-4" />}
    </button>
  );
}

function Item({ item, open, query, onToggle }: { item: FaqItem; open: boolean; query: string; onToggle: () => void }) {
  const reduce = useReducedMotion();
  const id = `faq-${item.slug}`;
  return (
    <div id={id} className="scroll-mt-28 border-b border-white/10">
      <div className="flex items-center gap-2">
        <h3 className="min-w-0 flex-1">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-answer`}
            onClick={onToggle}
            className="flex w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-semibold text-[#f5f1e8] transition-colors hover:text-[#3fcfca]"
          >
            <span>
              <Highlight text={item.question} query={query} />
            </span>
            {/* The plus turns 45° into an x when open. */}
            <Plus aria-hidden className={cn("h-5 w-5 shrink-0 transition-transform duration-300 motion-reduce:transition-none", open && "rotate-45")} />
          </button>
        </h3>
        <CopyLink slug={item.slug} question={item.question} />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-answer`}
            role="region"
            aria-label={item.question}
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.28, ease: [0.3, 0.7, 0.3, 1] }}
            className="overflow-hidden"
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.08 }}
              className="max-w-[680px] pb-6 text-[16px] leading-relaxed text-[#f5f1e8]/80 [&_a:hover]:underline [&_a]:font-semibold [&_a]:text-[#3fcfca] [&_a]:underline-offset-4"
            >
              {item.answer}
              <Helpful slug={item.slug} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq({ items, className }: { items: FaqItem[]; className?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // A link to one question (#faq-fees) opens it and scrolls to it.
  useEffect(() => {
    const openFromHash = () => {
      const slug = window.location.hash.replace(/^#faq-/, "");
      if (!window.location.hash.startsWith("#faq-") || !items.some((item) => item.slug === slug)) return;
      setOpen(slug);
      requestAnimationFrame(() => document.getElementById(`faq-${slug}`)?.scrollIntoView({ block: "start" }));
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [items]);

  const q = query.trim().toLowerCase();
  const shown = items.filter((item) => !q || `${item.question} ${item.keywords ?? ""}`.toLowerCase().includes(q));

  return (
    <section aria-labelledby="faq-heading" className={cn("border-t border-white/10 pt-14", className)}>
      <SectionHeading id="faq-heading" title="Before you ask" />
      <label className="mt-6 flex max-w-md items-center gap-3 border-b border-white/20 pb-2 transition-colors focus-within:border-[#3fcfca]">
        <Search aria-hidden className="h-4 w-4 text-[#f5f1e8]/50" />
        <span className="sr-only">Search the questions</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the questions"
          className="w-full border-0 bg-transparent text-[15px] text-[#f5f1e8] placeholder:text-[#f5f1e8]/40 focus:outline-none"
        />
      </label>
      <p aria-live="polite" className="sr-only">
        {q ? `${shown.length} ${shown.length === 1 ? "question matches" : "questions match"}` : ""}
      </p>
      <div className="mt-6 border-t border-white/10">
        {shown.map((item) => (
          <Item key={item.slug} item={item} query={query} open={open === item.slug} onToggle={() => setOpen(open === item.slug ? null : item.slug)} />
        ))}
        {shown.length === 0 && <p className="py-5 text-[15px] text-[#f5f1e8]/60">No questions match. Ask the panel directly with the form above.</p>}
      </div>
      <ToFormButton className="group mt-6 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
        Still stuck? Send us a message
        <ArrowUp aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:-translate-y-0.5" />
      </ToFormButton>
    </section>
  );
}
