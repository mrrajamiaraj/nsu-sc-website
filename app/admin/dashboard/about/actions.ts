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

function parseLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function updateAboutPageContent(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const heroSubtitle = (formData.get("heroSubtitle") as string)?.trim();
  const storyHeading = (formData.get("storyHeading") as string)?.trim();
  const storyHighlights = parseLines((formData.get("storyHighlights") as string) ?? "");
  const statEstablished = (formData.get("statEstablished") as string)?.trim();
  const statMembers = (formData.get("statMembers") as string)?.trim();
  const statChampionships = (formData.get("statChampionships") as string)?.trim();
  const missionText = (formData.get("missionText") as string)?.trim();
  const missionPoints = parseLines((formData.get("missionPoints") as string) ?? "");
  const visionText = (formData.get("visionText") as string)?.trim();
  const visionPoints = parseLines((formData.get("visionPoints") as string) ?? "");
  const coreValues = [0, 1, 2, 3].map((index) => ({
    title: ((formData.get(`coreValueTitle${index}`) as string) ?? "").trim(),
    description: ((formData.get(`coreValueDescription${index}`) as string) ?? "").trim(),
  }));

  if (!heroSubtitle) return { error: "Hero subtitle is required." };
  if (!storyHeading) return { error: "Story heading is required." };
  if (storyHighlights.length === 0) return { error: "At least one story highlight is required." };
  if (!statEstablished || !statMembers || !statChampionships) return { error: "All stats are required." };
  if (!missionText || !visionText) return { error: "Mission and vision text are required." };
  if (missionPoints.length === 0 || visionPoints.length === 0) {
    return { error: "At least one mission point and one vision point are required." };
  }
  if (coreValues.some((value) => !value.title || !value.description)) {
    return { error: "All four core values need a title and description." };
  }

  const supabase = await createClient();

  const updates: [string, string][] = [
    ["about_hero_subtitle", heroSubtitle],
    ["about_story_heading", storyHeading],
    ["about_story_highlights", JSON.stringify(storyHighlights)],
    ["about_stat_established", statEstablished],
    ["about_stat_members", statMembers],
    ["about_stat_championships", statChampionships],
    ["about_mission_text", missionText],
    ["about_mission_points", JSON.stringify(missionPoints)],
    ["about_vision_text", visionText],
    ["about_vision_points", JSON.stringify(visionPoints)],
    ["about_core_values", JSON.stringify(coreValues)],
  ];

  for (const [pageKey, content] of updates) {
    const { error } = await supabase
      .from("site_content")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("page_key", pageKey);

    if (error) return { error: error.message };
  }

  await logAuditEvent(supabase, { action: "UPDATE_SITE_CONTENT", targetTable: "site_content", targetId: "about_page" });
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
