"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { uploadImage, deleteImage } from "@/lib/storage";
import { achievementSchema } from "@/lib/validation/achievements";

function parseForm(formData: FormData) {
  return achievementSchema.safeParse({
    teamId: formData.get("teamId"),
    title: formData.get("title"),
    description: formData.get("description"),
    date: formData.get("date"),
  });
}

function revalidateAchievementPaths(id?: string) {
  revalidatePath("/admin/dashboard/achievements");
  revalidatePath("/achievements");
  if (id) revalidatePath(`/achievements/${id}`);
}

export async function createAchievement(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();

  let photo: string | null = null;
  const file = formData.get("photo") as File | null;
  if (file && file.size > 0) {
    try {
      photo = await uploadImage("achievements", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { data, error } = await supabase
    .from("achievements")
    .insert({
      // Empty select/date inputs mean "club-wide" / "date unknown".
      team_id: parsed.data.teamId || null,
      title: parsed.data.title,
      description: parsed.data.description,
      date: parsed.data.date || null,
      photo,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "CREATE_ACHIEVEMENT", targetTable: "achievements", targetId: data.id });
  revalidateAchievementPaths(data.id);
  redirect("/admin/dashboard/achievements");
}

export async function updateAchievement(id: string, _prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const updates: Record<string, unknown> = {
    team_id: parsed.data.teamId || null,
    title: parsed.data.title,
    description: parsed.data.description,
    date: parsed.data.date || null,
  };

  const file = formData.get("photo") as File | null;
  if (file && file.size > 0) {
    try {
      updates.photo = await uploadImage("achievements", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { error } = await supabase.from("achievements").update(updates).eq("id", id);
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "UPDATE_ACHIEVEMENT", targetTable: "achievements", targetId: id });
  revalidateAchievementPaths(id);
  redirect("/admin/dashboard/achievements");
}

export async function addAchievementGalleryImage(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return { error: "Choose an image to upload." };

  const supabase = await createClient();

  let url: string;
  try {
    url = await uploadImage("achievements", file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed." };
  }

  const { data: existing } = await supabase.from("achievements").select("gallery").eq("id", id).maybeSingle();
  const gallery = [...((existing?.gallery as string[] | null) ?? []), url];

  const { error } = await supabase.from("achievements").update({ gallery }).eq("id", id);
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "ADD_ACHIEVEMENT_IMAGE", targetTable: "achievements", targetId: id });
  revalidateAchievementPaths(id);
  revalidatePath(`/admin/dashboard/achievements/${id}/edit`);
  return {};
}

export async function removeAchievementGalleryImage(id: string, url: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("achievements").select("gallery").eq("id", id).maybeSingle();
  const gallery = ((existing?.gallery as string[] | null) ?? []).filter((img) => img !== url);

  const { error } = await supabase.from("achievements").update({ gallery }).eq("id", id);
  if (error) throw new Error(error.message);

  await deleteImage(url);
  await logAuditEvent(supabase, { action: "REMOVE_ACHIEVEMENT_IMAGE", targetTable: "achievements", targetId: id });
  revalidateAchievementPaths(id);
  revalidatePath(`/admin/dashboard/achievements/${id}/edit`);
}

export async function deleteAchievement(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("achievements").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, { action: "DELETE_ACHIEVEMENT", targetTable: "achievements", targetId: id });
  revalidateAchievementPaths(id);
}
