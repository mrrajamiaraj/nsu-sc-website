"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { SheetPerson } from "@/lib/team-sheet";

export type Origin = "hero" | "card" | "list" | "staff" | "url";

type RosterState = {
  /** Everyone the drawer can cycle through: players in team-sheet order, then staff. */
  people: SheetPerson[];
  current: SheetPerson | null;
  origin: { slug: string; from: Origin } | null;
  open: (slug: string, from: Origin, opener?: HTMLElement | null) => void;
  step: (by: number) => void;
  close: () => void;
};

const Ctx = createContext<RosterState | null>(null);

export function useRoster() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRoster outside RosterProvider");
  return ctx;
}

// Which profile is open lives in the URL (?player=<slug>) so a profile can be shared.
export function RosterProvider({
  people,
  initialPlayer,
  param = "player",
  children,
}: {
  people: SheetPerson[];
  initialPlayer: string | null;
  /** Query parameter that holds the open profile ("player" on squads, "person" on Members). */
  param?: string;
  children: ReactNode;
}) {
  const [slug, setSlug] = useState<string | null>(initialPlayer && people.some((p) => p.slug === initialPlayer) ? initialPlayer : null);
  const [origin, setOrigin] = useState<RosterState["origin"]>(slug ? { slug, from: "url" } : null);
  const opener = useRef<HTMLElement | null>(null);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current) return;
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set(param, slug);
    else url.searchParams.delete(param);
    window.history.replaceState(window.history.state, "", url);
  }, [slug, param]);

  const open = useCallback((next: string, from: Origin, el?: HTMLElement | null) => {
    touched.current = true;
    opener.current = el ?? (document.activeElement as HTMLElement | null);
    setOrigin({ slug: next, from });
    setSlug(next);
  }, []);

  const step = useCallback(
    (by: number) => {
      touched.current = true;
      setSlug((cur) => {
        const i = people.findIndex((p) => p.slug === cur);
        if (i < 0) return cur;
        return people[(i + by + people.length) % people.length].slug;
      });
    },
    [people],
  );

  const close = useCallback(() => {
    touched.current = true;
    setSlug(null);
    // Back to whatever opened the profile.
    const el = opener.current;
    window.setTimeout(() => el?.focus({ preventScroll: true }), 0);
  }, []);

  const value = useMemo(
    () => ({ people, current: people.find((p) => p.slug === slug) ?? null, origin, open, step, close }),
    [people, slug, origin, open, step, close],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
