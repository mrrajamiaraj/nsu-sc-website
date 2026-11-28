"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Copy, Mail, MessageCircle, Phone } from "lucide-react";
import { FacebookIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { Face } from "@/components/members/album/Face";
import { DISPLAY } from "@/components/members/album/Card";
import { useCopy } from "@/components/contact/interaction/hooks";
import type { PanelContact, PanelPerson } from "@/lib/members-sheet";
import { cn } from "@/lib/utils";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const CONTACT: Record<PanelContact["key"], { label: string; icon: (p: { className?: string }) => JSX.Element; open: string }> = {
  facebook: { label: "Facebook", icon: FacebookIcon, open: "Open" },
  instagram: { label: "Instagram", icon: InstagramIcon, open: "Open" },
  linkedin: { label: "LinkedIn", icon: LinkedinIcon, open: "Open" },
  email: { label: "Email", icon: (p) => <Mail aria-hidden {...p} />, open: "Mail" },
  phone: { label: "Phone", icon: (p) => <Phone aria-hidden {...p} />, open: "Call" },
  whatsapp: { label: "WhatsApp", icon: (p) => <MessageCircle aria-hidden {...p} />, open: "Open chat" },
};

const action =
  "inline-flex min-h-[32px] items-center gap-1 rounded-full border border-[#0b1a18]/20 px-2.5 text-[12px] font-semibold text-[#0b1a18] transition hover:border-[#0f6f68] hover:text-[#0f6f68] active:scale-[0.97]";

// "Copy" morphs into "Copied ✓".
function CopyButton({ text, what }: { text: string; what: string }) {
  const { copied, copy } = useCopy();
  return (
    <button type="button" onClick={() => copy(text)} aria-label={copied ? `${what} copied` : `Copy ${what}`} className={action}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={copied ? "y" : "n"} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.12 }} className="inline-flex items-center gap-1">
          {copied ? <Check aria-hidden className="h-3.5 w-3.5" /> : <Copy aria-hidden className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

const row = { hidden: { opacity: 0, y: 6 }, shown: { opacity: 1, y: 0 } };

/** The stats side of a card: profile and contact rows, only those on record. */
export function CardBack({ person, play }: { person: PanelPerson; play: boolean }) {
  const profile: { label: string; value: JSX.Element | string }[] = [];
  if (person.department) profile.push({ label: "Department", value: person.department });
  if (person.batch) profile.push({ label: "Batch", value: person.batch });
  if (person.squads.length)
    profile.push({
      label: person.squads.length > 1 ? "Squads" : "Squad",
      value: (
        <>
          {person.squads.map((s, i) => (
            <span key={s.sport}>
              {i > 0 && ", "}
              {s.href ? (
                <Link href={s.href} className="font-semibold text-[#0f6f68] underline-offset-2 hover:underline">
                  {s.sport}
                </Link>
              ) : (
                s.sport
              )}
            </span>
          ))}
        </>
      ),
    });
  const role = person.tier === "advisor" ? "Faculty Advisor" : (person.role ?? (person.page === "sub-executive" ? "Sub-Executive" : "General Member"));

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[14px] border-2 border-[#0f6f68]/50 bg-[#f4f1ea] text-[#0b1a18]">
      <span aria-hidden className="album-crest pointer-events-none absolute -right-10 bottom-[-30px] h-64 w-64 text-[#0b1a18] opacity-[0.05]" />
      <motion.div
        className="relative flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-5 sm:px-6"
        initial="hidden"
        animate={play ? "shown" : "hidden"}
        variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
      >
        <motion.div variants={row} className="flex items-center gap-3.5 pr-8">
          <Face person={person} size={56} className="ring-2 ring-[#0f6f68]/40" />
          <div className="min-w-0">
            <h2 id="album-card-title" className={cn(DISPLAY, "!text-[30px] !font-extrabold uppercase !leading-[0.92] text-[#0b1a18]")}>
              {person.name}
            </h2>
            <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.12em] text-[#0f6f68]">
              {role}
              {person.captain && " · Captain's armband"}
            </p>
          </div>
        </motion.div>

        {(profile.length > 0 || person.bio) && (
          <>
            <motion.h3 variants={row} className="mt-5 border-b border-[#0b1a18]/15 pb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0b1a18]/55">
              Profile
            </motion.h3>
            <dl>
              {profile.map((p) => (
                <motion.div key={p.label} variants={row} className="flex items-baseline justify-between gap-4 border-b border-[#0b1a18]/10 py-2 text-[14px]">
                  <dt className="text-[#0b1a18]/60">{p.label}</dt>
                  <dd className="text-right font-medium">{p.value}</dd>
                </motion.div>
              ))}
            </dl>
            {person.bio && (
              <motion.p variants={row} className="mt-2.5 line-clamp-3 text-[14px] leading-relaxed text-[#0b1a18]/80">
                {person.bio}
              </motion.p>
            )}
          </>
        )}

        {person.contacts.length > 0 && (
          <>
            <motion.h3 variants={row} className="mt-5 border-b border-[#0b1a18]/15 pb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0b1a18]/55">
              Contact
            </motion.h3>
            <ul>
              {person.contacts.map((c) => {
                const meta = CONTACT[c.key];
                const Icon = meta.icon;
                const external = c.href.startsWith("http");
                return (
                  <motion.li key={c.key} variants={row} className="flex items-center gap-3 border-b border-[#0b1a18]/10 py-2">
                    <Icon className="h-4 w-4 shrink-0 text-[#0f6f68]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0b1a18]/55">{meta.label}</span>
                      <span className="block truncate text-[13.5px] font-medium">{c.value}</span>
                    </span>
                    <span className="flex shrink-0 gap-1.5">
                      <a href={c.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={action}>
                        {meta.open}
                        {external && <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />}
                        <span className="sr-only">
                          {" "}
                          {meta.label} {external ? "(opens in a new tab)" : ""}
                        </span>
                      </a>
                      {c.copy && <CopyButton text={c.copy} what={meta.label.toLowerCase()} />}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </>
        )}
      </motion.div>
    </div>
  );
}
