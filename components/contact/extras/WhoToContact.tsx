"use client";

import Image from "next/image";
import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mail, Search, UserRound } from "lucide-react";
import { LinkedinIcon } from "@/components/ui/SocialIcons";
import { Ph, SectionHeading } from "@/components/contact/extras/shared";
import { PREFILL_EVENT, useMedia } from "@/components/contact/interaction/hooks";
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

// Wraps the parts of `text` that match the search in teal.
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

const iconButton =
  "flex h-10 w-10 items-center justify-center rounded-full text-[#f5f1e8]/70 transition-colors hover:text-[#3fcfca]";

function Actions({ row, who, show }: { row: DirectoryRow; who: string; show: boolean }) {
  const actions: { key: string; node: ReactNode }[] = [];
  if (row.email)
    actions.push({
      key: "email",
      node: (
        <a href={`mailto:${row.email}`} aria-label={`Email ${who}`} className={iconButton}>
          <Mail aria-hidden className="h-[18px] w-[18px]" />
        </a>
      ),
    });
  if (row.whatsapp)
    actions.push({
      key: "whatsapp",
      node: (
        <a href={row.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${who}`} className={iconButton}>
          <WhatsAppIcon className="h-[18px] w-[18px]" />
        </a>
      ),
    });
  if (row.linkedin)
    actions.push({
      key: "linkedin",
      node: (
        <a href={row.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${who} on LinkedIn`} className={iconButton}>
          <LinkedinIcon className="h-[17px] w-[17px]" />
        </a>
      ),
    });
  return (
    <div className="flex shrink-0 items-center">
      {actions.map((action, i) => (
        // On desktop the icons fly in from the right one after another; on touch they're always there.
        <motion.span
          key={action.key}
          initial={false}
          animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: 14 }}
          transition={{ delay: show ? i * 0.05 : 0, type: "spring", stiffness: 420, damping: 26 }}
          className="inline-flex"
        >
          {action.node}
        </motion.span>
      ))}
    </div>
  );
}

function Row({ row, query, match, open, onToggle }: { row: DirectoryRow; query: string; match: boolean; open: boolean; onToggle: () => void }) {
  const touch = !useMedia("(hover: hover) and (pointer: fine)");
  const [hover, setHover] = useState(false);
  const panelId = useId();
  const who = row.name ?? row.role;
  const showActions = touch || hover || open;

  return (
    <div
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setHover(false)}
      className={cn("group/dir rounded-lg border-t border-white/10 transition-[opacity,background-color] duration-300", match ? "opacity-100" : "opacity-30", (hover || open) && "bg-white/[0.03]")}
    >
      <div className="flex items-center gap-3 px-1 py-4">
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-4 text-left">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0f302e]">
            {row.photo ? (
              <Image
                src={row.photo}
                alt=""
                fill
                sizes="48px"
                className={cn("object-cover transition duration-300", hover || open ? "grayscale-0" : "grayscale")}
              />
            ) : (
              <UserRound aria-hidden className="h-5 w-5 text-[#f5f1e8]/40" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block break-words text-[17px] font-semibold leading-snug text-[#f5f1e8]">
              {row.name ? <Highlight text={row.name} query={query} /> : <Ph>Name</Ph>}
            </span>
            <span className="block text-[14px] text-[#f5f1e8]/60">
              <Highlight text={row.role} query={query} />
            </span>
            {row.topics.length > 0 && (
              <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f5f1e8]/45">
                {row.topics.map((topic) => DIRECTORY_LABELS[topic]).join(" · ")}
              </span>
            )}
          </span>
        </button>
        <Actions row={row} who={who} show={showActions} />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 px-1 pb-4 pl-[4.25rem] text-[14px] leading-relaxed text-[#f5f1e8]/75">
              <p>{row.bio ?? <Ph>short bio</Ph>}</p>
              <p>
                <span className="text-[#f5f1e8]/50">Sports: </span>
                {row.sports.length > 0 ? row.sports.join(", ") : <Ph>sports</Ph>}
              </p>
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: { greeting: `Hi ${row.firstName ?? "there"}, ` } }))
                }
                className="inline-flex min-h-[40px] items-center gap-1.5 font-semibold text-[#3fcfca] underline-offset-4 hover:underline"
              >
                Message {row.firstName ?? "this role"}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Panel directory by topic. Search and filters fade rows that don't match (no reflow).
export function WhoToContact({ rows, className }: { rows: DirectoryRow[]; className?: string }) {
  const [filter, setFilter] = useState<DirectoryTopic | "all">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const filters: (DirectoryTopic | "all")[] = ["all", ...DIRECTORY_FILTERS];
  const listId = useId();

  const matches = (row: DirectoryRow) => {
    const q = query.trim().toLowerCase();
    const inTopic = filter === "all" || row.topics.includes(filter);
    const inSearch = !q || [row.name ?? "", row.role, ...row.sports].some((text) => text.toLowerCase().includes(q));
    return inTopic && inSearch;
  };
  const count = rows.filter(matches).length;

  return (
    <section aria-labelledby="who-heading" className={cn("border-t border-white/10 pt-14", className)}>
      <SectionHeading id="who-heading" title="Who to contact" intro="Skip the queue, message the right person." />

      <label className="mt-6 flex max-w-md items-center gap-3 border-b border-white/20 pb-2 transition-colors focus-within:border-[#3fcfca]">
        <Search aria-hidden className="h-4 w-4 text-[#f5f1e8]/50" />
        <span className="sr-only">Search by name, role or sport</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, role or sport"
          className="w-full border-0 bg-transparent text-[15px] text-[#f5f1e8] placeholder:text-[#f5f1e8]/40 focus:outline-none"
        />
      </label>

      {/* Filter tabs: the teal underline slides to the chosen tab. */}
      <div role="tablist" aria-label="Filter by topic" className="no-scrollbar -mx-6 mt-5 flex gap-1 overflow-x-auto px-6 md:mx-0 md:px-0">
        {filters.map((value) => {
          const active = filter === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={listId}
              onClick={() => setFilter(value)}
              className={cn(
                "relative min-h-[44px] shrink-0 px-3.5 text-[15px] font-medium transition-colors",
                active ? "text-[#3fcfca]" : "text-[#f5f1e8]/70 hover:text-[#f5f1e8]",
              )}
            >
              {value === "all" ? "All" : DIRECTORY_LABELS[value]}
              {active && (
                <motion.span layoutId="directory-tab" className="absolute inset-x-2 bottom-1 h-[2px] rounded-full bg-[#3fcfca]" transition={{ type: "spring", stiffness: 500, damping: 36 }} />
              )}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="sr-only">
        {count} {count === 1 ? "person matches" : "people match"}
      </p>

      <ul id={listId} role="tabpanel" className="mt-4 grid gap-x-10 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((row, i) => (
          <motion.li
            key={row.key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.35, delay: i * 0.04, ease: "easeOut" }}
          >
            <Row row={row} query={query} match={matches(row)} open={open === row.key} onToggle={() => setOpen(open === row.key ? null : row.key)} />
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
