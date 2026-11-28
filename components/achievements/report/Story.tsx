"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useCopy } from "@/components/contact/interaction/hooks";
import { ANTON } from "@/components/achievements/report/shared";
import type { StoryBlock, StoryInline } from "@/lib/trophy";
import { cn } from "@/lib/utils";

function Inline({ part }: { part: StoryInline }) {
  if (typeof part === "string") return <>{part}</>;
  return (
    <Link href={part.href} className="report-link font-medium text-[#f5f1e8]">
      {part.text}
    </Link>
  );
}

// Hover (or focus) shows "Copy quote"; a click copies it with attribution and a link.
function PullQuote({ text, attribution, url }: { text: string; attribution: string; url: string }) {
  const { copied, copy } = useCopy();
  return (
    <figure className="my-10">
      <button
        type="button"
        onClick={() => copy(`“${text}” — ${attribution}\n${url}`)}
        aria-label={`Copy quote: ${text}`}
        className="group relative block w-full border-l-[3px] border-[#3fcfca] py-1 pl-6 text-left transition hover:border-[#f5f1e8]"
      >
        <blockquote className={cn(ANTON, "text-[30px] leading-[1.08] text-[#3fcfca] transition-colors group-hover:text-[#f5f1e8] md:text-[36px]")}>{text}</blockquote>
        <span
          aria-hidden
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.14em] transition duration-150",
            copied ? "text-[#3fcfca] opacity-100" : "text-[#f5f1e8]/70 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 max-md:opacity-60",
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Quote copied" : "Copy quote"}
        </span>
      </button>
      <span role="status" className="sr-only">
        {copied ? "Quote copied" : ""}
      </span>
    </figure>
  );
}

// The story in report style: drop cap on the first paragraph, one pull quote, inline links,
// paragraphs rising 16px into view.
export function Story({ blocks, attribution, url }: { blocks: StoryBlock[]; attribution: string; url: string }) {
  const reduce = useReducedMotion();
  let firstParagraph = true;
  return (
    <div className="max-w-[640px] text-[18px] leading-[1.75] text-[#f5f1e8]/80">
      {blocks.map((block, i) => {
        if (block.kind === "quote") return <PullQuote key={i} text={block.text} attribution={attribution} url={url} />;
        const drop = firstParagraph;
        firstParagraph = false;
        return (
          <motion.p
            key={i}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={cn("mt-5 first:mt-0", drop && "report-dropcap")}
          >
            {block.parts.map((part, j) => (
              <Inline key={j} part={part} />
            ))}
          </motion.p>
        );
      })}
    </div>
  );
}
