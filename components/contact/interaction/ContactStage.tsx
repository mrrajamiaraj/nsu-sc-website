"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { CustomCursor, ScrollProgress } from "@/components/contact/interaction/Pointer";
import { PITCH_EVENT, haptic, useRichPointer } from "@/components/contact/interaction/hooks";
import { loadSoundPreference, onSoundChange, playClick, setSoundEnabled } from "@/components/contact/interaction/sound";

// ---- Pitch lines

const LINE = "stroke='white' stroke-opacity='0.05' stroke-width='2' fill='none'";
const tile = (body: string) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='900'><g ${LINE}>${body}</g></svg>`).replace(/'/g, "%27")}")`;

// One 1200x900 tile per sport, repeated down the page.
const SURFACES: { key: string; match: RegExp; image: string }[] = [
  {
    key: "football",
    match: /football|futsal|soccer/i,
    image: tile(
      "<line x1='0' y1='450' x2='1200' y2='450'/><circle cx='600' cy='450' r='110'/><circle cx='600' cy='450' r='3'/>" +
        "<rect x='380' y='-1' width='440' height='150'/><rect x='490' y='-1' width='220' height='55'/><path d='M520 149 A90 90 0 0 0 680 149'/>" +
        "<rect x='380' y='751' width='440' height='150'/><rect x='490' y='846' width='220' height='55'/><path d='M520 751 A90 90 0 0 1 680 751'/>",
    ),
  },
  {
    key: "basketball",
    match: /basket/i,
    image: tile(
      "<line x1='0' y1='450' x2='1200' y2='450'/><circle cx='600' cy='450' r='90'/>" +
        "<rect x='520' y='-1' width='160' height='190'/><circle cx='600' cy='189' r='60'/><path d='M330 -1 V60 A270 270 0 0 0 870 60 V-1'/>" +
        "<rect x='520' y='711' width='160' height='190'/><circle cx='600' cy='711' r='60'/><path d='M330 901 V840 A270 270 0 0 1 870 840 V901'/>",
    ),
  },
  {
    key: "cricket",
    match: /cricket/i,
    image: tile(
      "<ellipse cx='600' cy='450' rx='330' ry='380'/><rect x='565' y='250' width='70' height='400'/>" +
        "<line x1='530' y1='290' x2='670' y2='290'/><line x1='530' y1='610' x2='670' y2='610'/>",
    ),
  },
  {
    key: "volleyball",
    match: /volley/i,
    image: tile(
      "<rect x='300' y='150' width='600' height='600'/><line x1='270' y1='450' x2='930' y2='450' stroke-width='4'/>" +
        "<line x1='300' y1='350' x2='900' y2='350'/><line x1='300' y1='550' x2='900' y2='550'/>",
    ),
  },
  {
    key: "badminton",
    match: /badminton/i,
    image: tile(
      "<rect x='400' y='120' width='400' height='660'/><line x1='430' y1='120' x2='430' y2='780'/><line x1='770' y1='120' x2='770' y2='780'/>" +
        "<line x1='380' y1='450' x2='820' y2='450' stroke-width='4'/><line x1='400' y1='380' x2='800' y2='380'/><line x1='400' y1='520' x2='800' y2='520'/>" +
        "<line x1='600' y1='120' x2='600' y2='380'/><line x1='600' y1='520' x2='600' y2='780'/>",
    ),
  },
  {
    key: "table-tennis",
    match: /table\s*tennis|ping/i,
    image: tile(
      "<rect x='430' y='250' width='340' height='400' rx='4'/><line x1='400' y1='450' x2='800' y2='450' stroke-width='5'/><line x1='600' y1='250' x2='600' y2='650'/>",
    ),
  },
];

function PitchBackground() {
  const rich = useRichPointer();
  const reduce = useReducedMotion();
  const [surface, setSurface] = useState("football");
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const { scrollY } = useScroll();
  // The lines drift at a fifth of scroll speed; the tile repeats every 900px, so wrap seamlessly.
  const drift = useTransform(scrollY, (v) => (reduce ? 0 : -((v * 0.2) % 900)));
  const y = useTransform([drift, smy], ([d, m]: number[]) => d + m);

  useEffect(() => {
    const onPitch = (e: Event) => {
      const sport = (e as CustomEvent<string | null>).detail;
      setSurface(SURFACES.find((s) => sport && s.match.test(sport))?.key ?? "football");
    };
    window.addEventListener(PITCH_EVENT, onPitch);
    return () => window.removeEventListener(PITCH_EVENT, onPitch);
  }, []);

  // Opposite-direction mouse parallax, up to 12px.
  useEffect(() => {
    if (!rich) return;
    const onMove = (e: PointerEvent) => {
      mx.set(-((e.clientX / window.innerWidth) - 0.5) * 24);
      my.set(-((e.clientY / window.innerHeight) - 0.5) * 24);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rich, mx, my]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div className="absolute -inset-x-6 -top-6 h-[calc(100vh+960px)]" style={{ x: smx, y }}>
          {SURFACES.map((s) => (
            <div
              key={s.key}
              className="absolute inset-0 transition-[opacity,transform] duration-[600ms] ease-out motion-reduce:transition-none"
              style={{
                backgroundImage: s.image,
                backgroundSize: "1200px 900px",
                backgroundPosition: "center top",
                backgroundRepeat: "repeat-y",
                opacity: s.key === surface ? 1 : 0,
                transform: s.key === surface ? "scale(1)" : "scale(0.97)",
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ---- Background clicks: ripple, and three quick clicks drop a football.

const NOT_EMPTY = "a, button, input, textarea, select, label, img, svg, p, h1, h2, h3, h4, li, dt, dd, span, figure, iframe, [role], [data-cursor]";

type Ripple = { id: number; x: number; y: number };
type Ball = { id: number; x: number; y: number };

function Football() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <circle cx="12" cy="12" r="10.5" fill="#f5f1e8" stroke="#0b2524" strokeWidth="1.2" />
      <path d="m12 7.5 4.3 3.1-1.6 5h-5.4l-1.6-5z" fill="#0b2524" />
      <path d="M12 7.5V2M16.3 10.6l5-1.6M14.7 15.6l3 4M9.3 15.6l-3 4M7.7 10.6l-5-1.6" stroke="#0b2524" strokeWidth="1.2" />
    </svg>
  );
}

function SoundToggle() {
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setOn(loadSoundPreference());
    return onSoundChange(setOn);
  }, []);
  if (!mounted) return null;
  return createPortal(
    <button
      type="button"
      onClick={() => setSoundEnabled(!on)}
      aria-pressed={on}
      aria-label="Interface sounds"
      title={on ? "Sounds on" : "Sounds off"}
      className="fixed bottom-4 left-4 z-[120] flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#082120]/85 text-[#f5f1e8]/80 backdrop-blur-sm transition hover:-translate-y-0.5 hover:text-[#f5f1e8] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fcfca] focus-visible:ring-offset-[3px] focus-visible:ring-offset-[#0b2524]"
    >
      {on ? <Volume2 aria-hidden className="h-[18px] w-[18px]" /> : <VolumeX aria-hidden className="h-[18px] w-[18px]" />}
    </button>,
    document.body,
  );
}

// Wraps the whole contact page: background, cursor, progress line, sounds and easter egg.
export function ContactStage({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [mounted, setMounted] = useState(false);
  const clicks = useRef<number[]>([]);
  const nextId = useRef(0);
  useEffect(() => setMounted(true), []);

  const onClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const target = e.target as Element;
    if (target.closest(NOT_EMPTY) || window.getSelection()?.toString()) return;
    const id = nextId.current++;
    if (!reduce) setRipples((list) => [...list, { id, x: e.clientX, y: e.clientY }]);
    const now = performance.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 700), now];
    if (clicks.current.length >= 3 && !reduce) {
      clicks.current = [];
      setBalls((list) => [...list, { id, x: e.clientX, y: e.clientY }]);
    }
  };

  // A soft click for every button and link (when sounds are on), and a haptic tick on main buttons.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const target = e.target as Element;
    if (target.closest("a, button, [role='button'], [role='tab'], [role='option']")) playClick();
    if (target.closest("[data-haptic]")) haptic();
  };

  return (
    <div onClick={onClick} onPointerDown={onPointerDown} className="contact-page relative isolate">
      <PitchBackground />
      <div className="relative z-10">{children}</div>
      <CustomCursor />
      <ScrollProgress />
      <SoundToggle />
      {mounted &&
        createPortal(
          <div aria-hidden className="pointer-events-none fixed inset-0 z-[140] overflow-hidden">
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  className="absolute h-32 w-32 rounded-full border-2 border-[#3fcfca]/20"
                  style={{ left: r.x - 64, top: r.y - 64 }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 1, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  onAnimationComplete={() => setRipples((list) => list.filter((item) => item.id !== r.id))}
                />
              ))}
              {balls.map((b) => {
                const floor = window.innerHeight - b.y - 36;
                return (
                  <motion.span
                    key={`ball-${b.id}`}
                    className="absolute"
                    style={{ left: b.x - 14, top: b.y - 14 }}
                    initial={{ x: 0, y: -40, rotate: 0 }}
                    animate={{
                      y: [-40, floor, floor - 90, floor, floor - 30, floor, floor],
                      x: [0, 40, 90, 140, 175, 210, window.innerWidth],
                      rotate: [0, 120, 260, 380, 460, 540, 1440],
                    }}
                    transition={{ duration: 2.2, times: [0, 0.22, 0.38, 0.52, 0.62, 0.7, 1], ease: "easeIn" }}
                    onAnimationComplete={() => setBalls((list) => list.filter((item) => item.id !== b.id))}
                  >
                    <Football />
                  </motion.span>
                );
              })}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </div>
  );
}

