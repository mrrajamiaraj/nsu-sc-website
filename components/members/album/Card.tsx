"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { Cutout, initials } from "@/components/teams/announcement/Cutout";
import { SportIcon } from "@/components/home/SportIcon";
import { useRichPointer } from "@/components/contact/interaction/hooks";
import type { PanelPerson } from "@/lib/members-sheet";
import { cn } from "@/lib/utils";

export const DISPLAY = "font-display";

// Every card is "stuck" on at a tiny angle of its own (−1.5° to 1.5°), the same on every visit.
export function stickerAngle(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 300) / 100 - 1.5).toFixed(2);
}

const tabLabel = (p: PanelPerson) =>
  p.tier === "advisor" ? "Faculty Advisor" : p.role;

// The armband the president's card wears.
function Armband() {
  return (
    <span
      aria-hidden
      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#3fcfca] bg-[#0b2524] text-[12px] font-extrabold leading-none text-[#3fcfca]"
    >
      C
    </span>
  );
}

// An empty sticker space: dashed slot, "paste here" corner marks, initials.
export function EmptySlot({
  name,
  label = "Photo coming soon",
  className,
}: {
  name?: string;
  label?: string;
  className?: string;
}) {
  const corner = "absolute h-3 w-3 border-[#f5f1e8]/40";
  return (
    <span
      className={cn(
        "absolute inset-[10px] flex flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#f5f1e8]/25 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(corner, "left-2 top-2 border-l-2 border-t-2")}
      />
      <span
        aria-hidden
        className={cn(corner, "right-2 top-2 border-r-2 border-t-2")}
      />
      <span
        aria-hidden
        className={cn(corner, "bottom-2 left-2 border-b-2 border-l-2")}
      />
      <span
        aria-hidden
        className={cn(corner, "bottom-2 right-2 border-b-2 border-r-2")}
      />
      {name && (
        <span
          className={cn(
            DISPLAY,
            "text-[44px] font-extrabold leading-none text-[#f5f1e8]/45",
          )}
        >
          {initials(name)}
        </span>
      )}
      <span className="mt-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f5f1e8]/50">
        {label}
      </span>
    </span>
  );
}

/**
 * The front of a card. `lifted` pops the portrait out over the top border (hover), and
 * `sizes` says how wide the card is drawn, so the cut-out loads at the right size.
 */
export function CardFront({
  person,
  lifted = false,
  sizes,
  priority = false,
  big = false,
  mini = false,
}: {
  person: PanelPerson;
  lifted?: boolean;
  sizes: string;
  priority?: boolean;
  /** The opened card: larger type. */
  big?: boolean;
  /** The small cards fanned on the cover: name only. */
  mini?: boolean;
}) {
  const tab = tabLabel(person);
  return (
    <span className="absolute inset-0 block rounded-[14px] [transform-style:preserve-3d]">
      {/* Background: the page's finish, and the foil on Leadership. */}
      <span
        className={cn(
          "absolute inset-0 overflow-hidden rounded-[14px] shadow-[0_14px_28px_-14px_rgba(0,0,0,0.8)]",
          `album-finish-${person.page}`,
        )}
      >
        {person.page === "leadership" && (
          <span aria-hidden className="album-holo absolute inset-0" />
        )}
      </span>

      {/* Portrait on its own layer: it comes forward and over the top border when lifted. */}
      {person.photo ? (
        <span
          className="absolute inset-0 block transition-[clip-path,transform] duration-300 ease-out"
          style={{
            clipPath: lifted
              ? "inset(-14% 0 0 0 round 14px)"
              : "inset(0 round 14px)",
            transform: lifted ? "translateZ(30px)" : "translateZ(0)",
            filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.45))",
          }}
        >
          <Cutout
            person={person}
            boxRatio={0.75}
            fill={1.08}
            align="top"
            sizes={sizes}
            priority={priority}
          />
        </span>
      ) : (
        <EmptySlot name={person.name} className="bottom-[78px]" />
      )}

      {/* 6px off-white inner border. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[6px] rounded-[10px] border border-[#f5f1e8]/60"
      />

      {/* Crest stamp and sport. */}
      <span
        aria-hidden
        className={cn(
          "album-crest absolute right-3 top-3 text-[#f5f1e8]/80",
          big ? "h-10 w-10" : mini ? "!right-2 !top-2 h-4 w-4" : "h-7 w-7",
        )}
      />
      {person.squads[0] && !mini && (
        <span
          className={cn(
            "absolute left-3 top-3 flex items-center justify-center rounded-full bg-[#0b2524]/80 text-[#3fcfca]",
            big ? "h-10 w-10" : "h-7 w-7",
          )}
          title={person.squads[0].sport}
        >
          <SportIcon
            sport={person.squads[0].sport}
            className={big ? "h-5 w-5" : "h-4 w-4"}
            aria-hidden
          />
          <span className="sr-only">
            Plays {person.squads.map((s) => s.sport).join(" and ")}
          </span>
        </span>
      )}

      {/* Name plate, with the role on an emerald tab above it. */}
      <span
        className={cn(
          "absolute inset-x-[6px] bottom-[6px] block rounded-b-[10px] bg-[#f5f1e8]",
          big ? "px-5 pb-4 pt-4" : mini ? "px-2 pb-1.5 pt-1.5" : "px-3 pb-2.5 pt-2.5",
        )}
        style={{ transform: "translateZ(12px)" }}
      >
        {(tab || person.captain) && !mini && (
          <span className="absolute bottom-[calc(100%-9px)] left-2.5 right-2.5 flex items-end gap-1.5">
            {tab && (
              <span
                className={cn(
                  "rounded-[4px] bg-[#3fcfca] px-1.5 py-[3px] font-bold uppercase tracking-[0.1em] text-[#002e2c]",
                  big ? "text-[12px]" : "text-[10px]",
                  "leading-[1.15]",
                )}
              >
                {tab}
              </span>
            )}
            {person.captain && <Armband />}
          </span>
        )}
        <span
          className={cn(
            DISPLAY,
            "line-clamp-2 font-extrabold uppercase text-[#0b1a18]",
            big ? "text-[30px] md:text-[34px]" : mini ? "text-[12px] lg:text-[17px]" : "text-[17px] sm:text-[20px] md:text-[22px]",
            // Last, so the font sizes above don't reset it.
            "leading-[0.95] sm:leading-[0.95] md:leading-[0.95] lg:leading-[0.95]",
          )}
        >
          {person.name}
        </span>
      </span>

      {/* Light glare that follows the pointer. */}
      <span
        aria-hidden
        className="album-glare pointer-events-none absolute inset-0 rounded-[14px] opacity-0 transition-opacity duration-200 group-hover/card:opacity-100"
      />
    </span>
  );
}

/**
 * A card stuck on an album page. Hover tilts it toward the pointer (10° max) and pops the
 * portrait forward; a press dips it; a click opens it. While open, its slot stays empty.
 */
export function AlbumCard({
  person,
  index,
  open,
  state,
  onOpen,
}: {
  person: PanelPerson;
  index: number;
  open: boolean;
  state: "plain" | "match" | "dim";
  onOpen: (person: PanelPerson, el: HTMLElement) => void;
}) {
  const reduce = Boolean(useReducedMotion());
  const rich = useRichPointer();
  const ref = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 18 });
  const sry = useSpring(ry, { stiffness: 220, damping: 18 });
  const angle = stickerAngle(person.id);

  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!rich || e.pointerType !== "mouse") return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width;
    const y = (e.clientY - box.top) / box.height;
    e.currentTarget.style.setProperty("--mx", x.toFixed(3));
    e.currentTarget.style.setProperty("--my", y.toFixed(3));
    ry.set((x - 0.5) * 20);
    rx.set((0.5 - y) * 20);
  };
  const reset = () => {
    setHover(false);
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: -20, scale: 1.06 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        delay: Math.min((index % 4) * 0.035, 0.6),
        type: "spring",
        stiffness: 420,
        damping: 22,
      }}
    >
      {/* Search dims the cards that don't match (the layout stays put). */}
      <div
        className={cn(
          "transition-[opacity,filter] duration-300",
          state === "dim" && "opacity-[0.15] grayscale",
        )}
      >
        <div
          className="relative aspect-[3/4] [perspective:900px]"
          style={
            {
              rotate: hover || reduce ? "0deg" : `${angle}deg`,
              transition: "rotate 250ms ease-out",
            } as CSSProperties
          }
        >
          {!open && (
            <motion.button
              ref={ref}
              type="button"
              layoutId={`album-card-${person.slug}`}
              data-slug={person.slug}
              data-cursor="flip"
              aria-label={`Open ${person.name}'s card`}
              onPointerEnter={(e) =>
                e.pointerType === "mouse" && setHover(true)
              }
              onPointerMove={onMove}
              onPointerLeave={reset}
              onFocus={() => setHover(true)}
              onBlur={reset}
              onClick={(e) => onOpen(person, e.currentTarget)}
              whileTap={{ scale: 0.97 }}
              style={
                rich && !reduce
                  ? {
                      rotateX: srx,
                      rotateY: sry,
                      transformStyle: "preserve-3d",
                    }
                  : undefined
              }
              className={cn(
                "group/card absolute inset-0 block rounded-[14px] text-left",
                state === "match" &&
                  "ring-[3px] ring-[#3fcfca] ring-offset-4 ring-offset-[#0f2724]",
              )}
            >
              <CardFront
                person={person}
                lifted={hover && rich && !reduce}
                sizes="(min-width: 1024px) 340px, (min-width: 768px) 30vw, 60vw"
              />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
