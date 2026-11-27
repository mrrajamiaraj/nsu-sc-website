"use client";

import Image from "next/image";
import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ph, SectionHeading } from "@/components/contact/extras/shared";
import { useRichPointer } from "@/components/contact/interaction/hooks";
import { CONTACT_EXTRAS, type SocialAccount } from "@/lib/contact-extras";
import { cn } from "@/lib/utils";

// Small floating preview of the latest Instagram posts, next to the cursor.
function InstagramPreview({ x, y }: { x: number; y: number }) {
  const images = CONTACT_EXTRAS.instagramPreview;
  return (
    <motion.span
      aria-hidden
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="pointer-events-none fixed z-[130] flex gap-1.5 rounded-lg border border-white/15 bg-[#082120] p-1.5 shadow-[0_16px_30px_-12px_rgba(0,0,0,0.8)]"
      style={{ left: x + 18, top: y + 18 }}
    >
      {[0, 1, 2].map((i) => (
        <span key={i} className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-[#0f302e] text-[9px]">
          {images?.[i] ? <Image src={images[i]} alt="" fill sizes="64px" className="object-cover" /> : <Ph>post</Ph>}
        </span>
      ))}
    </motion.span>
  );
}

function SocialLink({ account }: { account: SocialAccount }) {
  const rich = useRichPointer();
  const [hover, setHover] = useState(false);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const showPreview = rich && hover && account.label === "Instagram" && point;

  if (!account.url) {
    return (
      <span className="inline-flex flex-col">
        <span className="font-display text-[28px] font-extrabold uppercase leading-none text-[#f5f1e8]/45 md:text-[36px]">{account.label}</span>
        <span className="mt-1.5 text-[13px]">
          <Ph>{account.hint}</Ph>
        </span>
      </span>
    );
  }

  return (
    <a
      href={account.url}
      target="_blank"
      rel="noopener noreferrer"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerMove={(e: ReactPointerEvent) => setPoint({ x: e.clientX, y: e.clientY })}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="inline-flex flex-col"
    >
      <span className={cn("inline-flex items-baseline font-display text-[28px] font-extrabold uppercase leading-none transition-colors duration-150 md:text-[36px]", hover ? "text-[#3fcfca]" : "text-[#f5f1e8]")}>
        {/* Letters lift one after another. */}
        {Array.from(account.label).map((char, i) => (
          <motion.span key={i} className="inline-block" animate={{ y: hover ? [0, -5, 0] : 0 }} transition={{ duration: 0.3, delay: hover ? i * 0.03 : 0 }}>
            {char}
          </motion.span>
        ))}
        <motion.span aria-hidden className="ml-1 inline-block" animate={{ x: hover ? 0 : -8, opacity: hover ? 1 : 0.35 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
          ↗
        </motion.span>
      </span>
      <span className="mt-1.5 h-5 overflow-hidden text-[13px] text-[#f5f1e8]/60">
        {/* Follower count slides up into view. On touch screens it's always shown. */}
        <span className={cn("block transition duration-300 motion-reduce:transition-none", hover || !rich ? "translate-y-0 opacity-100" : "translate-y-full opacity-0")}>
          {account.followers ?? <Ph>follower count</Ph>}
        </span>
      </span>
      <AnimatePresence>{showPreview && <InstagramPreview x={point.x} y={point.y} />}</AnimatePresence>
    </a>
  );
}

// Large text links to the club's own accounts. Until an account URL is confirmed in
// lib/contact-extras.ts it shows as a placeholder instead of a link to a platform homepage.
export function FollowClub({ className }: { className?: string }) {
  return (
    <section aria-labelledby="follow-heading" className={cn("border-t border-white/10 pt-14", className)}>
      <SectionHeading id="follow-heading" title="Follow the club" />
      <ul className="mt-6 flex flex-col gap-5 md:flex-row md:flex-wrap md:gap-x-12 md:gap-y-6">
        {CONTACT_EXTRAS.socials.map((account) => (
          <li key={account.label}>
            <SocialLink account={account} />
          </li>
        ))}
      </ul>
    </section>
  );
}
