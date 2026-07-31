"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";

export async function logoutAction() {
  const supabase = await createClient();
  await logAuditEvent(supabase, { action: "LOGOUT" });
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete("admin_last_active");

  redirect("/admin/login");
}
