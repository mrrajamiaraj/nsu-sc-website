"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

const INACTIVITY_COOKIE = "admin_last_active";

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  // FR-21: 5 failed attempts -> 15-minute lockout.
  const { data: lockoutRows } = await supabase.rpc("admin_check_lockout");
  const lockedUntil = lockoutRows?.[0]?.locked_until as string | null | undefined;
  if (lockedUntil && new Date(lockedUntil) > new Date()) {
    const minutes = Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 60000);
    return { error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  await supabase.rpc("admin_record_login_result", { p_success: !error, p_actor_label: email });

  if (error) {
    return { error: "Invalid email or password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(INACTIVITY_COOKIE, String(Date.now()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60,
    path: "/",
  });

  redirect("/admin/dashboard");
}
