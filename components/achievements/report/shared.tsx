"use client";

import Link from "next/link";
import { createContext, useContext, type MouseEvent, type ReactNode } from "react";
import type { ReportLink } from "@/lib/report";

// Anton display lettering. `!` beats the site-wide `.site-type h1/h2` heading rule.
export const ANTON = "![font-family:var(--font-anton),Impact,sans-serif] !font-normal uppercase !tracking-[0.005em]";

export const EASE = [0.22, 0.7, 0.25, 1] as const;

type ReportNav = {
  mode: "page" | "overlay";
  /** Overlay only: show another achievement in place instead of loading its page. */
  onGo?: (id: string) => void;
};

const Ctx = createContext<ReportNav>({ mode: "page" });
export const ReportNavProvider = Ctx.Provider;
export const useReportNav = () => useContext(Ctx);

// A link to another achievement: a normal page link, or (in the overlay) swaps the story.
export function AchievementLink({ to, className, children, onClick, ...rest }: { to: ReportLink; className?: string; children: ReactNode; onClick?: (e: MouseEvent<HTMLAnchorElement>) => void } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  const { onGo } = useReportNav();
  return (
    <Link
      href={to.href}
      className={className}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || !onGo || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onGo(to.id);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}

export const initials = (name: string) =>
  name
    .replace(/[^A-Za-z0-9' ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// Keys typed into a field never drive the page.
export const typingIn = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
