"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { PREFILL_EVENT } from "@/components/contact/interaction/hooks";
import { Cutout, Silhouette, initials } from "@/components/teams/announcement/Cutout";
import { DIRECTORY_FILTERS, DIRECTORY_LABELS, type DirectoryTopic } from "@/lib/contact-extras";
import type { PanelPerson } from "@/lib/contact-panel";
import { cn } from "@/lib/utils";

// Header faces and "Who to contact" talk through this: a face click highlights its person.
const HIGHLIGHT_EVENT = "nsusc:contact-highlight"; // detail: person id

function Portrait({ person, size, lifted = false, className }: { person: PanelPerson; size: number; lifted?: boolean; className?: string }) {
  return (
    <span className={cn("relative block shrink-0 rounded-full bg-[#13312d]", className)} style={{ width: size, height: size }}>
      {/* The cut-out sits in its disc and pops out over the top when lifted. */}
      <span
        className="absolute inset-0 block transition-[clip-path,transform] duration-300 ease-out motion-reduce:transition-opacity"
        style={{
          clipPath: lifted ? "inset(-30% 0 0 0 round 0 0 50% 50%)" : "inset(0 round 50%)",
          transform: lifted ? "scale(1.08)" : undefined,
        }}
      >
        {person.photo ? (
          <Cutout person={person} boxRatio={1} fill={1.45} align="top" sizes={`${size * 2}px`} />
        ) : (
          <>
            <Silhouette />
            <span aria-hidden className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-[#f5f1e8]/60" style={{ fontSize: size * 0.28 }}>
              {initials(person.name)}
            </span>
          </>
        )}
      </span>
    </span>
  );
}

// ---- Header: four small overlapping faces next to the reply-time line.

export function PanelFaces({ people }: { people: PanelPerson[] }) {
  const [active, setActive] = useState<string | null>(null);
  if (people.length === 0) return null;
  return (
    <div className="flex items-center gap-3">
      <ul className="flex pl-1.5" aria-label="The panel">
        {people.map((p, i) => (
          <li key={p.id} className="relative -ml-1.5" style={{ zIndex: active === p.id ? 20 : people.length - i }}>
            <button
              type="button"
              aria-label={`${p.name}, ${p.role}. Show in Who to contact`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(p.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(p.id)}
              onBlur={() => setActive(null)}
              onClick={() => {
                window.dispatchEvent(new CustomEvent(HIGHLIGHT_EVENT, { detail: p.id }));
                document.getElementById("who-heading")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="block rounded-full ring-2 ring-[#0b2524] transition-transform duration-150 hover:-translate-y-0.5"
            >
              <Portrait person={p} size={40} />
            </button>
            <AnimatePresence>
              {active === p.id && (
                <motion.span
                  role="tooltip"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max -translate-x-1/2 rounded-lg border border-white/15 bg-[#082120] px-3 py-1.5 text-left shadow-xl"
                >
                  <span className="block text-[13px] font-semibold text-[#f5f1e8]">{p.name}</span>
                  <span className="block text-[12px] text-[#f5f1e8]/60">{p.role}</span>
                </motion.span>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
      <p className="text-[14px] text-[#f5f1e8]/65">The panel reads every message.</p>
    </div>
  );
}

// ---- "Who to contact": the executives, then squad leads and department heads once they're
// on the panel. Search and topic filters appear only when there are more than four people.

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

export function WhoToContact({ people }: { people: PanelPerson[] }) {
  const reduce = Boolean(useReducedMotion());
  const [hover, setHover] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [filter, setFilter] = useState<DirectoryTopic | "all">("all");
  const [query, setQuery] = useState("");
  const tools = people.length > 4;

  // A header face click lands here and highlights its person for a moment.
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setFlash(id);
      window.setTimeout(() => setFlash((f) => (f === id ? null : f)), 1800);
    };
    window.addEventListener(HIGHLIGHT_EVENT, on);
    return () => window.removeEventListener(HIGHLIGHT_EVENT, on);
  }, []);

  if (people.length === 0) return null;
  const q = query.trim().toLowerCase();
  const shown = people.filter(
    (p) => (filter === "all" || p.topics.includes(filter)) && (!q || [p.name, p.role, ...p.topics.map((t) => DIRECTORY_LABELS[t])].some((t) => t.toLowerCase().includes(q))),
  );
  const filters: (DirectoryTopic | "all")[] = ["all", ...DIRECTORY_FILTERS];

  return (
    <div>
      <h2 id="who-heading" className="text-[40px] !font-extrabold leading-none text-[#f5f1e8]">
        Who to contact
      </h2>
      <p className="mt-3 text-[16px] text-[#f5f1e8]/60">Skip the queue, message the right person.</p>

      {tools && (
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <label className="flex w-full max-w-sm items-center gap-3 border-b border-white/20 pb-2 transition-colors focus-within:border-[#3fcfca]">
            <Search aria-hidden className="h-4 w-4 text-[#f5f1e8]/50" />
            <span className="sr-only">Search by name, role or topic</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, role or topic"
              className="w-full border-0 bg-transparent text-[15px] text-[#f5f1e8] placeholder:text-[#f5f1e8]/40 focus:outline-none"
            />
          </label>
          <div role="group" aria-label="Filter by topic" className="no-scrollbar -mx-6 flex gap-1 overflow-x-auto px-6 md:mx-0 md:px-0">
            {filters.map((value) => {
              const on = filter === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(value)}
                  className={cn("relative min-h-[44px] shrink-0 px-3 text-[14px] font-semibold transition-colors", on ? "text-[#3fcfca]" : "text-[#f5f1e8]/65 hover:text-[#f5f1e8]")}
                >
                  {value === "all" ? "All" : DIRECTORY_LABELS[value]}
                  {on && <motion.span layoutId="who-filter" aria-hidden className="absolute inset-x-2 bottom-1 h-[2px] rounded-full bg-[#3fcfca]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {tools && (
        <p aria-live="polite" className="sr-only">
          {shown.length} {shown.length === 1 ? "person matches" : "people match"}
        </p>
      )}

      <ul className="mt-8 grid grid-cols-2 gap-x-6 lg:grid-cols-3 lg:gap-x-10">
        {shown.map((p) => {
          const lifted = hover === p.id || flash === p.id;
          return (
            <li
              key={p.id}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHover(p.id)}
              onPointerLeave={() => setHover(null)}
              className={cn("flex flex-col gap-4 border-t border-white/10 py-6 transition-colors duration-500 sm:flex-row sm:items-center", flash === p.id && "bg-[#3fcfca]/[0.06]")}
            >
              <Portrait person={p} size={72} lifted={lifted && !reduce} className={cn("ring-2 transition-[box-shadow] duration-200", lifted ? "ring-[#3fcfca]" : "ring-transparent")} />
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold leading-snug text-[#f5f1e8]">
                  <Highlight text={p.name} query={query} />
                </p>
                <p className="mt-0.5 text-[14px] text-[#f5f1e8]/60">
                  <Highlight text={p.role} query={query} />
                </p>
                {p.topics.length > 0 && (
                  <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f5f1e8]/45">{p.topics.map((t) => DIRECTORY_LABELS[t]).join(" · ")}</p>
                )}
                <button
                  type="button"
                  onFocus={() => setHover(p.id)}
                  onBlur={() => setHover(null)}
                  onClick={() => window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: { greeting: `Hi ${p.firstName}, ` } }))}
                  className="group mt-1 inline-flex min-h-[40px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca]"
                >
                  Message
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  <span className="sr-only">{p.firstName}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {shown.length === 0 && <p className="border-t border-white/10 py-6 text-[15px] text-[#f5f1e8]/60">No one matches. Try another name or topic.</p>}
      <Link href="/members" className="group mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#f5f1e8]/75 hover:text-[#3fcfca]">
        See the full panel
        <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
