"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { useRichPointer } from "@/components/contact/interaction/hooks";
import { CourtLines } from "@/components/teams/squad-select/CourtLines";
import { BLUR, EASE, trialsHref } from "@/components/teams/squad-select/shared";
import { GENDERS, GENDER_LABEL, type Gender, type SportGroup, type Squad, type SquadFace } from "@/lib/squads";
import { cn } from "@/lib/utils";

export type ClubSignup = { open: boolean; formUrl: string | null };

const PRIMARY =
  "group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#3fcfca] px-6 text-[15px] font-semibold text-[#002e2c] hover:bg-[#6fe0dc]";
const OUTLINE =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#f5f1e8]/40 px-6 text-[15px] font-semibold text-[#f5f1e8] hover:-translate-y-0.5 hover:border-[#f5f1e8] hover:bg-white/[0.06]";

const athletesLabel = (n: number) => `${n} athlete${n === 1 ? "" : "s"}`;
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// ---- Men / Women: a radiogroup with a sliding teal pill under the active option.

function GenderSwitch({ group, gender, onChange, idBase }: { group: SportGroup; gender: Gender; onChange: (g: Gender) => void; idBase: string }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const available = GENDERS.filter((g) => group.squads[g]);
  const onKey = (e: KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const i = available.indexOf(gender);
    const next = available[(i + (e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1) + available.length) % available.length];
    onChange(next);
    refs.current[next]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={`${group.name} squad`} onKeyDown={onKey} className="relative inline-flex rounded-full border border-white/15 bg-[#071a19] p-1">
      {GENDERS.map((g) => {
        const squad = group.squads[g];
        const active = g === gender;
        return (
          <button
            key={g}
            ref={(el) => {
              refs.current[g] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={!squad}
            tabIndex={active ? 0 : -1}
            onClick={() => squad && onChange(g)}
            className={cn(
              "relative z-0 min-h-[40px] rounded-full px-4 text-[14px] font-semibold disabled:opacity-40 sm:px-5",
              active ? "text-[#002e2c]" : "text-[#f5f1e8]/75 hover:text-[#f5f1e8]",
            )}
          >
            {active && (
              <motion.span
                layoutId={`${idBase}-gender-pill`}
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-[#3fcfca]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {GENDER_LABEL[g]} <span className={cn("tabular-nums", active ? "text-[#002e2c]/70" : "text-[#f5f1e8]/45")}>{squad?.athletes ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---- Photo with cursor tilt (max 3 degrees) and the squad title over it.

function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const on = useRichPointer();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 20 });
  const sry = useSpring(ry, { stiffness: 180, damping: 20 });
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!on || e.pointerType !== "mouse") return;
    const box = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - box.left) / box.width - 0.5) * 6);
    rx.set(-((e.clientY - box.top) / box.height - 0.5) * 6);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };
  return (
    <div className="[perspective:1200px]" onPointerMove={move} onPointerLeave={reset}>
      <motion.div className={className} style={on ? { rotateX: srx, rotateY: sry } : undefined}>
        {children}
      </motion.div>
    </div>
  );
}

function PhotoContent({ squad, group, signup }: { squad: Squad; group: SportGroup; signup: ClubSignup }) {
  const heading = `${group.name} — ${GENDER_LABEL[squad.gender]}`;
  if (squad.athletes === 0) {
    // Recruiting moment instead of an empty roster.
    return (
      <CourtLines sport={group.slug}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#3fcfca]/80">{heading}</p>
        <h3 className="mt-3 font-display text-[30px] font-extrabold uppercase leading-[0.95] text-[#f5f1e8] sm:text-[40px]">This squad is being built.</h3>
        <p className="mt-3 text-[15px] text-[#f5f1e8]/70">
          {signup.open ? "Trials open: be one of the first." : "Ask the panel about trials and be one of the first."}
        </p>
      </CourtLines>
    );
  }
  return (
    <>
      {squad.photo ? (
        <Image
          src={squad.photo}
          alt={`NSU ${group.name.toLowerCase()} ${GENDER_LABEL[squad.gender].toLowerCase()} squad photo`}
          fill
          sizes="(min-width: 1280px) 820px, (min-width: 768px) 66vw, 100vw"
          placeholder="blur"
          blurDataURL={BLUR}
          loading="lazy"
          className="object-cover"
        />
      ) : (
        <CourtLines sport={group.slug}>
          <p className="-mt-10 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/55">Squad photo coming soon</p>
        </CourtLines>
      )}
      {/* Scrim under the title only, so the text reads on any photo. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#071a19]/90 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5 sm:p-7">
        <h3 className="font-display text-[28px] font-extrabold uppercase leading-none text-[#f5f1e8] sm:text-[40px]">{heading}</h3>
        <p className="mt-1.5 text-[14px] font-medium text-[#f5f1e8]/80">{athletesLabel(squad.athletes)}</p>
      </div>
    </>
  );
}

// ---- Info row, faces, actions

function InfoCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-4 md:px-5 md:py-1 md:first:pl-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/50">{label}</dt>
      <dd className="mt-2 text-[15px] font-medium leading-snug text-[#f5f1e8]">{children}</dd>
    </div>
  );
}

const TBA = <span className="text-[#f5f1e8]/55">To be announced</span>;

function InfoRow({ squad }: { squad: Squad }) {
  return (
    <dl className="grid divide-y divide-white/10 border-y border-white/10 md:grid-cols-3 md:divide-x md:divide-y-0 md:border-y-0">
      <InfoCell label="Captain">
        {squad.captain ? (
          <span className="flex items-center gap-3">
            {squad.captain.photo ? (
              <Image src={squad.captain.photo} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-full object-cover" />
            ) : (
              <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#123a38] text-[13px] font-semibold">
                {initials(squad.captain.name)}
              </span>
            )}
            {squad.captain.name}
          </span>
        ) : (
          TBA
        )}
      </InfoCell>
      <InfoCell label={squad.staff?.role ?? "Head coach / manager"}>{squad.staff ? squad.staff.names.join(", ") : TBA}</InfoCell>
      <InfoCell label="Last result">
        {squad.lastResult ? (
          <Link href={squad.lastResult.href} className="text-[#f5f1e8] underline decoration-[#3fcfca]/50 underline-offset-4 hover:text-[#3fcfca] hover:decoration-[#3fcfca]">
            {squad.lastResult.title}
          </Link>
        ) : (
          <span className="text-[#f5f1e8]/55">No results yet</span>
        )}
      </InfoCell>
    </dl>
  );
}

// 40px faces overlapping by 8px; 34px on phones so twelve fit across.
function Face({ face }: { face: SquadFace }) {
  return (
    <li className="group/face relative -ml-2 first:ml-0 hover:z-10 focus-within:z-10">
      <span className="block h-[34px] w-[34px] overflow-hidden rounded-full ring-2 ring-[#0b2524] transition-transform duration-150 group-hover/face:-translate-y-1 sm:h-10 sm:w-10">
        {face.photo ? (
          <Image src={face.photo} alt={face.name} width={40} height={40} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span role="img" aria-label={face.name} className="flex h-full w-full items-center justify-center bg-[#123a38] text-[12px] font-semibold text-[#f5f1e8]">
            {initials(face.name)}
          </span>
        )}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-[14rem] -translate-x-1/2 translate-y-1 rounded-md bg-[#f5f1e8] px-2.5 py-1.5 text-center text-[12px] leading-tight text-[#0b2524] opacity-0 shadow-lg transition duration-150 group-hover/face:translate-y-0 group-hover/face:opacity-100"
      >
        <span className="block font-semibold">{face.name}</span>
        {face.position && <span className="block text-[#0b2524]/70">{face.position}</span>}
      </span>
    </li>
  );
}

function Faces({ squad }: { squad: Squad }) {
  const more = squad.athletes - squad.faces.length;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <ul aria-label={`Players in the ${squad.teamName} squad`} className="flex">
        {squad.faces.map((face) => (
          <Face key={face.id} face={face} />
        ))}
      </ul>
      {more > 0 && <span className="text-[14px] font-medium text-[#f5f1e8]/70">+{more} more</span>}
    </div>
  );
}

function SignupButton({ squad, signup, label = "Sign up for trials" }: { squad: Squad; signup: ClubSignup; label?: string }) {
  const inner = (
    <>
      {label}
      <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </>
  );
  return (
    <Magnetic>
      {signup.formUrl ? (
        <a href={signup.formUrl} target="_blank" rel="noopener noreferrer" data-haptic className={PRIMARY}>
          {inner}
          <span className="sr-only">(opens the sign-up form)</span>
        </a>
      ) : (
        <Link href={trialsHref(squad)} data-haptic className={PRIMARY}>
          {inner}
        </Link>
      )}
    </Magnetic>
  );
}

function Actions({ squad, signup }: { squad: Squad; signup: ClubSignup }) {
  const full = `/teams/${squad.slug}`;
  if (squad.athletes === 0) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <SignupButton squad={squad} signup={signup} />
        <Link href={trialsHref(squad)} className={OUTLINE}>
          Ask about this squad
        </Link>
      </div>
    );
  }
  if (squad.spotsOpen) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <SignupButton squad={squad} signup={signup} />
        <Link href={full} className={OUTLINE}>
          View full squad
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Magnetic>
        <Link href={full} data-haptic className={PRIMARY}>
          View full squad
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Magnetic>
      <Link href={trialsHref(squad)} className={OUTLINE}>
        Trials for this squad
      </Link>
    </div>
  );
}

// Thin squad: show who's there and how many places are open.
function ThinSquad({ squad }: { squad: Squad }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <ul aria-label={`Players in the ${squad.teamName} squad`} className="flex flex-wrap gap-4">
        {squad.faces.map((face) => (
          <li key={face.id} className="flex items-center gap-3">
            {face.photo ? (
              <Image src={face.photo} alt="" width={48} height={48} className="h-12 w-12 rounded-full object-cover ring-2 ring-[#3fcfca]/40" />
            ) : (
              <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-[#123a38] text-[13px] font-semibold">
                {initials(face.name)}
              </span>
            )}
            <span>
              <span className="block text-[15px] font-semibold text-[#f5f1e8]">{face.name}</span>
              {face.position && <span className="block text-[13px] text-[#f5f1e8]/60">{face.position}</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[15px] font-semibold text-[#3fcfca]">
        Looking for players: {squad.spotsOpen} spot{squad.spotsOpen === 1 ? "" : "s"} open
      </p>
    </div>
  );
}

// ---- The stage

export function Stage({
  group,
  gender,
  onGender,
  dir,
  animateIn,
  idBase,
  signup,
}: {
  group: SportGroup;
  gender: Gender;
  onGender: (g: Gender) => void;
  /** Direction of travel for the photo slide: 1 forward, -1 back. */
  dir: number;
  /** False on the first render, so server-rendered content shows without waiting for scripts. */
  animateIn: boolean;
  idBase: string;
  signup: ClubSignup;
}) {
  const reduce = Boolean(useReducedMotion());
  const squad = group.squads[gender] ?? Object.values(group.squads)[0];
  const swipe = useRef<{ x: number; y: number } | null>(null);
  if (!squad) return null;

  const slide = {
    enter: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: 48 * d }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: -48 * d }),
  };
  const rise = (step: number) =>
    animateIn
      ? {
          initial: reduce ? { opacity: 0 } : { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: reduce ? { duration: 0.15 } : { duration: 0.35, delay: 0.05 * step, ease: EASE },
        }
      : {};

  // Phones: swipe the photo left for Women, right for Men.
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "touch") swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(e.clientY - start.y)) return;
    const next: Gender = dx < 0 ? "women" : "men";
    if (next !== squad.gender && group.squads[next]) onGender(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <GenderSwitch group={group} gender={squad.gender} onChange={onGender} idBase={idBase} />
      </div>

      <Tilt className="relative">
        <div
          data-cursor={squad.photo && squad.athletes > 0 ? "view" : undefined}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipe.current = null)}
          className="relative aspect-[4/3] w-full touch-pan-y overflow-hidden rounded-xl bg-[#0f302e] sm:aspect-video"
        >
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={squad.slug}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={reduce ? { duration: 0.15 } : { duration: 0.45, ease: EASE }}
              className="absolute inset-0"
            >
              <PhotoContent squad={squad} group={group} signup={signup} />
            </motion.div>
          </AnimatePresence>
        </div>
      </Tilt>

      <div key={squad.slug} className="flex flex-col gap-6">
        {squad.athletes > 0 && (
          <motion.div {...rise(2)}>
            <InfoRow squad={squad} />
          </motion.div>
        )}
        {squad.athletes > 0 && (
          <motion.div {...rise(3)}>{squad.spotsOpen ? <ThinSquad squad={squad} /> : <Faces squad={squad} />}</motion.div>
        )}
        <motion.div {...rise(4)}>
          <Actions squad={squad} signup={signup} />
        </motion.div>
      </div>
    </div>
  );
}
