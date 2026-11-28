"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasVisibleContent, sanitizeHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/squads";
import { logAuditEvent } from "@/lib/audit";
import { uploadImage } from "@/lib/storage";
import { blogPostSchema } from "@/lib/validation/blog";

function parseForm(formData: FormData) {
  return blogPostSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content") || "",
    category: formData.get("category"),
    author: formData.get("author"),
    date: formData.get("date"),
  });
}

const text = (formData: FormData, key: string) => {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
};

// The Gazette's own fields (docs/proposals/blog-gazette.sql adds these columns).
function gazetteFields(formData: FormData, title: string) {
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => slugify(t))
    .filter(Boolean);
  return {
    slug: slugify(text(formData, "slug") ?? title.replace(/[’']/g, "")) || null,
    sport: text(formData, "sport"),
    author_role: text(formData, "authorRole"),
    cover_credit: text(formData, "coverCredit"),
    tags,
    related_event_id: text(formData, "relatedEventId"),
    related_achievement_id: text(formData, "relatedAchievementId"),
    related_team_id: text(formData, "relatedTeamId"),
  };
}

// Read time from the text (about 220 words a minute).
const readTime = (html: string) => Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 220));

// Before the Gazette columns exist, a save with them fails on the unknown column; save the
// rest and say what's missing instead of losing the post.
const missingColumn = (message: string) => /column|schema cache/i.test(message);
const MISSING_NOTICE = "Saved, but the Gazette fields (sport, tags, web address, links) need the database update in docs/proposals/blog-gazette.sql.";

function bodyError(content: string) {
  return hasVisibleContent(sanitizeHtml(content)) ? null : "Write the story before publishing. The site doesn't show summary-only posts.";
}

function revalidateBlogPaths(id?: string) {
  revalidatePath("/admin/dashboard/blog");
  revalidatePath("/blog");
  revalidatePath("/");
  if (id) revalidatePath(`/blog/${id}`);
}

export async function createBlogPost(_prevState: { error?: string; notice?: string } | undefined, formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const noBody = bodyError(parsed.data.content);
  if (noBody) return { error: noBody };

  const supabase = await createClient();

  let coverImage: string | null = null;
  const file = formData.get("coverImage") as File | null;
  if (file && file.size > 0) {
    try {
      coverImage = await uploadImage("blog", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const content = sanitizeHtml(parsed.data.content);
  const base = {
    title: parsed.data.title,
    excerpt: parsed.data.excerpt,
    content,
    category: parsed.data.category,
    author: parsed.data.author,
    date: parsed.data.date,
    read_time_minutes: readTime(content),
    cover_image: coverImage,
  };
  let result = await supabase.from("blog_posts").insert({ ...base, ...gazetteFields(formData, parsed.data.title) }).select("id").single();
  let notice: string | null = null;
  if (result.error && missingColumn(result.error.message)) {
    result = await supabase.from("blog_posts").insert(base).select("id").single();
    notice = MISSING_NOTICE;
  }
  const { data, error } = result;
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "CREATE_BLOG_POST", targetTable: "blog_posts", targetId: data.id });
  revalidateBlogPaths(data.id);
  if (notice) return { notice };
  redirect("/admin/dashboard/blog");
}

export async function updateBlogPost(id: string, _prevState: { error?: string; notice?: string } | undefined, formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const noBody = bodyError(parsed.data.content);
  if (noBody) return { error: noBody };

  const supabase = await createClient();
  const updates: Record<string, unknown> = {
    title: parsed.data.title,
    excerpt: parsed.data.excerpt,
    content: sanitizeHtml(parsed.data.content),
    category: parsed.data.category,
    author: parsed.data.author,
    date: parsed.data.date,
  };
  updates.read_time_minutes = readTime(updates.content as string);

  const file = formData.get("coverImage") as File | null;
  if (file && file.size > 0) {
    try {
      updates.cover_image = await uploadImage("blog", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  let { error } = await supabase.from("blog_posts").update({ ...updates, ...gazetteFields(formData, parsed.data.title) }).eq("id", id);
  let notice: string | null = null;
  if (error && missingColumn(error.message)) {
    ({ error } = await supabase.from("blog_posts").update(updates).eq("id", id));
    notice = MISSING_NOTICE;
  }
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "UPDATE_BLOG_POST", targetTable: "blog_posts", targetId: id });
  revalidateBlogPaths(id);
  if (notice) return { notice };
  redirect("/admin/dashboard/blog");
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, { action: "DELETE_BLOG_POST", targetTable: "blog_posts", targetId: id });
  revalidateBlogPaths(id);
}
