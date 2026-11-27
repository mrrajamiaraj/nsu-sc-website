"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, UserRound } from "lucide-react";
import { LinkedinIcon } from "@/components/ui/SocialIcons";
import { Ph, SectionHeading } from "@/components/contact/extras/shared";
import { DIRECTORY_FILTERS, DIRECTORY_LABELS, type DirectoryTopic } from "@/lib/contact-extras";
import type { DirectoryRow } from "@/lib/contact-directory";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 20.5l1.3-4A8.5 8.5 0 1 1 8 19.6z" />
      <path d="M9 8.6c.2 2.9 2.5 5.3 5.4 5.6l1.1-1.2-1.8-1-1 .8a4.6 4.6 0 0 1-2.4-2.4l.8-1-1-1.8z" />
    </svg>
  );
}

const iconButton =
  "flex h-10 w-10 items-center justify-center rounded-full text-[#f5f1e8]/70 transition-colors hover:text-[#3fcfca] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fcfca]";

function Row({ row }: { row: DirectoryRow }) {
  const who = row.name ?? row.role;
  return (
    <div className="flex items-center gap-4 border-t border-white/10 py-4">
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0f302e]">
        {row.photo ? (
          <Image src={row.photo} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <UserRound aria-hidden className="h-5 w-5 text-[#f5f1e8]/40" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="break-words text-[17px] font-semibold leading-snug text-[#f5f1e8]">{row.name ?? <Ph>Name</Ph>}</p>
        <p className="text-[14px] text-[#f5f1e8]/60">{row.role}</p>
        {row.topics.length > 0 && (
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f5f1e8]/45">
            {row.topics.map((topic) => DIRECTORY_LABELS[topic]).join(" · ")}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center">
        {row.email && (
          <a href={`mailto:${row.email}`} aria-label={`Email ${who}`} className={iconButton}>
            <Mail aria-hidden className="h-[18px] w-[18px]" />
          </a>
        )}
        {row.whatsapp && (
          <a href={row.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${who}`} className={iconButton}>
            <WhatsAppIcon className="h-[18px] w-[18px]" />
          </a>
        )}
        {row.linkedin && (
          <a href={row.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${who} on LinkedIn`} className={iconButton}>
            <LinkedinIcon className="h-[17px] w-[17px]" />
          </a>
        )}
      </div>
    </div>
  );
}

// Panel directory by topic. Filtering fades rows that don't match (no reflow).
export function WhoToContact({ rows, className }: { rows: DirectoryRow[]; className?: string }) {
  const [filter, setFilter] = useState<DirectoryTopic | "all">("all");
  const filters: (DirectoryTopic | "all")[] = ["all", ...DIRECTORY_FILTERS];

  return (
    <section aria-labelledby="who-heading" className={cn("border-t border-white/10 pt-14", className)}>
      <SectionHeading id="who-heading" title="Who to contact" intro="Skip the queue, message the right person." />

      <div role="group" aria-label="Filter by topic" className="no-scrollbar -mx-6 mt-6 flex gap-2 overflow-x-auto px-6 md:mx-0 md:flex-wrap md:px-0">
        {filters.map((value) => {
          const active = filter === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(value)}
              className={cn(
                "min-h-[40px] shrink-0 rounded-full border px-4 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fcfca]",
                active ? "border-[#3fcfca] text-[#3fcfca]" : "border-white/15 text-[#f5f1e8]/75 hover:border-white/30 hover:text-[#f5f1e8]",
              )}
            >
              {value === "all" ? "All" : DIRECTORY_LABELS[value]}
            </button>
          );
        })}
      </div>

      <ul className="mt-6 grid gap-x-10 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((row, i) => {
          const match = filter === "all" || row.topics.includes(filter);
          return (
            <motion.li
              key={row.key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: i * 0.04, ease: "easeOut" }}
            >
              <div className={cn("transition-opacity duration-300", match ? "opacity-100" : "opacity-30")}>
                <Row row={row} />
              </div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
