"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";

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
