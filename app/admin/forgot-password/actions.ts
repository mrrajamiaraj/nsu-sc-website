"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema } from "@/lib/validation/auth";

export async function requestPasswordResetAction(
  _prevState: { message?: string; error?: string } | undefined,
  formData: FormData,
) {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/confirm?next=/admin/reset-password`,
  });

  // UC-14 A1: same generic message regardless of whether the email exists — no enumeration.
  return { message: "If an account exists for that email, a password reset link has been sent." };
}
