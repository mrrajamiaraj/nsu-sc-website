"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Plus } from "lucide-react";
import { ToFormButton } from "@/components/contact/extras/FormLinks";
import { cn } from "@/lib/utils";

export interface FaqItem {
  slug: string; // deep link: /contact#faq-<slug>
  question: string;
  answer: ReactNode;
}

function Item({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) {
  const reduce = useReducedMotion();
  const id = `faq-${item.slug}`;
  return (
    <div id={id} className="scroll-mt-28 border-b border-white/10">
      <h3>
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
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-answer`}
            role="region"
            aria-label={item.question}
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
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

// "Before you ask": a short accordion of questions that have real answers.
export function Faq({ items, className }: { items: FaqItem[]; className?: string }) {
  const [open, setOpen] = useState<string | null>(null);

  // A link to one question (#faq-join) opens it and scrolls to it.
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

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading" className={className}>
      <h2 id="faq-heading" className="text-[40px] !font-extrabold leading-none text-[#f5f1e8]">
        Before you ask
      </h2>
      <div className="mt-8 border-t border-white/10">
        {items.map((item) => (
          <Item key={item.slug} item={item} open={open === item.slug} onToggle={() => setOpen(open === item.slug ? null : item.slug)} />
        ))}
      </div>
      <ToFormButton className="group mt-6 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
        Still stuck? Send us a message
        <ArrowUp aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:-translate-y-0.5" />
      </ToFormButton>
    </section>
  );
}
