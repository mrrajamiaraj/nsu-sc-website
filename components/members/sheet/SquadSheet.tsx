"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { anton } from "@/components/achievements/report/fonts";
import { Baton } from "@/components/alumni/relay/shared";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { Committee } from "@/components/members/sheet/Committee";
import { Formation } from "@/components/members/sheet/Formation";
import { Hero } from "@/components/members/sheet/Hero";
import { Roster, type RosterSort, type RosterView } from "@/components/members/sheet/Roster";
import { ANTON, OpenProvider, TIER_FILTERS, contactHref, type TierFilter } from "@/components/members/sheet/shared";
import { SOCIAL_LABEL, SocialIcon } from "@/components/members/sheet/Socials";
import { typingIn } from "@/components/achievements/report/shared";
import { initials } from "@/components/teams/announcement/Cutout";
import { ProfileDrawer } from "@/components/teams/announcement/ProfileDrawer";
import { RosterProvider, useRoster } from "@/components/teams/announcement/RosterContext";
import { TIER_KEYS, TIER_LABEL, type PanelPerson } from "@/lib/members-sheet";
import type { SheetPerson } from "@/lib/team-sheet";
import { cn } from "@/lib/utils";

const TIER_RANK = Object.fromEntries(TIER_KEYS.map((t, i) => [t, i])) as Record<PanelPerson["tier"], number>;

const toSheet = (p: PanelPerson): SheetPerson => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  role: p.role ?? TIER_LABEL[p.tier].one,
  mark: initials(p.name),
  number: null,
  group: TIER_LABEL[p.tier].one,
  captain: /president/i.test(p.role ?? "") ? "C" : null,
  photo: p.photo,
  frame: p.frame,
  bio: null,
  links: [],
});

const search = (p: PanelPerson) => [p.name, p.role, p.department, p.sport, TIER_LABEL[p.tier].one, TIER_LABEL[p.tier].many].filter(Boolean).join(" ").toLowerCase();

// The drawer's body for a panel member: role, tier, department, sport, study, who to ask,
// opt-in socials, and a message link that goes through the panel's contact form.
function MemberDetails({ person }: { person: PanelPerson }) {
  const rows = [
    ["Role", person.role ?? "Member"],
    ["Tier", TIER_LABEL[person.tier].one],
    ...(person.department ? [["Department", person.department]] : []),
    ...(person.sport ? [["Sport", person.sport]] : []),
    ...(person.study ? [["Studies", person.study]] : []),
  ];
  return (
    <>
      <dl className="mt-6 grid grid-cols-2 border-y border-white/10">
        {rows.map(([label, value], i) => (
          <div key={label} className={cn("py-3", i % 2 === 0 ? "border-r border-white/10 pr-3" : "pl-4", i > 1 && "border-t border-white/10")}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f1e8]/50">{label}</dt>
            <dd className="mt-1 text-[15px] font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      {person.askAbout.length > 0 && (
        <p className="mt-6 text-[15px] leading-relaxed text-[#f5f1e8]/80">
          <span className="font-semibold text-[#f5f1e8]">Ask me about</span> {person.askAbout.join(", ")}.
        </p>
      )}
      {person.socials.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {person.socials.map((s) => (
            <li key={s.key}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/15 px-4 text-[14px] transition hover:-translate-y-0.5 hover:bg-white/10">
                <SocialIcon kind={s.key} className="h-4 w-4" />
                {SOCIAL_LABEL[s.key]}
              </a>
            </li>
          ))}
        </ul>
      )}
      <Link href={contactHref(person)} className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#3fcfca] px-5 text-[15px] font-semibold text-[#002e2c] transition hover:brightness-110">
        Message via the panel
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
      <p className="mt-3 text-[13px] leading-snug text-[#f5f1e8]/50">Your message goes to the club&rsquo;s inbox; the panel passes it on. Personal numbers and emails aren&rsquo;t published.</p>
    </>
  );
}

function Drawer({ byslug }: { byslug: Map<string, PanelPerson> }) {
  const { people } = useRoster();
  return (
    <ProfileDrawer
      squadLabel=""
      heading={people.length > 1 ? "The panel" : "Profile"}
      honours={[]}
      nameClassName={ANTON}
      eyebrow={(p) => {
        const m = byslug.get(p.slug);
        return <span>{[m?.role, m ? TIER_LABEL[m.tier].one : null, m?.department].filter((v, i, a) => v && a.indexOf(v) === i).join(" · ")}</span>;
      }}
      details={(p) => {
        const m = byslug.get(p.slug);
        return m ? <MemberDetails person={m} /> : null;
      }}
    />
  );
}

// Keeps the open-person handler inside the roster context.
function Opener({ setScope, children }: { setScope: (s: PanelPerson[] | null) => void; children: React.ReactNode }) {
  const { open } = useRoster();
  const handler = useCallback(
    (person: PanelPerson, scope: PanelPerson[], from: HTMLElement | null) => {
      setScope(scope.some((p) => p.slug === person.slug) && scope.length > 0 ? scope : null);
      open(person.slug, "list", from);
    },
    [open, setScope],
  );
  return <OpenProvider value={handler}>{children}</OpenProvider>;
}

export function SquadSheet({
  people,
  panelName,
  initial,
}: {
  people: PanelPerson[];
  panelName: string;
  initial: { tier: TierFilter; q: string; view: RosterView; sort: RosterSort; sport: string; person: string | null };
}) {
  const [tier, setTier] = useState<TierFilter>(initial.tier);
  const [query, setQuery] = useState(initial.q);
  const [view, setView] = useState<RosterView>(initial.view);
  const [sort, setSort] = useState<RosterSort>(initial.sort);
  const [dir, setDir] = useState<1 | -1>(1);
  const [sport, setSport] = useState(initial.sport);
  const [scope, setScope] = useState<PanelPerson[] | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const advisor = people.find((p) => p.tier === "advisor");
  const executives = people.filter((p) => p.tier === "executive");
  const committee = people.filter((p) => p.tier === "sub-executive");
  const counts = useMemo(() => {
    const out = { all: people.length } as Record<TierFilter, number>;
    for (const t of TIER_KEYS) out[t] = people.filter((p) => p.tier === t).length;
    return out;
  }, [people]);
  const sports = useMemo(() => Array.from(new Set(people.map((p) => p.sport).filter(Boolean) as string[])).sort(), [people]);
  const showDept = people.some((p) => p.department);
  const byslug = useMemo(() => new Map(people.map((p) => [p.slug, p])), [people]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = people.filter((p) => (tier === "all" || p.tier === tier) && (!sport || p.sport === sport) && (!q || search(p).includes(q)));
    const cmp = (a: PanelPerson, b: PanelPerson) =>
      sort === "tier" ? TIER_RANK[a.tier] - TIER_RANK[b.tier] || a.name.localeCompare(b.name) : sort === "department" ? (a.department ?? "~").localeCompare(b.department ?? "~") || a.name.localeCompare(b.name) : a.name.localeCompare(b.name);
    return [...list].sort((a, b) => cmp(a, b) * dir);
  }, [people, tier, sport, query, sort, dir]);

  // Filters live in the URL (?tier=general&q=rafi&view=list), without reloading the page.
  useEffect(() => {
    const url = new URL(window.location.href);
    const set = (k: string, v: string, def: string) => (v && v !== def ? url.searchParams.set(k, v) : url.searchParams.delete(k));
    set("tier", tier, "all");
    set("q", query.trim(), "");
    set("view", view, "faces");
    set("sort", sort, "az");
    set("sport", sport, "");
    window.history.replaceState(window.history.state, "", url);
  }, [tier, query, view, sort, sport]);

  const pickTier = (t: TierFilter, scroll = true) => {
    setTier(t);
    if (scroll) document.getElementById("roster")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };
  const pickSort = (s: RosterSort) => {
    if (s === sort) setDir((d) => (d === 1 ? -1 : 1));
    else {
      setSort(s);
      setDir(1);
    }
  };

  // "/" focuses search; 1-5 switch tiers (not while typing or with a profile open).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || typingIn(e.target)) return;
      if (document.querySelector("[aria-labelledby='profile-name']")) return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= TIER_FILTERS.length) {
        e.preventDefault();
        pickTier(TIER_FILTERS[n - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const drawerPeople = (scope ?? people).map(toSheet);
  const students = people.filter((p) => p.tier !== "advisor").length;

  return (
    <div className={cn(anton.variable, "overflow-x-clip")}>
      <RosterProvider people={drawerPeople} initialPlayer={initial.person} param="person">
        <Opener setScope={setScope}>
          <Hero panelName={panelName} counts={counts} students={students} advisors={counts.advisor} tier={tier} onTier={pickTier} />
          <Formation advisor={advisor} executives={executives} />
          <Committee people={committee} />
          <Roster
            ref={searchRef}
            people={shown}
            total={people.length}
            query={query}
            onQuery={setQuery}
            tier={tier}
            onTier={(t) => pickTier(t, false)}
            sport={sport}
            sports={sports}
            onSport={setSport}
            sort={sort}
            dir={dir}
            onSort={pickSort}
            view={view}
            onView={setView}
            showDept={showDept}
          />
        </Opener>
        <Drawer byslug={byslug} />
      </RosterProvider>

      {/* Want to help run the club? */}
      <section aria-labelledby="elections-heading" className="mx-auto mt-28 max-w-[1280px] px-4 pb-24 md:px-6 lg:px-8">
        <div className="grid gap-8 border-t border-white/10 pt-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h2 id="elections-heading" className={cn(ANTON, "text-[40px] !leading-[0.95] text-[#f5f1e8] md:text-[56px]")}>
              Want to help run the club?
            </h2>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-[#f5f1e8]/70">Panel elections are held every year. Ask the current panel how nominations work and what each role involves.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Magnetic>
              <Link href="/contact?topic=other&to=Panel" data-haptic className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-[#3fcfca] px-6 text-[16px] font-semibold text-[#002e2c] transition hover:brightness-110">
                Ask how nominations work
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Link href="/alumni" className="group inline-flex min-h-[52px] items-center gap-2 rounded-full border border-white/20 px-5 text-[16px] font-semibold text-[#f5f1e8] transition hover:border-white/40 hover:bg-white/5">
              See past panels
              <Baton className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
