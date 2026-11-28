"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, type MotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Share2 } from "lucide-react";
import { useCopy } from "@/components/contact/interaction/hooks";
import { AchievementLink } from "@/components/achievements/report/shared";
import { BLUR } from "@/components/achievements/trophy/shared";
import type { ReportLink } from "@/lib/report";
import { cn } from "@/lib/utils";

const round = "relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-[#f5f1e8] transition hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10";

// Previous / next arrow with a preview card of where it goes.
function StepArrow({ to, dir }: { to: ReportLink | null; dir: "prev" | "next" }) {
  const [peek, setPeek] = useState(false);
  const Icon = dir === "prev" ? ArrowLeft : ArrowRight;
  const label = dir === "prev" ? "Previous achievement" : "Next achievement";
  if (!to)
    return (
      <span aria-disabled="true" title={`No ${dir === "prev" ? "previous" : "next"} achievement`} className={cn(round, "pointer-events-none opacity-40")}>
        <Icon aria-hidden className="h-4 w-4" />
      </span>
    );
  return (
    <span className="relative" onPointerEnter={(e) => e.pointerType === "mouse" && setPeek(true)} onPointerLeave={() => setPeek(false)}>
      <AchievementLink to={to} aria-label={`${label}: ${to.title}`} aria-keyshortcuts={dir === "prev" ? "ArrowLeft" : "ArrowRight"} onFocus={() => setPeek(true)} onBlur={() => setPeek(false)} className={round}>
        <Icon aria-hidden className="h-4 w-4" />
      </AchievementLink>
      <AnimatePresence>
        {peek && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute right-0 top-[calc(100%+10px)] z-10 hidden w-[260px] items-center gap-3 rounded-lg border border-white/10 bg-[#0f302e] p-2.5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] md:flex"
          >
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#0b2524]">
              {to.photo && <Image src={to.photo} alt="" fill sizes="56px" placeholder="blur" blurDataURL={BLUR} className="object-cover" />}
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3fcfca]">
                {dir === "prev" ? "← Previous" : "Next →"}
                {to.year ? ` · ${to.year}` : ""}
              </span>
              <span className="mt-0.5 line-clamp-2 block text-[13px] font-medium leading-snug text-[#f5f1e8]">{to.title}</span>
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

// Sticky under the site header: back to the room, the trail (once the headline scrolls
// away), share, previous / next, and a 2px reading-progress line along the bottom.
export function TopBar({
  backHref,
  onBack,
  crumbs,
  showCrumbs,
  progress,
  share,
  prev,
  next,
}: {
  backHref: string;
  onBack?: () => void;
  crumbs: { label: string; href: string }[];
  showCrumbs: boolean;
  progress: MotionValue<number>;
  share: { url: string; title: string; text: string };
  prev: ReportLink | null;
  next: ReportLink | null;
}) {
  const { copied, failed, copy } = useCopy();

  const onShare = async () => {
    // Phones and tablets: the native share sheet. Desktop: copy the link.
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && typeof navigator.share === "function") {
      try {
        await navigator.share({ url: share.url, title: share.title, text: share.text });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    void copy(share.url);
  };

  return (
    <div
      data-report-bar
      // The band above the bar covers the strip behind the floating site header.
      className="sticky top-[var(--bar-top)] z-30 border-b border-white/10 bg-[#0b2524] before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-[var(--bar-top)] before:bg-[#0b2524] before:content-['']"
    >
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <Link
          href={backHref}
          onClick={(e) => {
            if (!onBack || e.metaKey || e.ctrlKey || e.shiftKey) return;
            e.preventDefault();
            onBack();
          }}
          className="group inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-full pr-2 text-[14px] font-semibold text-[#f5f1e8]/85 transition hover:text-[#f5f1e8]"
        >
          <ArrowLeft aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="max-md:sr-only">Trophy room</span>
        </Link>

        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <motion.ol
            initial={false}
            animate={{ opacity: showCrumbs ? 1 : 0, y: showCrumbs ? 0 : 6 }}
            transition={{ duration: 0.2 }}
            aria-hidden={!showCrumbs}
            className={cn("hidden items-center justify-center gap-2 truncate text-[13px] text-[#f5f1e8]/55 md:flex", !showCrumbs && "pointer-events-none")}
          >
            {crumbs.map((c, i) => (
              <li key={c.href + c.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>/</span>}
                <Link href={c.href} tabIndex={showCrumbs ? undefined : -1} className="transition hover:text-[#f5f1e8] hover:underline hover:underline-offset-4">
                  {c.label}
                </Link>
              </li>
            ))}
          </motion.ol>
        </nav>

        <button
          type="button"
          onClick={onShare}
          className="relative inline-flex h-10 shrink-0 items-center gap-2 overflow-hidden rounded-full border border-white/15 px-3 text-[14px] font-semibold text-[#f5f1e8] transition hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 md:px-4"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {copied ? (
              <motion.span key="done" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} className="inline-flex items-center gap-2 text-[#3fcfca]">
                <Check aria-hidden className="h-4 w-4" />
                <span className="max-md:sr-only">Link copied</span>
              </motion.span>
            ) : (
              <motion.span key="share" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} className="inline-flex items-center gap-2">
                <Share2 aria-hidden className="h-4 w-4" />
                <span className="max-md:sr-only">{failed ? "Copy failed" : "Share"}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <span role="status" className="sr-only">
          {copied ? "Link copied" : ""}
        </span>

        <div className="flex shrink-0 items-center gap-1.5">
          <StepArrow to={prev} dir="prev" />
          <StepArrow to={next} dir="next" />
        </div>
      </div>
      <motion.span aria-hidden className="absolute inset-x-0 bottom-[-1px] h-[2px] origin-left bg-[#3fcfca]" style={{ scaleX: progress }} />
    </div>
  );
}
