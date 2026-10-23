"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UserRound, X } from "lucide-react";
import { meaningfulDesignation } from "@/components/members/MemberCard";
import { isExternal, memberLinks } from "@/components/members/memberLinks";
import type { Member } from "@/lib/types";

const TIER_LABEL: Record<Member["tier"], string> = {
  "Faculty Advisor": "Faculty advisor",
  Executive: "Executive committee",
  "Sub-Executive": "Sub-executive committee",
  General: "General member",
};

// Profile popup opened from a member card. Closes on Escape, backdrop click or the X.
export function MemberProfileModal({ member, onClose }: { member: Member | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!member) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [member, onClose]);

  return (
    <AnimatePresence>
      {member && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-night-950/70 p-4 backdrop-blur-sm sm:items-center"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-profile-name"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            className="glass-panel relative grid max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-night-900/80 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close profile"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-night-950/60 text-slate-300 backdrop-blur-md transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="photo-backdrop aspect-[4/3] w-full sm:aspect-auto sm:min-h-[22rem]">
              {member.photo ? (
                <Image src={member.photo} alt={member.name} fill sizes="(min-width: 640px) 320px, 100vw" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserRound className="h-14 w-14 text-white/30" strokeWidth={1.5} />
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 sm:p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-slate-400">{TIER_LABEL[member.tier]}</p>
              <h2
                id="member-profile-name"
                className="mt-3 font-display text-3xl font-semibold uppercase leading-none text-white sm:text-4xl"
              >
                {member.name}
              </h2>
              {meaningfulDesignation(member) && (
                <p className="mt-2 font-mono text-sm uppercase tracking-wider text-blue-300">{meaningfulDesignation(member)}</p>
              )}

              {member.additionalInfo && (
                <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-300">{member.additionalInfo}</p>
              )}

              {memberLinks(member).length > 0 && (
                <ul className="mt-6 space-y-2 border-t border-white/10 pt-5">
                  {memberLinks(member).map((link) => {
                    const external = isExternal(link.href);
                    return (
                      <li key={link.key}>
                        <a
                          href={link.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 transition-colors hover:border-blue-400/50 hover:bg-blue-400/10 hover:text-white"
                        >
                          <link.icon className="h-4 w-4 shrink-0 text-blue-300" />
                          <span className="truncate">{link.value}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
