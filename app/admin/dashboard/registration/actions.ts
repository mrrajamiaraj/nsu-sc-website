"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { registrationSchema } from "@/lib/validation/registration";

export async function updateRegistrationSettings(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const parsed = registrationSchema.safeParse({
    isOpen: formData.get("isOpen") === "true",
    googleFormUrl: formData.get("googleFormUrl") || null,
    nextIntakeDate: formData.get("nextIntakeDate") || null,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("registration_settings")
    .update({
      is_open: parsed.data.isOpen,
      google_form_url: parsed.data.googleFormUrl,
      next_intake_date: parsed.data.nextIntakeDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  await logAuditEvent(supabase, {
    action: "UPDATE_REGISTRATION_SETTINGS",
    targetTable: "registration_settings",
    targetId: "1",
  });
  revalidatePath("/admin/dashboard/registration");
  revalidatePath("/");
  return { success: true };
}
