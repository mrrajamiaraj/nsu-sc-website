"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Images, Users } from "lucide-react";
import { Cutout, initials } from "@/components/teams/announcement/Cutout";
import { useRoster } from "@/components/teams/announcement/RosterContext";
import { CourtLines } from "@/components/teams/squad-select/CourtLines";
import { BLUR, EASE } from "@/components/teams/squad-select/shared";
import type { SquadHonour } from "@/lib/squads";
import { lineupOrder, type SheetPerson } from "@/lib/team-sheet";
import { cn } from "@/lib/utils";

export type HeroInfo = {
  sportSlug: string;
  sport: string; // "Cricket"
  side: string; // "Men"
  secondLine: string; // "Men's squad"
  backHref: string;
  players: number;
  captain: string | null;
  staff: { label: string; names: string } | null;
  lastResult: SquadHonour | null;
  teamPhoto: string | null;
};

const roleLine = (p: SheetPerson) => [p.role, p.captain === "C" ? "Captain" : p.captain === "VC" ? "Vice-Captain" : null].filter(Boolean).join(" · ");

// ---- Desktop: one overlapping row, captain centred and larger. Squads over 18 stand in two
// rows like a team photo: a raised back row behind the front row (captain front and centre).

const TWO_ROWS = 18;

function splitRows(players: SheetPerson[]): SheetPerson[][] {
  if (players.length <= TWO_ROWS) return [lineupOrder(players)];
  // Front row: the captaincy first, then faces with photos; the rest stand behind.
  const ranked = [...players].sort(
    (a, b) => Number(Boolean(b.captain)) - Number(Boolean(a.captain)) || Number(Boolean(b.photo)) - Number(Boolean(a.photo)),
  );
  const frontCount = Math.ceil(players.length / 2);
  return [lineupOrder(ranked.slice(frontCount)), lineupOrder(ranked.slice(0, frontCount))];
}

function Lineup({ players }: { players: SheetPerson[] }) {
  const { open } = useRoster();
  const reduce = Boolean(useReducedMotion());
  const rows = splitRows(players);
  const flat = rows.flat();
  const front = rows[rows.length - 1];
  const centreId = front.find((p) => p.captain === "C")?.id ?? front[Math.floor((front.length - 1) / 2)]?.id;
  const [active, setActive] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const widest = Math.max(...rows.map((r) => r.length));
  // Slot width so the widest row fits the viewport: 30% overlap, captain 1.25x.
  const vars = { "--w": `min(200px, calc((100vw - 48px) / ${(1 + (widest - 1) * 0.7 + 0.25).toFixed(2)}))` } as CSSProperties;

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const from = Math.max(0, flat.findIndex((p) => p.id === (active ?? centreId)));
    const next = flat[Math.max(0, Math.min(flat.length - 1, from + (e.key === "ArrowRight" ? 1 : -1)))];
    setActive(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <div role="group" aria-label="Line-up" onKeyDown={onKey} onPointerLeave={() => setActive(null)} style={vars} className="px-6 pt-16">
      {rows.map((row, r) => {
        const back = rows.length > 1 && r === 0;
        const centre = row.findIndex((p) => p.captain === "C");
        const mid = centre >= 0 ? centre : (row.length - 1) / 2;
        return (
          <ul
            key={r}
            className={cn("relative flex items-end justify-center", back && "z-0 scale-[0.9]")}
            // The back row stands behind: only heads and shoulders show above the front row.
            style={back ? { marginBottom: "calc(var(--w) * -0.95)" } : { zIndex: 1 }}
          >
            {row.map((p, i) => {
              const distance = Math.abs(i - mid) + (back ? 3 : 0);
              const isCaptain = !back && i === centre;
              const isActive = active === p.id;
              const dimmed = active !== null && !isActive;
              return (
                <li
                  key={p.id}
                  className="relative shrink-0"
                  style={{
                    width: isCaptain ? "calc(var(--w) * 1.25)" : "var(--w)",
                    marginLeft: i === 0 ? 0 : "calc(var(--w) * -0.3)",
                    zIndex: isActive ? 100 : 50 - Math.round(Math.abs(i - mid) * 2),
                  }}
                >
                  <motion.div
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: "60%" }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 140, damping: 18, delay: 0.15 + distance * 0.05 }}
                  >
                    <motion.button
                      ref={(el) => {
                        refs.current[p.id] = el;
                      }}
                      type="button"
                      data-cursor="view"
                      tabIndex={p.id === centreId ? 0 : -1}
                      aria-label={`${p.name}${roleLine(p) ? `, ${roleLine(p)}` : ""}`}
                      onPointerEnter={(e) => e.pointerType === "mouse" && setActive(p.id)}
                      onFocus={() => setActive(p.id)}
                      onBlur={() => setActive(null)}
                      onClick={(e) => open(p.slug, "hero", e.currentTarget)}
                      animate={{
                        scale: isActive && !reduce ? 1.08 : 1,
                        y: isActive && !reduce ? -12 : 0,
                        opacity: dimmed ? 0.4 : back ? 0.85 : 1,
                        filter: dimmed && !reduce ? "blur(2px)" : "blur(0px)",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      className="relative block aspect-[3/4] w-full origin-bottom focus-visible:!outline-offset-0"
                    >
                      <Cutout person={p} boxRatio={3 / 4} fill={0.96} priority sizes="240px" />
                      {!p.photo && (
                        <span aria-hidden className="absolute inset-x-0 top-[38%] text-center font-display text-[28px] font-extrabold text-[#f5f1e8]/30">
                          {initials(p.name)}
                        </span>
                      )}
                    </motion.button>
                  </motion.div>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        aria-hidden
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.18 }}
                        className="pointer-events-none absolute bottom-full left-1/2 mb-1 w-max max-w-[16rem] -translate-x-1/2 text-center"
                      >
                        <span className="block font-display text-[22px] font-extrabold uppercase leading-none text-[#f5f1e8]">{p.name}</span>
                        {roleLine(p) && <span className="mt-1 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[#3fcfca]">{roleLine(p)}</span>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        );
      })}
    </div>
  );
}

// ---- Phones: a swipeable row, captain first. Tap shows the name; tap again opens the profile.

function SwipeRow({ players }: { players: SheetPerson[] }) {
  const { open } = useRoster();
  const captain = players.find((p) => p.captain === "C");
  const order = captain ? [captain, ...players.filter((p) => p !== captain)] : players;
  const [active, setActive] = useState(order[0]?.slug ?? null);
  const current = order.find((p) => p.slug === active);
  return (
    <div>
      <ul aria-label="Line-up" className="no-scrollbar flex snap-x snap-mandatory gap-1 overflow-x-auto px-[calc(50%-64px)] pt-6">
        {order.map((p) => (
          <li key={p.id} className="shrink-0 snap-center">
            <button
              type="button"
              aria-label={`${p.name}${roleLine(p) ? `, ${roleLine(p)}` : ""}`}
              aria-pressed={active === p.slug}
              onClick={(e) => (active === p.slug ? open(p.slug, "hero", e.currentTarget) : setActive(p.slug))}
              className={cn("relative block h-[170px] w-[128px] transition-opacity duration-200", active === p.slug ? "opacity-100" : "opacity-60")}
            >
              <Cutout person={p} boxRatio={128 / 170} fill={0.96} priority={p === order[0]} sizes="160px" />
            </button>
          </li>
        ))}
      </ul>
      {current && (
        <p className="mt-3 px-4 text-center" aria-live="polite">
          <span className="block font-display text-[22px] font-extrabold uppercase leading-none text-[#f5f1e8]">{current.name}</span>
          <span className="mt-1 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[#3fcfca]">
            {roleLine(current) || "Tap again for profile"}
          </span>
        </p>
      )}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3.5 lg:py-4">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/50">{label}</dt>
      <dd className="mt-1 text-[16px] font-medium leading-snug text-[#f5f1e8]">{children}</dd>
    </div>
  );
}

export function LineupHero({ info, players }: { info: HeroInfo; players: SheetPerson[] }) {
  const reduce = Boolean(useReducedMotion());
  const [photo, setPhoto] = useState(false);
  const wipeDelay = reduce ? 0 : 0.35 + Math.ceil(Math.min(players.length, 18) / 2) * 0.05;
  const tba = <span className="text-[#f5f1e8]/55">To be announced</span>;

  return (
    <section aria-labelledby="squad-title" className="relative overflow-hidden bg-[#071a19]">
      <CourtLines sport={info.sportSlug} strength={0.06} className="absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,rgba(245,241,232,0.09),transparent_70%)]" />

      <div className="relative mx-auto max-w-[1280px] px-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <Link href={info.backHref} className="inline-flex min-h-[40px] items-center gap-2 text-[14px] font-medium text-[#f5f1e8]/70 hover:text-[#f5f1e8]">
          <ArrowLeft aria-hidden className="h-4 w-4 transition-transform hover:-translate-x-0.5" />
          All squads
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#3fcfca]/80">
              {info.sport} · {info.side}
            </p>
            <motion.h1
              id="squad-title"
              initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)" }}
              animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)" }}
              transition={reduce ? { duration: 0.15 } : { duration: 0.7, delay: wipeDelay, ease: EASE }}
              className="mt-3 text-[56px] !font-extrabold leading-[0.86] text-[#f5f1e8] md:text-[88px] lg:text-[120px]"
            >
              NSU {info.sport}
              <span className="block text-[#3fcfca]">{info.secondLine}</span>
            </motion.h1>
          </div>
          <div className="lg:col-span-4">
            <dl className="grid grid-cols-2 divide-white/10 border-y border-white/10 lg:grid-cols-1 lg:divide-y [&>*:nth-child(odd)]:border-r [&>*:nth-child(odd)]:border-white/10 [&>*:nth-child(odd)]:pr-3 [&>*:nth-child(even)]:pl-4 lg:[&>*]:!border-r-0 lg:[&>*]:!px-0">
              <Stat label="Players">{info.players}</Stat>
              <Stat label="Captain">{info.captain ?? tba}</Stat>
              <Stat label={info.staff?.label ?? "Manager"}>{info.staff?.names ?? tba}</Stat>
              <Stat label="Last result">
                {info.lastResult ? (
                  <Link href={info.lastResult.href} className="underline decoration-[#3fcfca]/50 underline-offset-4 hover:text-[#3fcfca]">
                    {info.lastResult.title}
                  </Link>
                ) : (
                  <span className="text-[#f5f1e8]/55">No results yet</span>
                )}
              </Stat>
            </dl>
            {info.teamPhoto && players.length > 0 && (
              <button
                type="button"
                aria-pressed={photo}
                onClick={() => setPhoto((v) => !v)}
                className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/20 px-4 text-[14px] font-medium text-[#f5f1e8]/85 hover:-translate-y-0.5 hover:border-white/50 hover:text-[#f5f1e8]"
              >
                {photo ? <Users aria-hidden className="h-4 w-4" /> : <Images aria-hidden className="h-4 w-4" />}
                {photo ? "Line-up" : "Team photo"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative mt-4">
        <AnimatePresence mode="wait" initial={false}>
          {photo && info.teamPhoto ? (
            <motion.div
              key="photo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.15 : 0.35 }}
              className="mx-auto max-w-[1280px] px-4 pb-10 pt-6 sm:px-6 lg:px-8"
            >
              <div data-cursor="view" className="relative aspect-video w-full overflow-hidden rounded-xl">
                <Image
                  src={info.teamPhoto}
                  alt={`NSU ${info.sport.toLowerCase()} ${info.side.toLowerCase()} squad photo`}
                  fill
                  sizes="(min-width: 1280px) 1216px, 100vw"
                  placeholder="blur"
                  blurDataURL={BLUR}
                  className="object-cover"
                />
              </div>
            </motion.div>
          ) : players.length > 0 ? (
            <motion.div key="lineup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0.15 : 0.3 }}>
              <div className="hidden md:block">
                <Lineup players={players} />
              </div>
              <div className="pb-8 md:hidden">
                <SwipeRow players={players} />
              </div>
            </motion.div>
          ) : (
            <p key="none" className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 text-[#f5f1e8]/60 sm:px-6 lg:px-8">
              The squad hasn’t been announced yet.
            </p>
          )}
        </AnimatePresence>
        {/* Floor line the squad stands on. */}
        <div aria-hidden className="h-px bg-white/10" />
      </div>
    </section>
  );
}
