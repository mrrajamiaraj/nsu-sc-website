"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";

export async function updateContactContent(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const address = (formData.get("address") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const hours = (formData.get("hours") as string)?.trim();

  if (!address) return { error: "Address is required." };
  if (!phone) return { error: "Phone is required." };
  if (!email) return { error: "Email is required." };
  if (!hours) return { error: "Office hours are required." };

  const supabase = await createClient();

  const updates: [string, string][] = [
    ["contact_address", address],
    ["contact_phone", phone],
    ["contact_email", email],
    ["contact_hours", hours],
  ];

  for (const [pageKey, content] of updates) {
    const { error } = await supabase
      .from("site_content")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("page_key", pageKey);

    if (error) return { error: error.message };
  }

  await logAuditEvent(supabase, { action: "UPDATE_SITE_CONTENT", targetTable: "site_content", targetId: "contact" });
  revalidatePath("/admin/dashboard/contact");
  revalidatePath("/contact");
  return { success: true };
}
