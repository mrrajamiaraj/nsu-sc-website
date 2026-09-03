"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { uploadImage } from "@/lib/storage";
import { alumniClassYearSchema, alumniSchema } from "@/lib/validation/alumni";

function parseForm(formData: FormData) {
  return alumniSchema.safeParse({
    name: formData.get("name"),
    classYearId: formData.get("classYearId"),
    tier: formData.get("tier"),
    team: formData.get("team"),
    currentRole: formData.get("currentRole"),
    quote: formData.get("quote") || null,
  });
}

function revalidateAlumniPaths() {
  revalidatePath("/admin/dashboard/alumni");
  revalidatePath("/admin/dashboard/alumni/class-years");
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
      class_year_id: parsed.data.classYearId,
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
    class_year_id: parsed.data.classYearId,
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

export async function createClassYear(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = alumniClassYearSchema.safeParse({ label: formData.get("label") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const { count } = await supabase.from("alumni_class_years").select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("alumni_class_years")
    .insert({ label: parsed.data.label, sort_order: count ?? 0 })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logAuditEvent(supabase, {
    action: "CREATE_ALUMNI_CLASS_YEAR",
    targetTable: "alumni_class_years",
    targetId: data.id,
  });
  revalidateAlumniPaths();
  redirect("/admin/dashboard/alumni/class-years");
}

export async function updateClassYear(id: string, _prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = alumniClassYearSchema.safeParse({ label: formData.get("label") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const { error } = await supabase.from("alumni_class_years").update({ label: parsed.data.label }).eq("id", id);
  if (error) return { error: error.message };

  await logAuditEvent(supabase, {
    action: "UPDATE_ALUMNI_CLASS_YEAR",
    targetTable: "alumni_class_years",
    targetId: id,
  });
  revalidateAlumniPaths();
  redirect("/admin/dashboard/alumni/class-years");
}

export async function deleteClassYear(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("alumni_class_years").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new Error("This class year still has alumni assigned to it. Reassign or delete them first.");
    }
    throw new Error(error.message);
  }

  await logAuditEvent(supabase, {
    action: "DELETE_ALUMNI_CLASS_YEAR",
    targetTable: "alumni_class_years",
    targetId: id,
  });
  revalidateAlumniPaths();
}

export async function reorderClassYears(orderedIds: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_alumni_class_years", { p_ordered_ids: orderedIds });
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, {
    action: "REORDER_ALUMNI_CLASS_YEARS",
    targetTable: "alumni_class_years",
    targetId: orderedIds[0],
  });
  revalidateAlumniPaths();
}
