"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlumniDrawer } from "@/components/alumni/relay/AlumniDrawer";
import { Directory } from "@/components/alumni/relay/Directory";
import { EraScrubber } from "@/components/alumni/relay/EraScrubber";
import { NowStrip, RelayHero } from "@/components/alumni/relay/Hero";
import { PanelView, type OpenPerson } from "@/components/alumni/relay/PanelView";
import { UpdateForm } from "@/components/alumni/relay/UpdateForm";
import type { RelayPanel, RelayPerson } from "@/lib/alumni-relay";

type View = "panel" | "all";

// "The relay": hero, era scrubber, then one panel (or everyone), the profile drawer and the
// update form. The panel, view and open profile live in the URL so any of them can be shared.
export function RelayPage({
  panels,
  people: peopleCount,
  founded,
  email,
  initial,
}: {
  panels: RelayPanel[]; // newest first
  people: number;
  founded: number;
  email: string;
  initial: { panel: string; view: View; person: string | null };
}) {
  const [view, setView] = useState<View>(initial.view);
  const [panel, setPanel] = useState(initial.panel);
  const [dir, setDir] = useState(1);
  const [person, setPerson] = useState<{ slug: string; from: string } | null>(initial.person ? { slug: initial.person, from: "url" } : null);
  const [announce, setAnnounce] = useState("");
  const opener = useRef<HTMLElement | null>(null);
  const touched = useRef(false);
  const top = useRef<HTMLDivElement>(null);

  const everyone = useMemo(() => panels.flatMap((p) => [...p.executives, ...p.subExecutives]), [panels]);
  const withNow = everyone.filter((p) => p.now);
  const current = panels.find((p) => p.slug === panel) ?? panels[0];
  const age = (slug: string) => panels.findIndex((p) => p.slug === slug); // 0 = newest
  const open = person ? everyone.find((p) => p.slug === person.slug) ?? null : null;
  const openPanel = open ? (panels.find((p) => p.slug === open.panel) ?? null) : null;

  // ---- URL
  useEffect(() => {
    if (!touched.current) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("panel");
    url.searchParams.delete("view");
    url.searchParams.delete("person");
    if (view === "all") url.searchParams.set("view", "all");
    else url.searchParams.set("panel", panel);
    if (person) url.searchParams.set("person", person.slug);
    window.history.replaceState(window.history.state, "", url);
  }, [view, panel, person]);

  const choosePanel = useCallback(
    (slug: string) => {
      touched.current = true;
      if (slug !== panel) setDir(age(slug) < age(panel) ? 1 : -1); // newer runs in from the right
      setPanel(slug);
      setView("panel");
      const p = panels.find((x) => x.slug === slug);
      if (p) setAnnounce(`Showing Panel ${p.label}, ${p.executives.length + p.subExecutives.length} members`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [panel, panels],
  );
  const showAll = () => {
    touched.current = true;
    setView((v) => (v === "all" ? "panel" : "all"));
    setAnnounce(view === "all" ? `Showing Panel ${current.label}` : `Showing all ${everyone.length} alumni`);
  };
  const jumpToRelay = () => top.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const onOpen: OpenPerson = (p, from, el) => {
    touched.current = true;
    opener.current = el;
    setPerson({ slug: p.slug, from });
  };
  const close = () => {
    touched.current = true;
    setPerson(null);
    const el = opener.current;
    window.setTimeout(() => el?.focus({ preventScroll: true }), 0);
  };
  const step = (by: number) => {
    if (!open || !openPanel) return;
    const list = [...openPanel.executives, ...openPanel.subExecutives];
    const i = list.findIndex((p) => p.id === open.id);
    const next: RelayPerson = list[(i + by + list.length) % list.length];
    touched.current = true;
    setPerson({ slug: next.slug, from: "step" });
  };

  // ←/→ walk the relay (the line-up, scrubber and drawer handle their own arrows).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (view !== "panel" || person) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [role='radiogroup'], [role='dialog']")) return;
      const i = age(panel) + (e.key === "ArrowRight" ? -1 : 1); // right = later in time
      if (i < 0 || i >= panels.length) return;
      e.preventDefault();
      choosePanel(panels[i].slug);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, person, panel, choosePanel]);

  const i = age(current.slug);
  return (
    <>
      <RelayHero people={peopleCount} panels={panels.length} now={withNow.length} onAll={showAll} onPanels={jumpToRelay} />
      <NowStrip people={withNow} onOpen={onOpen} />

      <div ref={top} className="scroll-mt-20">
        <EraScrubber panels={panels} founded={founded} active={current.slug} view={view} onPanel={choosePanel} onAll={showAll} />
      </div>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>

      {view === "all" ? (
        <Directory panels={panels} onOpen={onOpen} />
      ) : (
        <PanelView panel={current} newer={i > 0 ? panels[i - 1] : null} older={i < panels.length - 1 ? panels[i + 1] : null} dir={dir} onPanel={choosePanel} onOpen={onOpen} />
      )}

      <UpdateForm panels={panels} email={email} />

      <AlumniDrawer
        person={open}
        panel={openPanel}
        flyFrom={open && person && (person.from === "lineup" || person.from === "grid") ? `alum-${open.slug}` : undefined}
        onStep={step}
        onClose={close}
      />
    </>
  );
}
