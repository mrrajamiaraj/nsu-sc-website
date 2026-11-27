"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Plus } from "lucide-react";
import { ToFormButton } from "@/components/contact/extras/FormLinks";
import { SectionHeading } from "@/components/contact/extras/shared";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

function Item({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <div className="border-b border-white/10">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-answer`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-semibold text-[#f5f1e8] transition-colors hover:text-[#3fcfca] focus-visible:text-[#3fcfca] focus-visible:outline-none"
        >
          {item.question}
          {/* The plus turns into an x when open. */}
          <Plus aria-hidden className={cn("h-5 w-5 shrink-0 transition-transform duration-300 motion-reduce:transition-none", open && "rotate-45")} />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-answer`}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.3, 0.7, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="max-w-[680px] pb-6 text-[16px] leading-relaxed text-[#f5f1e8]/80 [&_a]:font-semibold [&_a]:text-[#3fcfca] [&_a]:underline-offset-4 [&_a:hover]:underline">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq({ items, className }: { items: FaqItem[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section aria-labelledby="faq-heading" className={cn("border-t border-white/10 pt-14", className)}>
      <SectionHeading id="faq-heading" title="Before you ask" />
      <div className="mt-6 border-t border-white/10">
        {items.map((item, i) => (
          <Item key={item.question} item={item} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
        ))}
      </div>
      <ToFormButton className="mt-6 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none">
        Still stuck? Send us a message
        <ArrowUp aria-hidden className="h-4 w-4" />
      </ToFormButton>
    </section>
  );
}
