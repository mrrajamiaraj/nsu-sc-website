"use server";

import { revalidatePath } from "next/cache";
import DOMPurify from "isomorphic-dompurify";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { uploadImage, deleteImage } from "@/lib/storage";

function revalidateAboutPaths() {
  revalidatePath("/admin/dashboard/about");
  revalidatePath("/about");
}

export async function updateAboutContent(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const history = (formData.get("history") as string) ?? "";
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_content")
    .update({ content: DOMPurify.sanitize(history), updated_at: new Date().toISOString() })
    .eq("page_key", "about_history");

  if (error) return { error: error.message };

  await logAuditEvent(supabase, {
    action: "UPDATE_SITE_CONTENT",
    targetTable: "site_content",
    targetId: "about_history",
  });
  revalidateAboutPaths();
  return { success: true };
}

export async function addAboutImage(_prevState: { error?: string } | undefined, formData: FormData) {
  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return { error: "Choose an image to upload." };

  const supabase = await createClient();

  let url: string;
  try {
    url = await uploadImage("about", file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed." };
  }

  const { data: existing } = await supabase
    .from("site_content")
    .select("images")
    .eq("page_key", "about_gallery")
    .maybeSingle();
  const images = [...((existing?.images as string[] | null) ?? []), url];

  const { error } = await supabase
    .from("site_content")
    .update({ images, updated_at: new Date().toISOString() })
    .eq("page_key", "about_gallery");

  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "ADD_ABOUT_IMAGE", targetTable: "site_content", targetId: "about_gallery" });
  revalidateAboutPaths();
  return {};
}

export async function removeAboutImage(url: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("site_content")
    .select("images")
    .eq("page_key", "about_gallery")
    .maybeSingle();
  const images = ((existing?.images as string[] | null) ?? []).filter((img) => img !== url);

  const { error } = await supabase
    .from("site_content")
    .update({ images, updated_at: new Date().toISOString() })
    .eq("page_key", "about_gallery");
  if (error) throw new Error(error.message);

  await deleteImage(url);
  await logAuditEvent(supabase, {
    action: "REMOVE_ABOUT_IMAGE",
    targetTable: "site_content",
    targetId: "about_gallery",
  });
  revalidateAboutPaths();
}
