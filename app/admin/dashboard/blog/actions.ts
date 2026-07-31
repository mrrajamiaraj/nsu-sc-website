"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { createClient } from "@/lib/supabase/server";
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
    readTimeMinutes: formData.get("readTimeMinutes"),
  });
}

function revalidateBlogPaths(id?: string) {
  revalidatePath("/admin/dashboard/blog");
  revalidatePath("/blog");
  revalidatePath("/");
  if (id) revalidatePath(`/blog/${id}`);
}

export async function createBlogPost(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

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

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content: DOMPurify.sanitize(parsed.data.content),
      category: parsed.data.category,
      author: parsed.data.author,
      date: parsed.data.date,
      read_time_minutes: parsed.data.readTimeMinutes,
      cover_image: coverImage,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "CREATE_BLOG_POST", targetTable: "blog_posts", targetId: data.id });
  revalidateBlogPaths(data.id);
  redirect("/admin/dashboard/blog");
}

export async function updateBlogPost(id: string, _prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const updates: Record<string, unknown> = {
    title: parsed.data.title,
    excerpt: parsed.data.excerpt,
    content: DOMPurify.sanitize(parsed.data.content),
    category: parsed.data.category,
    author: parsed.data.author,
    date: parsed.data.date,
    read_time_minutes: parsed.data.readTimeMinutes,
  };

  const file = formData.get("coverImage") as File | null;
  if (file && file.size > 0) {
    try {
      updates.cover_image = await uploadImage("blog", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { error } = await supabase.from("blog_posts").update(updates).eq("id", id);
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "UPDATE_BLOG_POST", targetTable: "blog_posts", targetId: id });
  revalidateBlogPaths(id);
  redirect("/admin/dashboard/blog");
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, { action: "DELETE_BLOG_POST", targetTable: "blog_posts", targetId: id });
  revalidateBlogPaths(id);
}
