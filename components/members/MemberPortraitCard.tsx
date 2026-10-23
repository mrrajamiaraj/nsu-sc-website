"use client";

import Image from "next/image";
import { useRef } from "react";
import type { MouseEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { ArrowUpRight, UserRound } from "lucide-react";
import { meaningfulDesignation } from "@/components/members/MemberCard";
import { isExternal, memberLinks } from "@/components/members/memberLinks";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

// Portrait card for the members page: photo fills the card, name sits on a dark
// fade at the bottom, a soft glare follows the cursor, and
// contact icons rise in on hover. The whole card opens the member's profile.
export function MemberPortraitCard({
  member,
  compact = false,
  onOpen,
}: {
  member: Member;
  compact?: boolean;
  onOpen: (member: Member) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const designation = meaningfulDesignation(member);
  const links = memberLinks(member);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${glareX} ${glareY}, rgba(63, 207, 202, 0.22), transparent 45%)`;

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  }

  function handleLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <div className="h-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="group relative h-full overflow-hidden rounded-3xl border border-white/15 bg-slate-800/30 shadow-panel transition-[border-color,box-shadow] duration-300 hover:border-blue-400/50 hover:shadow-glow"
      >
        <div className={cn("photo-backdrop w-full", compact ? "aspect-[4/5]" : "aspect-[3/4]")}>
          {member.photo ? (
            <Image
              src={member.photo}
              alt={member.name}
              fill
              sizes={compact ? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <UserRound className="h-12 w-12 text-white/30" strokeWidth={1.5} />
            </div>
          )}

          {/* Bottom fade keeps the name readable over any photo. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/40 to-transparent" />
          <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glare }} />
        </div>

        {/* Full-card hit area; sits under the contact links so those stay clickable. */}
        <button
          type="button"
          onClick={() => onOpen(member)}
          aria-label={`View ${member.name}'s profile`}
          className="absolute inset-0 z-10 rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        />

        <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-20", compact ? "p-4" : "p-5")}>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3
                className={cn(
                  "font-display font-semibold uppercase leading-none tracking-wide text-white",
                  compact ? "text-xl" : "text-2xl",
                )}
              >
                {member.name}
              </h3>
              {designation && (
                <p className={cn("mt-1.5 font-mono uppercase tracking-wider text-blue-300", compact ? "text-[10px]" : "text-xs")}>
                  {designation}
                </p>
              )}
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>

          {links.length > 0 && (
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
              <div className="overflow-hidden">
                <div className="pointer-events-auto mt-3 flex gap-2 border-t border-white/10 pt-3">
                  {links.map((link) => {
                    const external = isExternal(link.href);
                    return (
                      <a
                        key={link.key}
                        href={link.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        aria-label={`${member.name} on ${link.label}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-200 backdrop-blur-md transition-colors hover:border-blue-400/60 hover:bg-blue-400/20 hover:text-white"
                      >
                        <link.icon className="h-3.5 w-3.5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
