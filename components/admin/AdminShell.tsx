"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

// Dashboard frame. From md up the sidebar sits beside the content; on phones it
// slides in over the page from the header's menu button.
export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <div className="flex min-h-screen min-h-dvh bg-night-950">
      <AdminSidebar open={menuOpen} />
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-night-950/70 md:hidden"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader email={email} menuOpen={menuOpen} onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
