"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { uploadImage } from "@/lib/storage";
import { alumniSchema } from "@/lib/validation/alumni";

function parseForm(formData: FormData) {
  return alumniSchema.safeParse({
    name: formData.get("name"),
    graduationYear: formData.get("graduationYear"),
    tier: formData.get("tier"),
    team: formData.get("team"),
    currentRole: formData.get("currentRole"),
    quote: formData.get("quote") || null,
  });
}

function revalidateAlumniPaths() {
  revalidatePath("/admin/dashboard/alumni");
  revalidatePath("/alumni");
}

export async function createAlumni(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();

  let photo: string | null = null;
  const file = formData.get("photo") as File | null;
  if (file && file.size > 0) {
    try {
      photo = await uploadImage("alumni", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { data, error } = await supabase
    .from("alumni")
    .insert({
      name: parsed.data.name,
      graduation_year: parsed.data.graduationYear,
      tier: parsed.data.tier,
      team: parsed.data.team,
      current_role_title: parsed.data.currentRole,
      quote: parsed.data.quote,
      photo,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "CREATE_ALUMNI", targetTable: "alumni", targetId: data.id });
  revalidateAlumniPaths();
  redirect("/admin/dashboard/alumni");
}

export async function updateAlumni(id: string, _prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const updates: Record<string, unknown> = {
    name: parsed.data.name,
    graduation_year: parsed.data.graduationYear,
    tier: parsed.data.tier,
    team: parsed.data.team,
    current_role_title: parsed.data.currentRole,
    quote: parsed.data.quote,
  };

  const file = formData.get("photo") as File | null;
  if (file && file.size > 0) {
    try {
      updates.photo = await uploadImage("alumni", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { error } = await supabase.from("alumni").update(updates).eq("id", id);
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "UPDATE_ALUMNI", targetTable: "alumni", targetId: id });
  revalidateAlumniPaths();
  redirect("/admin/dashboard/alumni");
}

export async function deleteAlumni(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("alumni").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, { action: "DELETE_ALUMNI", targetTable: "alumni", targetId: id });
  revalidateAlumniPaths();
}
