"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  House,
  Info,
  LogIn,
  Mail,
  Menu,
  Newspaper,
  Shield,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { ClubMark } from "@/components/layout/ClubMark";
import { NavIconLink } from "@/components/layout/NavIconLink";
import { GlassPill, NavTextLink, glassItem } from "@/components/layout/NavTextLink";
import { cn } from "@/lib/utils";

// Shown as glass text pills on desktop, after the Home icon. The rest sit under "More".
const PRIMARY = [
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/teams", label: "Teams", icon: Shield },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/about", label: "About", icon: Info },
];
const MORE = [
  { href: "/alumni", label: "Alumni", icon: GraduationCap },
  { href: "/members", label: "Members", icon: Users },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/contact", label: "Contact", icon: Mail },
];
const HOME = { href: "/", label: "Home", icon: House };
const ADMIN = { href: "/admin/login", label: "Admin login", icon: LogIn };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Closes a popover on Escape or a click outside it.
function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    const onClick = (event: MouseEvent) => ref.current && !ref.current.contains(event.target as Node) && close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open, close, ref]);
}

const joinButton =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-night-950 shadow-glow transition hover:brightness-110 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-night-950";

// Frosted glass, like the header bar itself.
const glassPanel = "rounded-2xl border border-white/15 bg-night-900/60 shadow-panel backdrop-blur-xl";

// `joinUrl` is the club sign-up form, set only while sign-ups are open; then
// "Join the club" is the strongest thing in the header.
export function Navbar({ logoUrl, joinUrl }: { logoUrl?: string | null; joinUrl: string | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useDismiss(moreOpen, () => setMoreOpen(false), moreRef);
  useDismiss(menuOpen, () => setMenuOpen(false), headerRef);

  // Navigating closes whatever was open.
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  const moreActive = MORE.some((link) => isActive(pathname, link.href));

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-4 z-50 px-4">
      {/* The site's frosted-glass bar on every page, including over the homepage photo. */}
      <div className="nav-shell mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2 sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 text-sm font-bold text-white">
          <ClubMark logoUrl={logoUrl} priority />
          {/* Wraps to two lines on the narrowest phones rather than being cut off. */}
          <span className="min-w-0 text-[13px] leading-tight sm:text-sm">NSU Games &amp; Sports Club</span>
        </Link>

        {/* Desktop: the Home icon, then glass text pills, the rest under More, Join last. */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          <NavIconLink href={HOME.href} label={HOME.label} icon={HOME.icon} active={pathname === "/"} />
          {PRIMARY.map((link) => (
            <NavTextLink key={link.href} href={link.href} label={link.label} active={isActive(pathname, link.href)} />
          ))}

          <div ref={moreRef} className="relative">
            <motion.button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              aria-expanded={moreOpen}
              aria-controls="nav-more"
              initial="rest"
              animate="rest"
              whileHover="hover"
              whileFocus="hover"
              whileTap="tap"
              className={cn(glassItem, moreActive || moreOpen ? "text-white" : "text-slate-300 hover:text-white")}
            >
              <GlassPill active={moreActive || moreOpen}>
                <span className="inline-flex items-center gap-1">
                  More
                  <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform", moreOpen && "rotate-180")} />
                </span>
              </GlassPill>
            </motion.button>
            <AnimatePresence>
              {moreOpen && (
                <motion.ul
                  id="nav-more"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className={cn(glassPanel, "absolute right-0 top-full mt-3 w-56 origin-top-right p-1.5")}
                >
                  {[...MORE, ADMIN].map((link) => {
                    const Icon = link.icon;
                    const active = isActive(pathname, link.href);
                    return (
                      <li key={link.href} className={link === ADMIN ? "mt-1 border-t border-white/10 pt-1" : undefined}>
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60",
                            active ? "bg-white/10 text-white" : "text-slate-300",
                          )}
                        >
                          <Icon
                            aria-hidden
                            className={cn(
                              "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                              active ? "text-blue-400" : "text-slate-400 group-hover:text-blue-300",
                            )}
                          />
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {joinUrl ? (
            <a href={joinUrl} target="_blank" rel="noopener noreferrer" className={cn(joinButton, "ml-2")}>
              Join the club
              <ArrowRight aria-hidden className="h-4 w-4" />
            </a>
          ) : (
            <Link
              href="/#register"
              className="ml-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              How to join
            </Link>
          )}
        </nav>

        {/* Phones and tablets: one clearly labelled Menu button. */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 lg:hidden"
        >
          {menuOpen ? <X aria-hidden className="h-4 w-4" /> : <Menu aria-hidden className="h-4 w-4" />}
          Menu
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            // Scrolls inside itself, so every link stays reachable on short (landscape) screens.
            className={cn(glassPanel, "mx-auto mt-2 max-h-[calc(100dvh-6rem)] max-w-6xl overflow-y-auto overscroll-contain p-3 lg:hidden")}
          >
            {joinUrl && (
              <a href={joinUrl} target="_blank" rel="noopener noreferrer" className={cn(joinButton, "mb-2 flex w-full py-3")}>
                Join the club
                <ArrowRight aria-hidden className="h-4 w-4" />
              </a>
            )}
            <nav aria-label="Mobile" className="grid gap-0.5">
              {[HOME, ...PRIMARY, ...MORE].map((link) => {
                const active = isActive(pathname, link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-white/10",
                      active ? "bg-white/10 text-white" : "text-slate-200",
                    )}
                  >
                    <Icon aria-hidden className={cn("h-4 w-4", active ? "text-blue-400" : "text-slate-400 group-hover:text-blue-300")} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            {!joinUrl && (
              <Link href="/#register" className="mt-2 block rounded-xl border border-white/10 px-4 py-3 text-base font-medium text-white">
                How to join
              </Link>
            )}
            <Link
              href={ADMIN.href}
              className="mt-2 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <LogIn aria-hidden className="h-4 w-4" />
              {ADMIN.label}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
