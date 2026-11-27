"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Ph } from "@/components/contact/extras/shared";
import { useRichPointer } from "@/components/contact/interaction/hooks";

interface Statement {
  line: string;
  body: ReactNode;
}

const STATEMENTS: Statement[] = [
  { line: "Everyone gets a game.", body: "Beginners welcome; trials are open to all NSU students." },
  { line: "We play fair, we play hard.", body: <Ph>one real example of sportsmanship</Ph> },
  { line: "We wear NSU's name.", body: "We represent the university in inter-university and national tournaments." },
];

// The statement's letters fill with teal, left to right, as it crosses the middle of the screen.
function FillLine({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.45"] });
  const clip = useTransform(scrollYProgress, (p) => `inset(0 ${100 - Math.min(1, Math.max(0, p)) * 100}% 0 0)`);
  return (
    <h3 ref={ref} className="relative text-[40px] !font-extrabold uppercase leading-[0.95] text-[#f5f1e8]/30 md:text-[64px]">
      {text}
      <motion.span aria-hidden className="absolute inset-0 text-[#3fcfca]" style={reduce ? undefined : { clipPath: clip }}>
        {text}
      </motion.span>
    </h3>
  );
}

// Desktop: the hovered statement's photo floats near the cursor (eased, slightly tilted).
function FloatingPhoto({ src, visible }: { src: string | null; visible: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!visible) return;
    const target = { x: 0, y: 0 };
    const pos = { x: -1, y: 0 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (pos.x < 0) Object.assign(pos, target);
    };
    const loop = () => {
      pos.x += (target.x - pos.x) * 0.15;
      pos.y += (target.y - pos.y) * 0.15;
      const x = Math.min(pos.x + 32, window.innerWidth - 336);
      const y = Math.min(Math.max(pos.y - 110, 16), window.innerHeight - 236);
      if (frame.current) frame.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [visible]);
  if (!mounted) return null;
  return createPortal(
    <div ref={frame} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90]" style={{ width: 320, height: 220 }}>
      <div
        className="relative h-full w-full overflow-hidden rounded-[10px] transition-[opacity,transform] duration-200 ease-out"
        style={{ opacity: visible && src ? 1 : 0, transform: `rotate(-3deg) scale(${visible ? 1 : 0.92})` }}
      >
        {src && <Image src={src} alt="" fill sizes="320px" className="object-cover" />}
      </div>
    </div>,
    document.body,
  );
}

// "What we stand for": three statements, no cards.
export function StandFor({ photos }: { photos: (string | null)[] }) {
  const rich = useRichPointer();
  const [hover, setHover] = useState<number | null>(null);
  return (
    <section aria-labelledby="stand-heading" className="mx-auto max-w-[1280px] px-6 pt-28 lg:px-8">
      <h2 id="stand-heading" className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#3fcfca]/80">
        What we stand for
      </h2>
      <ul className="mt-8 border-t border-white/10" onPointerLeave={() => setHover(null)}>
        {STATEMENTS.map((statement, i) => (
          <li
            key={statement.line}
            tabIndex={0}
            onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            data-cursor={photos[i] ? "view" : undefined}
            className="grid gap-4 border-b border-white/10 py-10 outline-none md:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)] md:items-end md:gap-12"
          >
            <FillLine text={statement.line} />
            <div>
              <p className="text-[17px] leading-relaxed text-[#f5f1e8]/75">{statement.body}</p>
              {/* Phones (and no fine pointer): the photo sits inline. */}
              {!rich && photos[i] && (
                <span className="relative mt-4 block aspect-[16/10] overflow-hidden rounded-md">
                  <Image src={photos[i]!} alt="" fill sizes="90vw" className="object-cover" />
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {rich && <FloatingPhoto src={hover !== null ? photos[hover] : null} visible={hover !== null} />}
    </section>
  );
}
