"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { SportIcon } from "@/components/home/SportIcon";
import { SELECT_EVENT, trialsHref, type SelectDetail } from "@/components/teams/squad-select/shared";
import { GENDER_LABEL, type Gender, type SportGroup } from "@/lib/squads";
import type { ClubRegistration } from "@/lib/registration";
import { cn } from "@/lib/utils";

// The page's one call to action. The sport picker follows Squad Select and decides which
// squad the trials enquiry is about.
export function TrialsBand({ groups, club, initial }: { groups: SportGroup[]; club: ClubRegistration; initial: { sport: string; gender: Gender } }) {
  const [sport, setSport] = useState(initial.sport);
  const [gender, setGender] = useState<Gender>(initial.gender);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const onSelect = (e: Event) => {
      const detail = (e as CustomEvent<SelectDetail>).detail;
      if (detail.from !== "select") return;
      setSport(detail.sport);
      setGender(detail.gender);
    };
    window.addEventListener(SELECT_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_EVENT, onSelect);
  }, []);

  const group = groups.find((g) => g.slug === sport) ?? groups[0];
  const squad = group?.squads[gender] ?? (group ? Object.values(group.squads)[0] : undefined) ?? null;

  const onKey = (e: KeyboardEvent) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = (groups.findIndex((g) => g.slug === sport) + step + groups.length) % groups.length;
    setSport(groups[i].slug);
    refs.current[groups[i].slug]?.focus();
  };

  return (
    <section aria-labelledby="trials-heading" className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6 lg:mt-32 lg:px-8">
      <div className="border-t border-white/15 pt-12 lg:grid lg:grid-cols-12 lg:gap-10 lg:pt-16">
        <div className="lg:col-span-7">
          <h2 id="trials-heading" className="text-[44px] !font-extrabold leading-[0.92] text-[#f5f1e8] md:text-[72px]">
            Trying out for a squad?
          </h2>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[#f5f1e8]/75">{club.body}</p>
          {!club.open && <p className="mt-3 text-[14px] font-medium text-[#3fcfca]">{club.status}</p>}
        </div>

        <div className="mt-10 lg:col-span-5 lg:mt-2">
          <p id="trials-sport-label" className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#f5f1e8]/55">
            Your sport
          </p>
          <div role="radiogroup" aria-labelledby="trials-sport-label" onKeyDown={onKey} className="mt-3 grid grid-cols-5 gap-2">
            {groups.map((g) => {
              const selected = g.slug === sport;
              return (
                <button
                  key={g.slug}
                  ref={(el) => {
                    refs.current[g.slug] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={g.name}
                  title={g.name}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setSport(g.slug)}
                  className={cn(
                    "group flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border hover:-translate-y-0.5",
                    selected ? "border-[#3fcfca] bg-[#3fcfca]/10 text-[#3fcfca]" : "border-white/15 text-[#f5f1e8]/70 hover:border-white/40 hover:text-[#f5f1e8]",
                  )}
                >
                  <SportIcon sport={g.name} aria-hidden className="h-7 w-7 transition-transform duration-200 group-hover:scale-110" />
                  <span aria-hidden className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] sm:block">
                    {g.name.replace("Table Tennis", "T. Tennis")}
                  </span>
                </button>
              );
            })}
          </div>
          {squad && (
            <p className="mt-3 text-[13px] text-[#f5f1e8]/60" aria-live="polite">
              Asking about: {group?.name} — {GENDER_LABEL[squad.gender]}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Magnetic>
              {club.formUrl ? (
                <a
                  href={club.formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-haptic
                  className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#3fcfca] px-7 text-[16px] font-semibold text-[#002e2c] hover:bg-[#6fe0dc]"
                >
                  Join the club
                  <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  <span className="sr-only">(opens the sign-up form)</span>
                </a>
              ) : (
                <Link
                  href={trialsHref(squad)}
                  data-haptic
                  className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#3fcfca] px-7 text-[16px] font-semibold text-[#002e2c] hover:bg-[#6fe0dc]"
                >
                  Ask about trials
                  <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </Magnetic>
            {club.formUrl && (
              <Link
                href={trialsHref(squad)}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-[#f5f1e8]/70 px-7 text-[16px] font-semibold text-[#f5f1e8] hover:-translate-y-0.5 hover:border-[#f5f1e8] hover:bg-white/10"
              >
                Ask about a squad
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
