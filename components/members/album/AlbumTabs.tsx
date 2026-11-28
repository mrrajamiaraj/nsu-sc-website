"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ALBUM_PAGES, type AlbumPage } from "@/lib/members-sheet";
import { cn } from "@/lib/utils";

export const pageId = (key: AlbumPage) => `page-${key}`;

// Index tabs sticking out of the binder, under the site header. The page in view is raised
// with a teal edge; a click turns to it. No counts.
export function AlbumTabs({ pages }: { pages: AlbumPage[] }) {
  const reduce = Boolean(useReducedMotion());
  const [active, setActive] = useState<AlbumPage>(pages[0] ?? "leadership");

  useEffect(() => {
    const onScroll = () => {
      let current = pages[0];
      for (const key of pages) {
        const el = document.getElementById(pageId(key));
        if (el && el.getBoundingClientRect().top <= 200) current = key;
      }
      if (current) setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pages]);

  return (
    <nav aria-label="Album pages" className="sticky top-[84px] z-30 -mx-4 bg-[#0b2524] px-4 pt-2 md:mx-0 md:px-0">
      <ul className="no-scrollbar flex items-end gap-1.5 overflow-x-auto border-b-2 border-[#f5f1e8]/15">
        {ALBUM_PAGES.filter((p) => pages.includes(p.key)).map((p) => {
          const on = active === p.key;
          return (
            <li key={p.key} className="shrink-0">
              <a
                href={`#${pageId(p.key)}`}
                aria-current={on ? "location" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(pageId(p.key))?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
                  setActive(p.key);
                }}
                className={cn(
                  "relative flex min-h-[42px] items-center rounded-t-[10px] border border-b-0 px-4 text-[13px] font-bold uppercase tracking-[0.14em] transition-[transform,background-color,color,border-color] duration-200",
                  on
                    ? "-translate-y-1 border-[#3fcfca]/70 bg-[#0f2724] text-[#f5f1e8] shadow-[0_-3px_0_0_#3fcfca_inset]"
                    : "border-[#f5f1e8]/15 bg-[#0b2524]/95 text-[#f5f1e8]/60 hover:-translate-y-0.5 hover:text-[#f5f1e8]",
                )}
              >
                {p.title}
                {on && <motion.span layoutId="album-tab" aria-hidden className="absolute inset-x-0 top-0 h-[3px] rounded-t-[10px] bg-[#3fcfca]" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }} />}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
