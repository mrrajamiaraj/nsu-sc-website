"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About Us" },
  { href: "/teams", label: "Teams" },
  { href: "/alumni", label: "Alumni" },
  { href: "/members", label: "Members" },
  { href: "/blog", label: "Blog" },
];

function isActiveHref(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="nav-shell mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold tracking-tight text-night-950">
            NSU
          </span>
          <span className="hidden sm:inline">NSU Games and Sports Club</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = isActiveHref(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-3 py-2 text-sm font-medium transition-colors hover:text-white",
                  active ? "text-white" : "text-slate-300",
                )}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-active-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-gradient"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button href="/#register" size="sm">
            Register
          </Button>
        </div>

        <button
          type="button"
          className="rounded-full p-2 text-slate-300 hover:text-white lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mx-auto mt-2 max-w-6xl origin-top rounded-3xl border border-white/10 bg-night-900/60 p-4 shadow-panel backdrop-blur-md lg:hidden"
          >
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = isActiveHref(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white",
                      active ? "bg-white/5 text-white" : "text-slate-300",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <Button href="/#register" className="mt-3 w-full" onClick={() => setOpen(false)}>
              Register
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
