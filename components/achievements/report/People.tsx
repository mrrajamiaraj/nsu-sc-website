"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Cutout, Silhouette } from "@/components/teams/announcement/Cutout";
import { ProfileDrawer } from "@/components/teams/announcement/ProfileDrawer";
import { RosterProvider, useRoster } from "@/components/teams/announcement/RosterContext";
import { ANTON, AchievementLink, initials } from "@/components/achievements/report/shared";
import type { ReportPerson } from "@/lib/report";
import { cn } from "@/lib/utils";

function PersonCard({ person, currentId }: { person: ReportPerson; currentId: string }) {
  const { open } = useRoster();
  const [hover, setHover] = useState(false);
  const others = person.achievements.filter((a) => a.id !== currentId);
  const total = person.achievements.length;
  const p = person.person;

  return (
    <li
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHover(false)}
    >
      <div className={cn("relative w-[220px] transition duration-200", hover && "-translate-y-1")}>
        <button
          type="button"
          onClick={(e) => open(p.slug, "list", e.currentTarget)}
          aria-label={`${person.name}${person.role ? `, ${person.role}` : ""}. Open profile`}
          className="group block w-full text-left"
        >
          <span
            className={cn(
              "relative block aspect-[4/5] overflow-hidden rounded-[10px] bg-gradient-to-b from-[#0f302e] to-[#13312d] transition-shadow duration-200",
              hover && "shadow-[0_24px_44px_-24px_rgba(0,0,0,0.85)]",
            )}
          >
            {p.photo ? (
              <Cutout person={p} boxRatio={4 / 5} sizes="220px" className={cn("transition duration-300", hover ? "grayscale-0" : "grayscale")} />
            ) : (
              <>
                <Silhouette />
                <span aria-hidden className={cn(ANTON, "absolute inset-x-0 top-[58%] text-center text-[40px] text-[#f5f1e8]/45")}>
                  {initials(person.name)}
                </span>
              </>
            )}
          </span>
          <span className={cn(ANTON, "mt-3 block text-[22px] leading-[1.05] text-[#f5f1e8]")}>{person.name}</span>
          {person.role && <span className="mt-1 block text-[14px] text-[#f5f1e8]/65">{person.role}</span>}
        </button>
        {person.squad && (
          <Link href={person.squad.href} className="report-link mt-1.5 inline-flex items-center gap-1 text-[14px] font-semibold text-[#3fcfca]">
            {person.squad.label}
            <ArrowRight aria-hidden className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Mini profile: what else this person has on record. */}
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-[236px] top-4 z-20 hidden w-[260px] rounded-lg border border-white/10 bg-[#0f302e] p-4 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.85)] md:block"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3fcfca]">In the trophy room</p>
            <p className="mt-1 text-[14px] text-[#f5f1e8]">
              {total} {total === 1 ? "achievement" : "achievements"} on record
            </p>
            {others.length > 0 ? (
              <ul className="mt-3 space-y-2 border-t border-white/10 pt-3">
                {others.slice(0, 4).map((a) => (
                  <li key={a.id}>
                    <AchievementLink to={a} className="report-link text-[13px] leading-snug text-[#f5f1e8]/85">
                      {a.year ? `${a.year} · ` : ""}
                      {a.title}
                    </AchievementLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[13px] leading-snug text-[#f5f1e8]/55">No other entries on record yet.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

// The drawer reads which person is open and shows their squad and trophy-room entries.
function Drawer({ people }: { people: ReportPerson[] }) {
  const { current } = useRoster();
  const person = people.find((p) => p.person.slug === current?.slug);
  return (
    <ProfileDrawer
      squadLabel={person?.squad?.label ?? "Not on a squad roster"}
      heading="People involved"
      honours={(person?.achievements ?? []).map((a) => ({ id: a.id, title: a.year ? `${a.year} · ${a.title}` : a.title, href: a.href }))}
      honoursTitle="In the trophy room"
    />
  );
}

export function People({ people, currentId }: { people: ReportPerson[]; currentId: string }) {
  if (people.length === 0) return null;
  return (
    <RosterProvider people={people.map((p) => p.person)} initialPlayer={null}>
      <section aria-labelledby="people-heading" className="mt-16">
        <h2 id="people-heading" className="text-[12px] !font-semibold !tracking-[0.16em] text-[#f5f1e8]/50 ![font-family:var(--font-home),system-ui,sans-serif]">
          PEOPLE INVOLVED
        </h2>
        <ul className="mt-5 flex flex-wrap gap-6">
          {people.map((person) => (
            <PersonCard key={person.key} person={person} currentId={currentId} />
          ))}
        </ul>
      </section>
      <Drawer people={people} />
    </RosterProvider>
  );
}
