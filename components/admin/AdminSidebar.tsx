"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCog,
  BookOpen,
  Newspaper,
  GraduationCap,
  Handshake,
  ClipboardList,
  ScrollText,
  Phone,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Home Content", icon: LayoutDashboard, exact: true },
  { href: "/admin/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/admin/dashboard/teams", label: "Teams & Players", icon: Users },
  { href: "/admin/dashboard/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/dashboard/members", label: "Members", icon: UserCog },
  { href: "/admin/dashboard/about", label: "About", icon: BookOpen },
  { href: "/admin/dashboard/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/dashboard/alumni", label: "Alumni", icon: GraduationCap },
  { href: "/admin/dashboard/sponsors", label: "Sponsors", icon: Handshake },
  { href: "/admin/dashboard/contact", label: "Contact", icon: Phone },
  { href: "/admin/dashboard/registration", label: "Registration", icon: ClipboardList },
  { href: "/admin/dashboard/audit-log", label: "Audit Log", icon: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-64 flex-col gap-1 border-r border-white/10 bg-night-900/60 p-4">
      <div className="mb-4 px-2">
        <p className="text-sm font-semibold text-white">NSU SC Admin</p>
        <p className="text-xs text-slate-500">Content Dashboard</p>
      </div>

      {NAV_ITEMS.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              isActive ? "bg-brand-gradient text-night-950 font-semibold" : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
