"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  House,
  Info,
  LogIn,
  Mail,
  Menu,
  Newspaper,
  Shield,
  Trophy,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { ClubMark } from "@/components/layout/ClubMark";
import { NavIconLink } from "@/components/layout/NavIconLink";
import { cn } from "@/lib/utils";

// Every page, shown as an animated icon in the desktop bar and as a labelled row in the mobile menu.
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

// How far the homepage scrolls (px) before the header's glass pill fades in.
const SCROLL_THRESHOLD = 48;

// Frosted glass, like the header bar itself.
const glassPanel = "rounded-2xl border border-white/15 bg-night-900/60 shadow-panel backdrop-blur-xl";

// `joinUrl` is the club sign-up form, set only while sign-ups are open; then
// "Join the club" is the strongest thing in the header.
export function Navbar({ logoUrl, joinUrl }: { logoUrl?: string | null; joinUrl: string | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const isHome = pathname === "/";
  // Pages in the homepage's deep-teal style start with a clear bar that turns to glass on scroll.
  const isContact = pathname === "/contact";
  const clearAtTop = isHome || isContact || pathname === "/about" || pathname.startsWith("/achievements");
  // Contact page: the bar hides while scrolling down, returns on scroll up, turns solid after
  // the hero, and its teal underline follows the hovered icon.
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hoverHref, setHoverHref] = useState<string | null>(null);

  useDismiss(menuOpen, () => setMenuOpen(false), headerRef);

  // Navigating closes whatever was open.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // On the homepage (and Contact) the bar starts clear and its glass fades in once the
  // visitor has scrolled a little. Other pages always show the glass.
  useEffect(() => {
    if (!clearAtTop) {
      setScrolled(false);
      return;
    }
    const update = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    update(); // a reload can restore a scrolled position
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [clearAtTop]);

  useEffect(() => {
    if (!isContact) {
      setHidden(false);
      setSolid(false);
      return;
    }
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 320);
      if (y < 120 || y < last - 6) setHidden(false);
      else if (y > last + 6) setHidden(true);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isContact]);

  const showGlass = !clearAtTop || scrolled || menuOpen;
  const activeHref = [HOME, ...PRIMARY, ...MORE].find((link) => isActive(pathname, link.href))?.href ?? null;

  return (
    <header
      ref={headerRef}
      onFocusCapture={() => setHidden(false)}
      className={cn(
        "fixed inset-x-0 top-4 z-50 px-4 transition-transform duration-300 ease-out motion-reduce:transition-none",
        hidden && !menuOpen && "-translate-y-[140%]",
      )}
    >
      <div className="relative isolate mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2 sm:px-5">
        {/* The frosted-glass pill sits on its own layer, so fading it never moves the links. */}
        <span
          aria-hidden
          className={cn(
            // Homepage: the dark-teal glass, fading over 220ms. Other pages keep the standard bar glass.
            clearAtTop ? "nav-glass-teal" : "nav-shell",
            solid && "nav-solid",
            "pointer-events-none absolute inset-0 -z-10 transition-opacity duration-[220ms] ease-out motion-reduce:transition-none",
            showGlass ? "opacity-100" : "opacity-0",
          )}
        />
        <Link href="/" className="flex min-w-0 items-center gap-2.5 text-sm font-bold text-white lg:shrink-0">
          <ClubMark logoUrl={logoUrl} priority />
          {/* Wraps to two lines on the narrowest phones rather than being cut off. */}
          <span className="min-w-0 text-[13px] leading-tight sm:text-sm lg:whitespace-nowrap">NSU Games &amp; Sports Club</span>
        </Link>

        {/* Desktop: every page as an animated icon (its name in a tooltip), Admin login, then Join. */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex xl:gap-1.5" onPointerLeave={() => setHoverHref(null)}>
          {[HOME, ...PRIMARY, ...MORE].map((link) => (
            <NavIconLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={isActive(pathname, link.href)}
              underline={isContact ? (hoverHref ?? activeHref) === link.href : undefined}
              onHover={isContact ? () => setHoverHref(link.href) : undefined}
            />
          ))}
          <span aria-hidden className="mx-1 h-6 w-px bg-white/15" />
          <NavIconLink href={ADMIN.href} label={ADMIN.label} icon={ADMIN.icon} className="ring-1 ring-inset ring-white/15" />

          {/* Join the club: the same icon design as the others (white, outlined like Admin login,
              glows on hover and click). While sign-ups are closed it leads to how to join instead. */}
          {joinUrl ? (
            <NavIconLink
              href={joinUrl}
              label="Join the club"
              icon={UserPlus}
              external
              className="ml-1 text-white ring-1 ring-inset ring-white/15"
            />
          ) : (
            <NavIconLink href="/#register" label="How to join" icon={UserPlus} className="ml-1 text-white ring-1 ring-inset ring-white/15" />
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
