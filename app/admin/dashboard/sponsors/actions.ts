"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { uploadImage } from "@/lib/storage";
import { sponsorSchema } from "@/lib/validation/sponsors";

function revalidateSponsorPaths() {
  revalidatePath("/admin/dashboard/sponsors");
  revalidatePath("/about");
  revalidatePath("/");
}

export async function createSponsor(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = sponsorSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();

  let logo: string | null = null;
  const file = formData.get("logo") as File | null;
  if (file && file.size > 0) {
    try {
      logo = await uploadImage("sponsors", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { data, error } = await supabase.from("sponsors").insert({ name: parsed.data.name, logo }).select("id").single();
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "CREATE_SPONSOR", targetTable: "sponsors", targetId: data.id });
  revalidateSponsorPaths();
  redirect("/admin/dashboard/sponsors");
}

export async function updateSponsor(id: string, _prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = sponsorSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const updates: Record<string, unknown> = { name: parsed.data.name };

  const file = formData.get("logo") as File | null;
  if (file && file.size > 0) {
    try {
      updates.logo = await uploadImage("sponsors", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { error } = await supabase.from("sponsors").update(updates).eq("id", id);
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "UPDATE_SPONSOR", targetTable: "sponsors", targetId: id });
  revalidateSponsorPaths();
  redirect("/admin/dashboard/sponsors");
}

export async function deleteSponsor(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sponsors").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, { action: "DELETE_SPONSOR", targetTable: "sponsors", targetId: id });
  revalidateSponsorPaths();
}
