"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Stage, type ClubSignup } from "@/components/teams/squad-select/Stage";
import { EASE, SELECT_EVENT, selectSquad, type SelectDetail } from "@/components/teams/squad-select/shared";
import { SportIcon } from "@/components/home/SportIcon";
import type { Gender, SportGroup } from "@/lib/squads";
import { cn } from "@/lib/utils";

// "Squad select": the team sheet of sports on the left, the chosen squad on the stage.
// Phones get an accordion instead. The selection lives in the URL (?sport=football&g=men).
export function SquadSelect({
  groups,
  initial,
  signup,
}: {
  groups: SportGroup[];
  initial: { sport: string; gender: Gender };
  signup: ClubSignup;
}) {
  const reduce = Boolean(useReducedMotion());
  const [sport, setSport] = useState(initial.sport);
  const [gender, setGender] = useState<Gender>(initial.gender);
  const [dir, setDir] = useState(1);
  const [changes, setChanges] = useState(0);
  const [mobileOpen, setMobileOpen] = useState<string | null>(initial.sport);
  const section = useRef<HTMLElement>(null);
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  const mobileHeads = useRef<Record<string, HTMLButtonElement | null>>({});
  const index = (slug: string) => groups.findIndex((g) => g.slug === slug);

  const choose = useCallback(
    (nextSport: string, nextGender?: Gender) => {
      const group = groups.find((g) => g.slug === nextSport);
      if (!group) return;
      const wanted = nextGender ?? gender;
      const g: Gender = group.squads[wanted] ? wanted : group.squads.men ? "men" : "women";
      if (nextSport === sport && g === gender) return;
      setDir(nextSport !== sport ? Math.sign(index(nextSport) - index(sport)) || 1 : g === "women" ? 1 : -1);
      setSport(nextSport);
      setGender(g);
      setChanges((c) => c + 1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groups, sport, gender],
  );

  // Keep the URL linkable without a server round trip, and tell the trials band.
  useEffect(() => {
    if (changes === 0) return;
    const url = new URL(window.location.href);
    url.searchParams.set("sport", sport);
    url.searchParams.set("g", gender);
    window.history.replaceState(window.history.state, "", url);
    selectSquad({ sport, gender, from: "select" });
  }, [sport, gender, changes]);

  // The at-a-glance table jumps here and picks a squad.
  useEffect(() => {
    const onSelect = (e: Event) => {
      const detail = (e as CustomEvent<SelectDetail>).detail;
      if (detail.from !== "table") return;
      choose(detail.sport, detail.gender);
      setMobileOpen(detail.sport);
      // After the new squad has rendered, or the height change cancels a smooth scroll.
      window.setTimeout(() => section.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 60);
    };
    window.addEventListener(SELECT_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_EVENT, onSelect);
  }, [choose, reduce]);

  // ↑↓ (and Home/End) move between sports, selecting as they go.
  const onTabKey = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let i = index(sport);
    if (e.key in keys) i = (i + keys[e.key] + groups.length) % groups.length;
    else if (e.key === "Home") i = 0;
    else if (e.key === "End") i = groups.length - 1;
    else return;
    e.preventDefault();
    choose(groups[i].slug);
    tabs.current[groups[i].slug]?.focus();
  };

  const toggleMobile = (slug: string) => {
    if (mobileOpen === slug) {
      setMobileOpen(null);
      return;
    }
    setMobileOpen(slug);
    choose(slug);
    // Bring the opened sport to the top once the previous one has folded away.
    window.setTimeout(() => mobileHeads.current[slug]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), reduce ? 0 : 320);
  };

  const active = groups.find((g) => g.slug === sport) ?? groups[0];
  if (!active) return null;

  return (
    <section ref={section} id="squad-select" aria-label="Squad select" className="mx-auto max-w-[1280px] scroll-mt-24 px-4 sm:px-6 lg:px-8">
      {/* Desktop and tablet: master-detail. */}
      <div className="hidden gap-10 md:grid md:grid-cols-12 lg:gap-14">
        <div className="md:sticky md:top-28 md:col-span-4 md:self-start">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#f5f1e8]/50">Team sheet</p>
          <div role="tablist" aria-label="Sports" aria-orientation="vertical" onKeyDown={onTabKey} className="border-t border-white/10">
            {groups.map((group) => {
              const selected = group.slug === sport;
              return (
                <button
                  key={group.slug}
                  ref={(el) => {
                    tabs.current[group.slug] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${group.slug}`}
                  aria-selected={selected}
                  aria-controls="squad-stage"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => choose(group.slug)}
                  className="group relative flex w-full items-center gap-4 border-b border-white/10 py-4 text-left"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 top-3 bottom-3 w-[3px] origin-center rounded-full bg-[#3fcfca] transition-[opacity,transform] duration-200",
                      selected ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0 group-hover:scale-y-75 group-hover:opacity-40",
                    )}
                  />
                  <span
                    className={cn(
                      "flex min-w-0 flex-1 items-baseline gap-3 transition-[transform,color] duration-200 ease-out",
                      selected ? "translate-x-3 text-[#3fcfca]" : "text-[#f5f1e8] group-hover:translate-x-1.5 group-hover:text-[#3fcfca]/70",
                    )}
                  >
                    <span className="w-7 shrink-0 font-mono text-[13px] tabular-nums opacity-60">{group.number}</span>
                    <span className="min-w-0 truncate font-display text-[30px] font-extrabold uppercase leading-none lg:text-[42px] xl:text-[48px]">{group.name}</span>
                  </span>
                  <span className={cn("shrink-0 text-[14px] tabular-nums transition-colors", selected ? "text-[#3fcfca]" : "text-[#f5f1e8]/55")}>
                    {group.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div id="squad-stage" role="tabpanel" aria-labelledby={`tab-${active.slug}`} className="md:col-span-8">
          <Stage group={active} gender={gender} onGender={(g) => choose(sport, g)} dir={dir} animateIn={changes > 0} idBase="desk" signup={signup} />
        </div>
      </div>

      {/* Phones: an accordion, one sport open at a time. */}
      <div className="border-t border-white/10 md:hidden">
        {groups.map((group) => {
          const open = mobileOpen === group.slug;
          return (
            <div key={group.slug} className="border-b border-white/10">
              <h2 className="!font-sans !normal-case">
                <button
                  ref={(el) => {
                    mobileHeads.current[group.slug] = el;
                  }}
                  type="button"
                  id={`acc-${group.slug}`}
                  aria-expanded={open}
                  aria-controls={`acc-panel-${group.slug}`}
                  onClick={() => toggleMobile(group.slug)}
                  className={cn("flex w-full scroll-mt-20 items-center gap-3 py-4 text-left", open ? "text-[#3fcfca]" : "text-[#f5f1e8]")}
                >
                  <span className="w-6 shrink-0 font-mono text-[12px] tabular-nums opacity-60">{group.number}</span>
                  <SportIcon sport={group.name} aria-hidden className="h-5 w-5 shrink-0 opacity-70" />
                  <span className="min-w-0 flex-1 truncate font-display text-[30px] font-extrabold uppercase leading-none">{group.name}</span>
                  <span className="text-[14px] tabular-nums text-[#f5f1e8]/60">{group.total}</span>
                  <ChevronDown aria-hidden className={cn("h-5 w-5 shrink-0 transition-transform duration-200", open && "rotate-180")} />
                </button>
              </h2>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    id={`acc-panel-${group.slug}`}
                    role="region"
                    aria-labelledby={`acc-${group.slug}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={reduce ? { duration: 0.15 } : { duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 pt-1">
                      <Stage
                        group={group}
                        gender={group.slug === sport ? gender : "men"}
                        onGender={(g) => choose(group.slug, g)}
                        dir={dir}
                        animateIn={changes > 0}
                        idBase={`m-${group.slug}`}
                        signup={signup}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
