"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { uploadImage, deleteImage } from "@/lib/storage";

export async function updateHomeContent(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const tagline = (formData.get("tagline") as string)?.trim();
  const orgName = (formData.get("orgName") as string)?.trim();
  const videoUrl = (formData.get("videoUrl") as string)?.trim() ?? "";
  const featuredEventId = (formData.get("featuredEventId") as string) || null;

  if (!tagline) return { error: "Tagline is required." };
  if (!orgName) return { error: "Badge text is required." };
  if (videoUrl && !/^https?:\/\//i.test(videoUrl)) return { error: "Video URL must start with http:// or https://." };

  const supabase = await createClient();

  const { error: taglineError } = await supabase
    .from("site_content")
    .update({ content: tagline, updated_at: new Date().toISOString() })
    .eq("page_key", "home_tagline");

  if (taglineError) return { error: taglineError.message };

  const { error: orgNameError } = await supabase
    .from("site_content")
    .update({ content: orgName, updated_at: new Date().toISOString() })
    .eq("page_key", "home_badge");

  if (orgNameError) return { error: orgNameError.message };

  const { error: videoError } = await supabase
    .from("site_content")
    .update({ content: videoUrl, updated_at: new Date().toISOString() })
    .eq("page_key", "home_video_url");

  if (videoError) return { error: videoError.message };

  const { error: featuredError } = await supabase
    .from("site_content")
    .update({ featured_event_id: featuredEventId, updated_at: new Date().toISOString() })
    .eq("page_key", "home_featured_event");

  if (featuredError) return { error: featuredError.message };

  await logAuditEvent(supabase, { action: "UPDATE_SITE_CONTENT", targetTable: "site_content", targetId: "home" });
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { success: true };
}

function revalidateSitewide() {
  // The logo renders in the Navbar/Footer shared by every page under app/(site)/layout.tsx.
  revalidatePath("/", "layout");
  revalidatePath("/admin/dashboard");
}

export async function updateSiteLogo(_prevState: { error?: string } | undefined, formData: FormData) {
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) return { error: "Choose an image to upload." };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("site_content")
    .select("content")
    .eq("page_key", "site_logo")
    .maybeSingle();

  let url: string;
  try {
    url = await uploadImage("branding", file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Image upload failed." };
  }

  const { error } = await supabase
    .from("site_content")
    .update({ content: url, updated_at: new Date().toISOString() })
    .eq("page_key", "site_logo");

  if (error) return { error: error.message };

  if (existing?.content) await deleteImage(existing.content as string);

  await logAuditEvent(supabase, { action: "UPDATE_SITE_CONTENT", targetTable: "site_content", targetId: "site_logo" });
  revalidateSitewide();
  return {};
}

export async function removeSiteLogo() {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("site_content")
    .select("content")
    .eq("page_key", "site_logo")
    .maybeSingle();

  const { error } = await supabase
    .from("site_content")
    .update({ content: "", updated_at: new Date().toISOString() })
    .eq("page_key", "site_logo");

  if (error) throw new Error(error.message);

  if (existing?.content) await deleteImage(existing.content as string);

  await logAuditEvent(supabase, { action: "UPDATE_SITE_CONTENT", targetTable: "site_content", targetId: "site_logo" });
  revalidateSitewide();
}
