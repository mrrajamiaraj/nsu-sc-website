"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UserRound, X } from "lucide-react";
import { isExternal, type MemberLink } from "@/components/members/memberLinks";

export interface ProfileModalContent {
  name: string;
  photo: string | null;
  eyebrow: string;
  subtitle?: string | null;
  links: MemberLink[];
  body?: ReactNode;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Profile popup shared by the member, alumni and player cards. Closes on Escape,
// backdrop click or the X. Tab stays inside while open, and focus goes back to
// the card that opened it on close.
export function ProfileModal({ profile, onClose }: { profile: ProfileModalContent | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = profile !== null;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const inside = dialogRef.current.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      // The opener can be unmounted by then (e.g. a filter changed); skip it if so.
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {profile && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-night-950/70 p-4 backdrop-blur-sm sm:items-center"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-name"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            className="glass-panel relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden bg-night-900/80 supports-[height:100dvh]:max-h-[90dvh]"
          >
            {/* Outside the scroll area, so Close stays in reach however long the profile is. */}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close profile"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-night-950/60 text-slate-300 backdrop-blur-md transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid min-h-0 overflow-y-auto overscroll-contain sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="photo-backdrop aspect-[4/3] w-full sm:aspect-auto sm:min-h-[22rem]">
              {profile.photo ? (
                <Image src={profile.photo} alt={profile.name} fill sizes="(min-width: 640px) 320px, 100vw" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserRound className="h-14 w-14 text-white/30" strokeWidth={1.5} />
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 sm:p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-slate-400">{profile.eyebrow}</p>
              <h2
                id="profile-modal-name"
                className="mt-3 break-words pr-10 font-display text-3xl font-semibold uppercase leading-[0.95] text-white [text-wrap:balance] sm:pr-0 sm:text-4xl"
              >
                {profile.name}
              </h2>
              {profile.subtitle && (
                <p className="mt-2 font-mono text-sm uppercase tracking-wider text-blue-300">{profile.subtitle}</p>
              )}

              {profile.body}

              {profile.links.length > 0 && (
                <ul className="mt-6 space-y-2 border-t border-white/10 pt-5">
                  {profile.links.map((link) => {
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
                          <span className="min-w-0 [overflow-wrap:anywhere]">{link.value}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
