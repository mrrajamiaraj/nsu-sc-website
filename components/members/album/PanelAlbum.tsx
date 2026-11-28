"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";
import { AlbumCard, DISPLAY } from "@/components/members/album/Card";
import { AlbumTabs, pageId } from "@/components/members/album/AlbumTabs";
import { CardDialog } from "@/components/members/album/CardDialog";
import { Closing } from "@/components/members/album/Closing";
import { Cover } from "@/components/members/album/Cover";
import { ALBUM_PAGES, type AlbumPage, type PanelPerson } from "@/lib/members-sheet";
import { cn } from "@/lib/utils";

const matches = (p: PanelPerson, q: string) =>
  [p.name, p.role ?? "", p.tier === "advisor" ? "faculty advisor" : "", ...p.squads.map((s) => s.sport), p.department ?? ""].some((t) => t.toLowerCase().includes(q));

// Keep ?member=<slug> in the address bar so an open card can be shared.
function setMemberParam(slug: string | null) {
  const url = new URL(window.location.href);
  url.searchParams.delete("person");
  if (slug) url.searchParams.set("member", slug);
  else url.searchParams.delete("member");
  window.history.replaceState(window.history.state, "", url.toString());
}

/** "The Panel Album": cover, index tabs, one album page per tier, and the opened card. */
export function PanelAlbum({ people, year, initialMember }: { people: PanelPerson[]; year: string | null; initialMember: string | null }) {
  const reduce = Boolean(useReducedMotion());
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<{ slug: string; fromAlbum: boolean } | null>(initialMember ? { slug: initialMember, fromAlbum: false } : null);
  const bySlug = useMemo(() => new Map(people.map((p) => [p.slug, p])), [people]);
  const pages = useMemo(
    () => ALBUM_PAGES.map((page) => ({ ...page, people: people.filter((p) => p.page === page.key) })).filter((page) => page.people.length > 0),
    [people],
  );
  const leadership = pages.find((p) => p.key === "leadership")?.people ?? [];

  const q = query.trim().toLowerCase();
  const found = useMemo(() => (q ? people.filter((p) => matches(p, q)) : []), [people, q]);
  const foundSet = useMemo(() => new Set(found.map((p) => p.slug)), [found]);

  // The album turns to the first match while typing.
  useEffect(() => {
    if (q.length < 2 || !found[0]) return;
    const t = window.setTimeout(() => {
      document.querySelector(`[data-slug="${found[0].slug}"]`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }, 450);
    return () => window.clearTimeout(t);
  }, [q, found, reduce]);

  const openCard = useCallback((person: PanelPerson, fromAlbum: boolean) => {
    setOpen({ slug: person.slug, fromAlbum });
    setMemberParam(person.slug);
  }, []);

  const close = useCallback(() => {
    const back = open?.slug ?? null;
    setOpen(null);
    setMemberParam(null);
    // Focus returns to the card the visitor opened, once it's back in its slot.
    window.setTimeout(() => document.querySelector<HTMLElement>(`[data-slug="${back}"]`)?.focus({ preventScroll: true }), 450);
  }, [open]);

  const current = open ? bySlug.get(open.slug) : undefined;
  const scope = current ? (pages.find((p) => p.key === current.page)?.people ?? []) : [];

  return (
    <LayoutGroup>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8">
        <Cover
          year={year}
          leadership={leadership}
          query={query}
          onQuery={setQuery}
          onEnter={() => found.length === 1 && openCard(found[0], true)}
          noMatch={q.length > 0 && found.length === 0}
          onFan={() => document.getElementById(pageId("leadership"))?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })}
        />

        <AlbumTabs pages={pages.map((p) => p.key as AlbumPage)} />

        <div className="mt-8 space-y-10 pb-4">
          {pages.map((page) => (
            <section
              key={page.key}
              id={pageId(page.key)}
              aria-labelledby={`${pageId(page.key)}-title`}
              className="relative scroll-mt-[150px] rounded-[20px] border border-[#f5f1e8]/10 bg-[#0f2724] px-4 pb-10 pt-8 shadow-[inset_0_0_0_6px_rgba(245,241,232,0.025)] sm:px-6 md:px-10 md:pt-10"
            >
              {/* The album's centre gutter. */}
              <span aria-hidden className="pointer-events-none absolute bottom-6 left-1/2 top-6 hidden w-px bg-gradient-to-b from-transparent via-black/40 to-transparent shadow-[1px_0_0_rgba(245,241,232,0.04)] md:block" />
              <header className="relative">
                <h2 id={`${pageId(page.key)}-title`} className={cn(DISPLAY, "!text-[36px] !font-extrabold uppercase !leading-none text-[#f5f1e8] md:!text-[44px]")}>
                  {page.title}
                </h2>
                <p className="mt-2 text-[16px] text-[#f5f1e8]/65">{page.intro}</p>
              </header>
              <ul
                className={cn(
                  "relative mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 md:gap-y-12",
                  page.key === "leadership" ? "lg:grid-cols-5 lg:gap-x-5" : "lg:grid-cols-4 lg:gap-x-8",
                )}
              >
                {page.people.map((p, i) => (
                  <li key={p.id}>
                    <AlbumCard
                      person={p}
                      index={i}
                      open={open?.slug === p.slug}
                      state={!q ? "plain" : foundSet.has(p.slug) ? "match" : "dim"}
                      onOpen={(person) => openCard(person, true)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <Closing />
      </div>

      <AnimatePresence>
        {current && (
          <CardDialog
            key="album-dialog"
            person={current}
            scope={scope}
            fromAlbum={open?.fromAlbum ?? false}
            onGo={(next) => {
              setOpen({ slug: next.slug, fromAlbum: false });
              setMemberParam(next.slug);
            }}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
