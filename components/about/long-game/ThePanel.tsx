"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mail, UserRound, X } from "lucide-react";
import { FacebookIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import type { PanelPerson } from "@/lib/about";
import type { MemberTier } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | MemberTier;
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Executive", label: "Executive" },
  { value: "Sub-Executive", label: "Sub-executive" },
  { value: "General", label: "General members" },
  { value: "Faculty Advisor", label: "Faculty advisor" },
];

const iconLink = "flex h-9 w-9 items-center justify-center rounded-full text-[#f5f1e8]/70 transition-colors hover:text-[#3fcfca]";

function Links({ person }: { person: PanelPerson }) {
  return (
    <span className="flex items-center">
      {person.email && (
        <a href={`mailto:${person.email}`} aria-label={`Email ${person.name}`} className={iconLink}>
          <Mail aria-hidden className="h-4 w-4" />
        </a>
      )}
      {person.linkedin && (
        <a href={person.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${person.name} on LinkedIn`} className={iconLink}>
          <LinkedinIcon className="h-4 w-4" />
        </a>
      )}
      {person.facebook && (
        <a href={person.facebook} target="_blank" rel="noopener noreferrer" aria-label={`${person.name} on Facebook`} className={iconLink}>
          <FacebookIcon className="h-4 w-4" />
        </a>
      )}
    </span>
  );
}

// Large portrait: grayscale until hovered or focused.
function Portrait({ person }: { person: PanelPerson }) {
  return (
    <article className="group w-[72vw] shrink-0 snap-start sm:w-auto">
      <div data-cursor="view" className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#0f302e]">
        {person.photo ? (
          <Image
            src={person.photo}
            alt={person.name}
            fill
            sizes="(min-width: 1024px) 300px, 72vw"
            className="object-cover grayscale transition duration-500 group-hover:scale-[1.03] group-hover:grayscale-0 group-focus-within:grayscale-0"
          />
        ) : (
          <UserRound aria-hidden className="absolute inset-0 m-auto h-12 w-12 text-[#f5f1e8]/30" />
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[18px] font-semibold leading-snug text-[#f5f1e8]">{person.name}</h3>
          <p className="text-[14px] text-[#f5f1e8]/60">{person.role}</p>
        </div>
        <Links person={person} />
      </div>
    </article>
  );
}

// Small face on the wall: name and role on hover/focus; a click opens a mini profile.
function Face({ person, dim, open, onToggle }: { person: PanelPerson; dim: boolean; open: boolean; onToggle: () => void }) {
  const [tip, setTip] = useState(false);
  const wrap = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && onToggle();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onToggle();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onToggle]);

  return (
    <li ref={wrap} className={cn("relative transition duration-300", dim ? "scale-90 opacity-30" : "opacity-100")}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={`${person.name}, ${person.role}`}
        onPointerEnter={(e) => e.pointerType === "mouse" && setTip(true)}
        onPointerLeave={() => setTip(false)}
        onFocus={() => setTip(true)}
        onBlur={() => setTip(false)}
        onClick={onToggle}
        className="relative block h-12 w-12 overflow-hidden rounded-full border-2 border-transparent bg-[#0f302e] transition hover:-translate-y-0.5 hover:border-[#3fcfca] md:h-14 md:w-14"
      >
        {person.photo ? (
          <Image src={person.photo} alt="" fill sizes="56px" className="object-cover" />
        ) : (
          <UserRound aria-hidden className="absolute inset-0 m-auto h-5 w-5 text-[#f5f1e8]/40" />
        )}
      </button>
      <AnimatePresence>
        {tip && !open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[14rem] -translate-x-1/2 rounded-md border border-white/15 bg-[#082120] px-2.5 py-1.5 text-center"
          >
            <span className="block text-[13px] font-semibold text-[#f5f1e8]">{person.name}</span>
            <span className="block text-[12px] text-[#f5f1e8]/60">{person.role}</span>
          </motion.span>
        )}
        {open && (
          <motion.div
            role="dialog"
            aria-label={person.name}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="absolute left-1/2 top-full z-30 mt-2 w-60 -translate-x-1/2 rounded-lg border border-white/15 bg-[#082120] p-3 shadow-[0_16px_30px_-12px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center gap-3">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#0f302e]">
                {person.photo && <Image src={person.photo} alt="" fill sizes="48px" className="object-cover" />}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold leading-snug text-[#f5f1e8]">{person.name}</span>
                <span className="block text-[13px] text-[#f5f1e8]/60">{person.role}</span>
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Links person={person} />
              <button type="button" onClick={onToggle} aria-label="Close profile" className={iconLink}>
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

// "The panel": the people who run the club, from the current panel list.
export function ThePanel({ people, panelName }: { people: PanelPerson[]; panelName: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const executives = people.filter((p) => p.tier === "Executive");
  const advisors = people.filter((p) => p.tier === "Faculty Advisor").length;
  const students = people.length - advisors;

  return (
    <section aria-labelledby="panel-heading" className="mx-auto max-w-[1280px] px-6 pt-28 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="panel-heading" className="text-[44px] !font-extrabold uppercase leading-none text-[#f5f1e8] md:text-[64px]">
            The {panelName.replace(/-/g, "–")}
          </h2>
          <p className="mt-3 text-[17px] text-[#f5f1e8]/65">
            {students} students{advisors > 0 ? ` and ${advisors === 1 ? "a faculty advisor" : `${advisors} faculty advisors`}` : ""} run this club.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/members" className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
            Meet all members
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/alumni" className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
            Our alumni
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Executive panel as portraits; swipe on phones. */}
      <div className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {executives.map((person) => (
          <Portrait key={person.id} person={person} />
        ))}
      </div>

      <div role="tablist" aria-label="Filter the panel" className="no-scrollbar -mx-6 mt-14 flex gap-1 overflow-x-auto px-6 sm:mx-0 sm:px-0">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="panel-wall"
              onClick={() => setFilter(f.value)}
              className={cn("relative min-h-[44px] shrink-0 px-3.5 text-[15px] font-medium transition-colors", active ? "text-[#3fcfca]" : "text-[#f5f1e8]/70 hover:text-[#f5f1e8]")}
            >
              {f.label}
              {active && <motion.span layoutId="panel-tab" className="absolute inset-x-2 bottom-1 h-[2px] rounded-full bg-[#3fcfca]" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
            </button>
          );
        })}
      </div>

      <ul id="panel-wall" role="tabpanel" className="mt-6 grid grid-cols-5 justify-items-center gap-3 sm:flex sm:flex-wrap sm:gap-2.5">
        {people.map((person) => (
          <Face
            key={person.id}
            person={person}
            dim={filter !== "all" && person.tier !== filter}
            open={open === person.id}
            onToggle={() => setOpen((o) => (o === person.id ? null : person.id))}
          />
        ))}
      </ul>
    </section>
  );
}
