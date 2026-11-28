"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ANTON, Face, useOpenPerson } from "@/components/members/sheet/shared";
import { SocialIcon } from "@/components/members/sheet/Socials";
import type { PanelPerson } from "@/lib/members-sheet";
import { cn } from "@/lib/utils";

function Member({ person, scope }: { person: PanelPerson; scope: PanelPerson[] }) {
  const open = useOpenPerson();
  const facts = [person.department, person.sport].filter(Boolean);
  return (
    <li className="group relative flex w-[104px] flex-col items-center md:w-[136px]">
      <button
        type="button"
        data-cursor="view"
        onClick={(e) => open(person, scope, e.currentTarget)}
        aria-label={`${person.name}${person.role ? `, ${person.role}` : ""}. Open profile`}
        className="flex flex-col items-center text-center"
      >
        <span className="relative block h-[72px] w-[72px] md:h-[88px] md:w-[88px]">
          {/* Disc */}
          <span aria-hidden className="absolute inset-0 rounded-full bg-[#13312d] ring-1 ring-white/10 transition duration-200 group-hover:ring-2 group-hover:ring-[#3fcfca] group-focus-within:ring-2 group-focus-within:ring-[#3fcfca]" />
          {/* The portrait pops up out of its disc on hover. */}
          <span className="committee-face absolute inset-0">
            <Face person={person} size={88} className="!h-full !w-full !rounded-none !bg-transparent" />
          </span>
        </span>
        <span className="mt-3 text-[14px] font-semibold leading-snug text-[#f5f1e8] md:text-[15px]">{person.name}</span>
        <span className="mt-0.5 text-[12px] text-[#f5f1e8]/55">{person.role ?? person.department ?? "Sub-executive"}</span>
      </button>

      {/* Tooltip: department, sport and socials when there are any. */}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%-4px)] left-1/2 z-20 w-max max-w-[220px] -translate-x-1/2 translate-y-1 rounded-md border border-white/10 bg-[#f5f1e8] px-3 py-2 text-[12px] leading-snug text-[#0b2524] opacity-0 shadow-lg transition duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 max-md:hidden"
      >
        <span className="block font-semibold">{person.role ?? "Sub-executive"}</span>
        <span className="block text-[#0b2524]/70">{facts.length ? facts.join(" · ") : "Department not assigned yet"}</span>
        {person.socials.length > 0 && (
          <span className="mt-1.5 flex gap-2">
            {person.socials.map((s) => (
              <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${person.name} on ${s.key}`} className="text-[#0b2524]/70 hover:text-[#0b2524]">
                <SocialIcon kind={s.key} className="h-4 w-4" />
              </a>
            ))}
          </span>
        )}
      </span>
    </li>
  );
}

// Sub-executives grouped by department (one group until departments are recorded).
export function Committee({ people }: { people: PanelPerson[] }) {
  const departments = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of people) if (p.department) counts.set(p.department, (counts.get(p.department) ?? 0) + 1);
    return Array.from(counts).sort((a, b) => b[1] - a[1]);
  }, [people]);
  const [tab, setTab] = useState<string>("all");
  const shown = tab === "all" ? people : people.filter((p) => p.department === tab);
  if (people.length === 0) return null;

  return (
    <section aria-labelledby="committee-heading" className="mx-auto mt-28 max-w-[1280px] px-4 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#3fcfca]/85">{people.length} sub-executives</p>
          <h2 id="committee-heading" className={cn(ANTON, "mt-2 text-[36px] !leading-none text-[#f5f1e8] md:text-[48px]")}>
            The committee
          </h2>
        </div>
        {departments.length > 1 && (
          <div role="group" aria-label="Department" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
            {[["all", people.length] as [string, number], ...departments].map(([key, count]) => (
              <button
                key={key}
                type="button"
                aria-pressed={tab === key}
                onClick={() => setTab(key)}
                className={cn("relative min-h-[44px] shrink-0 px-3 text-[15px] font-medium transition-colors", tab === key ? "text-[#3fcfca]" : "text-[#f5f1e8]/70 hover:text-[#f5f1e8]")}
              >
                {key === "all" ? "All" : key}
                <span className="ml-1.5 text-[13px] tabular-nums text-[#f5f1e8]/45">{count}</span>
                {tab === key && <motion.span layoutId="committee-tab" className="absolute inset-x-2 bottom-1.5 h-[2px] rounded-full bg-[#3fcfca]" />}
              </button>
            ))}
          </div>
        )}
      </div>
      {departments.length <= 1 && <p className="mt-3 text-[15px] text-[#f5f1e8]/60">Sub-executive committee. Departments will show here once they&rsquo;re assigned.</p>}
      {/* Centred rows, so a short last row never leaves one person stranded at the edge. 25 sit 5 × 5. */}
      <ul className="mx-auto mt-10 flex max-w-[360px] flex-wrap justify-center gap-x-2 gap-y-8 sm:max-w-[560px] md:max-w-[760px] md:gap-x-4">
        {shown.map((p) => (
          <Member key={p.slug} person={p} scope={shown} />
        ))}
      </ul>
    </section>
  );
}
