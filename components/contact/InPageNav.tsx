"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NavSection {
  id: string;
  label: string;
}

// Sticky in-page nav under the site header: one chip per section, a teal underline that slides
// to the section in view, and a smooth scroll on click. The site header on this page hides
// while scrolling down, so the nav slides up into its place and back down when it returns.
export function InPageNav({ sections }: { sections: NavSection[] }) {
  const reduce = Boolean(useReducedMotion());
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [headerShown, setHeaderShown] = useState(true);
  const [stuck, setStuck] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const row = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // Same rule as the site header on Contact (components/layout/Navbar.tsx).
      if (y < 120 || y < last - 6) setHeaderShown(true);
      else if (y > last + 6) setHeaderShown(false);
      last = y;
      setStuck((bar.current?.getBoundingClientRect().top ?? 1) <= 96);
      // The active section: the last one whose top has passed a line below the nav.
      let current = sections[0]?.id ?? "";
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 180) current = s.id;
      }
      if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1]?.id ?? current;
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  // Phones: keep the active chip in view in the scrolling row.
  useEffect(() => {
    const chip = row.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    const list = row.current;
    if (!chip || !list || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: chip.offsetLeft - list.clientWidth / 2 + chip.offsetWidth / 2, behavior: reduce ? "auto" : "smooth" });
  }, [active, reduce]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  return (
    <nav
      ref={bar}
      aria-label="On this page"
      className={cn(
        "sticky z-40 border-b transition-[top,background-color,border-color] duration-300 ease-out motion-reduce:transition-none",
        headerShown ? "top-[84px]" : "top-0",
        stuck ? "border-white/10 bg-[#0b2524]/95 backdrop-blur-md" : "border-transparent bg-transparent",
      )}
    >
      <ul ref={row} className="no-scrollbar mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-6 py-1 md:gap-2 lg:px-8">
        {sections.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id} data-id={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={on ? "location" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  go(s.id);
                }}
                className={cn(
                  "relative flex min-h-[44px] items-center px-3 text-[14px] font-semibold transition-colors max-md:my-1 max-md:min-h-[36px] max-md:rounded-full max-md:border md:px-3.5",
                  on ? "text-[#3fcfca] max-md:border-[#3fcfca]/60 max-md:bg-[#3fcfca]/10" : "text-[#f5f1e8]/65 hover:text-[#f5f1e8] max-md:border-white/15",
                )}
              >
                {s.label}
                {on && (
                  <motion.span
                    layoutId="contact-nav-line"
                    aria-hidden
                    className="absolute inset-x-3 bottom-1 hidden h-[2px] rounded-full bg-[#3fcfca] md:block"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
