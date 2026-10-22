"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
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
  Users,
  X,
} from "lucide-react";
import { ClubMark } from "@/components/layout/ClubMark";
import { NavIconLink } from "@/components/layout/NavIconLink";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: House },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/teams", label: "Teams", icon: Shield },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/alumni", label: "Alumni", icon: GraduationCap },
  { href: "/members", label: "Members", icon: Users },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/contact", label: "Contact", icon: Mail },
];

const ADMIN_LINK = { href: "/admin/login", label: "Admin login", icon: LogIn };

function isActiveHref(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar({ logoUrl }: { logoUrl?: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="nav-shell mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-white">
          <ClubMark logoUrl={logoUrl} priority />
          <span className="hidden sm:inline md:hidden lg:inline">NSU Games and Sports Club</span>
        </Link>

        {/* Icon-only links; the name shows as a tooltip on hover/focus and is read by screen readers. */}
        <nav aria-label="Main" className="hidden items-center gap-2 md:flex lg:gap-4 xl:gap-5">
          {NAV_LINKS.map((link) => (
            <NavIconLink key={link.href} {...link} active={isActiveHref(pathname, link.href)} />
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <NavIconLink {...ADMIN_LINK} className="ring-1 ring-inset ring-white/15" />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-white/5 hover:text-white md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mx-auto mt-2 max-w-6xl origin-top rounded-3xl border border-white/10 bg-night-900/60 p-4 shadow-panel backdrop-blur-md md:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = isActiveHref(pathname, link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition hover:bg-white/5 hover:text-white active:scale-[0.98] active:bg-white/10 motion-reduce:active:scale-100",
                      active ? "bg-white/5 text-white" : "text-slate-300",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-transform duration-200 group-hover:scale-125 group-active:scale-90 motion-reduce:transform-none",
                        active ? "text-blue-400" : "text-slate-400 group-hover:text-blue-300",
                      )}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <Link
              href={ADMIN_LINK.href}
              onClick={() => setOpen(false)}
              className="group mt-3 flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white active:scale-[0.98] active:bg-white/10 motion-reduce:active:scale-100"
            >
              <LogIn className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-blue-300 group-active:scale-90 motion-reduce:transform-none" />
              {ADMIN_LINK.label}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
