import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ToastProvider } from "@/components/admin/ToastProvider";
import type { ReactNode } from "react";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — middleware already enforces this for /admin/dashboard/**.
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-night-950">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminHeader email={user.email ?? ""} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
