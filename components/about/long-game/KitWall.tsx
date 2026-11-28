"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useMedia } from "@/components/contact/interaction/hooks";
import type { PartnerLogo } from "@/lib/about";
import { CONTACT_EXTRAS } from "@/lib/contact-extras";
import { cn } from "@/lib/utils";

// Sponsor plates: every logo sits on an identical off-white plate, in full colour, so
// white-background JPGs blend in and dark logos stay visible on the dark board.

type Active = { key: string; el: HTMLElement; logo: PartnerLogo } | null;

// ---- Tooltip, rendered outside the scrolling board so it's never clipped.
function Tooltip({ active }: { active: Active }) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number; below: boolean } | null>(null);

  useEffect(() => {
    if (!active) {
      setPos(null);
      return;
    }
    let raf = 0;
    // Follow the plate while the row eases to a stop.
    const track = () => {
      const r = active.el.getBoundingClientRect();
      const h = box.current?.offsetHeight ?? 56;
      const below = r.top - h - 8 < 8;
      setPos({ x: r.left + r.width / 2, y: below ? r.bottom + 8 : r.top - 8, below });
      raf = requestAnimationFrame(track);
    };
    track();
    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (!active || typeof document === "undefined") return null;
  const { logo } = active;
  const extra = [logo.since && `Partner since ${logo.since}`, logo.event].filter(Boolean).join(" · ");
  return createPortal(
    <div
      ref={box}
      role="tooltip"
      id="partner-tooltip"
      className="pointer-events-none fixed z-[170] rounded-lg border border-white/10 bg-[#0f302e] px-3.5 py-2.5 text-center shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
      style={pos ? { left: pos.x, top: pos.y, transform: `translate(-50%, ${pos.below ? "0" : "-100%"})` } : { visibility: "hidden" }}
    >
      <span className="block whitespace-nowrap text-[14px] font-semibold text-[#f5f1e8]">{logo.name}</span>
      {extra && <span className="mt-0.5 block whitespace-nowrap text-[12px] text-[#f5f1e8]/60">{extra}</span>}
      <span
        aria-hidden
        className={cn("absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-white/10 bg-[#0f302e]", pos?.below ? "-top-[6px] border-l border-t" : "-bottom-[6px] border-b border-r")}
      />
    </div>,
    document.body,
  );
}

// ---- One plate. Sized logo box, balanced from the image's own proportions unless a scale is set.
function Plate({
  logo,
  copy,
  dim,
  lifted,
  onActivate,
  onDeactivate,
  onTap,
}: {
  logo: PartnerLogo;
  copy: boolean;
  dim: boolean;
  lifted: boolean;
  onActivate: (el: HTMLElement) => void;
  onDeactivate: () => void;
  onTap: (el: HTMLElement) => void;
}) {
  const [auto, setAuto] = useState(1);
  const scale = logo.scale ?? auto;
  const props = {
    "aria-label": logo.url ? `${logo.name} (opens their website)` : logo.name,
    "aria-describedby": lifted ? "partner-tooltip" : undefined,
    "aria-hidden": copy || undefined,
    tabIndex: copy ? -1 : 0,
    onPointerEnter: (e: React.PointerEvent<HTMLElement>) => e.pointerType === "mouse" && onActivate(e.currentTarget),
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => e.pointerType === "mouse" && onDeactivate(),
    onFocus: (e: React.FocusEvent<HTMLElement>) => onActivate(e.currentTarget),
    onBlur: () => onDeactivate(),
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => e.pointerType !== "mouse" && onTap(e.currentTarget),
    className: cn(
      "relative flex h-[66px] w-[132px] shrink-0 items-center justify-center rounded-lg bg-[#f5f1e8] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition-[transform,opacity,box-shadow] duration-200 md:h-[88px] md:w-[176px]",
      lifted && "-translate-y-1.5 scale-[1.04] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,0,0,0.35)]",
      dim && "opacity-70",
    ),
  };
  const inner = (
    <span className="partner-logo relative block" style={{ "--s": scale } as CSSProperties}>
      <Image
        src={logo.src}
        alt={logo.name}
        fill
        sizes="(min-width: 768px) 172px, 130px"
        draggable={false}
        onLoad={(e) => {
          // Optical balance: aim every logo at the same visible area (wide wordmarks
          // grow, square marks shrink), within 0.8–1.3.
          const img = e.currentTarget;
          if (!img.naturalWidth || logo.scale) return;
          const a = img.naturalWidth / img.naturalHeight;
          const boxA = 132 / 52;
          const area = a > boxA ? (132 * 132) / a : 52 * 52 * a;
          setAuto(Math.min(1.3, Math.max(0.8, Math.sqrt((132 * 52 * 0.55) / area))));
        }}
        className="select-none object-contain mix-blend-multiply"
      />
    </span>
  );
  return logo.url ? (
    <a href={logo.url} target="_blank" rel="noopener noreferrer" {...props}>
      {inner}
    </a>
  ) : (
    <button type="button" {...props}>
      {inner}
    </button>
  );
}

// ---- One LED board: a seamless loop driven frame by frame, so hovering can ease the row to
// a stop (about 400ms) and page scrolling can give it a push.
function Board({ logos, direction, label, onActive }: { logos: PartnerLogo[]; direction: 1 | -1; label: string; onActive: (a: Active) => void }) {
  const reduce = useReducedMotion();
  const phone = useMedia("(max-width: 767px)");
  const track = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Active>(null);
  const hold = useRef(false);
  const speed = phone ? 28 : 40;

  const activate = useCallback(
    (key: string, logo: PartnerLogo) => (el: HTMLElement) => {
      const next = { key, el, logo };
      hold.current = true;
      setActive(next);
      onActive(next);
    },
    [onActive],
  );
  const deactivate = useCallback(() => {
    hold.current = false;
    setActive(null);
    onActive(null);
  }, [onActive]);

  // Tapping elsewhere on a touch screen lets the row run again.
  useEffect(() => {
    if (!active) return;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && !board.current?.contains(e.target as Node)) deactivate();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [active, deactivate]);

  useLayoutEffect(() => {
    if (reduce) return;
    const el = track.current;
    if (!el) return;
    // Row 1 runs left, row 2 runs right; scrolling the page pushes both along their way
    // (down) or back (up) for a moment.
    const sign = direction === 1 ? -1 : 1;
    let offset = 0;
    let factor = 1;
    let boost = 0;
    let lastScroll = window.scrollY;
    let last = performance.now();
    let visible = true;
    let raf = 0;

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(el);
    const onScroll = () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      boost = Math.max(-600, Math.min(600, boost + dy * 6)); // px/s, in the scroll direction
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = hold.current ? 0 : 1;
      factor += (target - factor) * (1 - Math.exp(-dt / 0.13)); // ~400ms to settle
      boost *= Math.exp(-dt / 0.35);
      if (visible) {
        const half = el.scrollWidth / 2;
        offset += sign * (speed * factor + (hold.current ? 0 : boost)) * dt;
        if (offset <= -half) offset += half;
        if (offset > 0) offset -= half;
        el.style.transform = `translate3d(${offset}px, 0, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduce, direction, speed]);

  const copies = reduce ? [false] : [false, true];

  return (
    <div>
      <p className="mb-2.5 text-[13px] font-medium uppercase tracking-[0.16em] text-[#f5f1e8]/50">{label}</p>
      {/* The normal pointer here, so the custom cursor ring never covers a logo. */}
      <div ref={board} data-cursor="native" className="led-board relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#071a19] py-5">
        <div className={cn(reduce ? "px-5" : "[mask-image:linear-gradient(90deg,transparent,#000_80px,#000_calc(100%-80px),transparent)]")}>
          <div
            ref={track}
            className={cn("flex gap-5", reduce ? "grid grid-cols-3 justify-items-center md:grid-cols-6" : "w-max will-change-transform")}
          >
            {copies.map((copy) =>
              logos.map((logo) => {
                const key = `${copy ? "b" : "a"}-${logo.id}`;
                return (
                  <Plate
                    key={key}
                    logo={logo}
                    copy={copy}
                    lifted={active?.key === key}
                    dim={Boolean(active) && active?.key !== key}
                    onActivate={activate(key, logo)}
                    onDeactivate={deactivate}
                    onTap={(el) => (active?.key === key ? deactivate() : activate(key, logo)(el))}
                  />
                );
              }),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// "Backed by the best": everyone who has backed the club, on two LED boards.
export function KitWall({ corporate, media, eventCount }: { corporate: PartnerLogo[]; media: PartnerLogo[]; eventCount: number }) {
  const deck = CONTACT_EXTRAS.sponsorDeckUrl;
  const [active, setActive] = useState<Active>(null);
  return (
    <section id="partners" aria-labelledby="kit-heading" className="mx-auto max-w-[1280px] scroll-mt-24 px-6 pt-28 lg:px-8">
      <h2 id="kit-heading" className="text-[44px] !font-extrabold uppercase leading-none text-[#f5f1e8] md:text-[64px]">
        Backed by the best
      </h2>
      <p className="mt-3 text-[17px] text-[#f5f1e8]/60">
        {corporate.length + media.length} partners · {eventCount} events on record
      </p>

      {/* Plain list for screen readers; the boards below are a visual loop. */}
      <ul className="sr-only" aria-label="All partners">
        {[...corporate, ...media].map((logo) => (
          <li key={logo.id}>{logo.name}</li>
        ))}
      </ul>

      <div className="mt-8 space-y-6">
        <Board logos={corporate} direction={1} label="Partners" onActive={setActive} />
        <Board logos={media} direction={-1} label="In the media" onActive={setActive} />
      </div>
      <Tooltip active={active} />

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href="/contact?topic=partnership"
          className="group inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#3fcfca] px-6 text-[15px] font-semibold text-[#3fcfca] transition hover:-translate-y-0.5 hover:bg-[#3fcfca]/10"
        >
          Become a partner
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        {deck && (
          <a href={deck} download className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-[#3fcfca] underline-offset-4 hover:underline">
            Sponsorship deck
            <ArrowDown aria-hidden className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </a>
        )}
      </div>
    </section>
  );
}
