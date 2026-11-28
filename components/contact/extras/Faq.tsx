"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Check, Link2, Plus, Search } from "lucide-react";
import { ToFormButton } from "@/components/contact/extras/FormLinks";
import { useCopy } from "@/components/contact/interaction/hooks";
import { cn } from "@/lib/utils";

export interface FaqItem {
  slug: string; // deep link: /contact#faq-<slug>
  question: string;
  keywords?: string; // extra words the search matches
  answer: ReactNode;
}

// Copies a direct link to one question; the icon morphs into a tick.
function CopyLink({ slug, question }: { slug: string; question: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(`${window.location.origin}/contact#faq-${slug}`)}
      aria-label={copied ? "Link copied" : `Copy a link to “${question}”`}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#f5f1e8]/45 transition-colors hover:text-[#3fcfca]"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={copied ? "y" : "n"} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.14 }}>
          {copied ? <Check aria-hidden className="h-4 w-4 text-[#3fcfca]" /> : <Link2 aria-hidden className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function Item({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) {
  const reduce = useReducedMotion();
  const id = `faq-${item.slug}`;
  return (
    <div id={id} className="scroll-mt-36 border-b border-white/10">
      <div className="flex items-center gap-2">
        <h3 className="min-w-0 flex-1">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-answer`}
            onClick={onToggle}
            className="flex w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-semibold text-[#f5f1e8] hover:text-[#3fcfca]"
          >
            {item.question}
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
            initial={reduce ? { opacity: 0 } : { height: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.28, ease: [0.3, 0.7, 0.3, 1] }}
            className="overflow-hidden"
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.08 }}
              className="max-w-[680px] pb-6 text-[16px] leading-relaxed text-[#f5f1e8]/80 [&_a:hover]:underline [&_a]:font-semibold [&_a]:text-[#3fcfca] [&_a]:underline-offset-4"
            >
              {item.answer}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// "Before you ask": every question with a real answer, a search over them, and a link back up.
export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // A link to one question (#faq-join) opens it and scrolls to it.
  useEffect(() => {
    const openFromHash = () => {
      const slug = window.location.hash.replace(/^#faq-/, "");
      if (!window.location.hash.startsWith("#faq-") || !items.some((item) => item.slug === slug)) return;
      setQuery("");
      setOpen(slug);
      requestAnimationFrame(() => document.getElementById(`faq-${slug}`)?.scrollIntoView({ block: "start" }));
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [items]);

  if (items.length === 0) return null;
  const q = query.trim().toLowerCase();
  const shown = q ? items.filter((item) => `${item.question} ${item.keywords ?? ""}`.toLowerCase().includes(q)) : items;

  return (
    <div>
      <h2 id="faq-heading" className="text-[40px] !font-extrabold leading-none text-[#f5f1e8]">
        Before you ask
      </h2>
      <label className="mt-8 flex max-w-sm items-center gap-3 border-b border-white/20 pb-2 transition-colors focus-within:border-[#3fcfca]">
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
          <Item key={item.slug} item={item} open={open === item.slug} onToggle={() => setOpen(open === item.slug ? null : item.slug)} />
        ))}
        {shown.length === 0 && <p className="border-b border-white/10 py-5 text-[15px] text-[#f5f1e8]/60">No question matches that. Ask the panel instead.</p>}
      </div>
      <ToFormButton className="group mt-6 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
        Still stuck? Send us a message
        <ArrowUp aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:-translate-y-0.5" />
      </ToFormButton>
    </div>
  );
}
