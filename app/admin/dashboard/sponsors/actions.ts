"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { uploadImage } from "@/lib/storage";
import { sponsorSchema } from "@/lib/validation/sponsors";
import type { SponsorCategory } from "@/lib/types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

function revalidateSponsorPaths() {
  revalidatePath("/admin/dashboard/sponsors");
  revalidatePath("/about");
  revalidatePath("/");
}

// sort_order is per-category, so a sponsor entering a category goes to the end of it.
async function nextSortOrder(supabase: SupabaseClient, category: SponsorCategory) {
  const { data: last } = await supabase
    .from("sponsors")
    .select("sort_order")
    .eq("category", category)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (last?.sort_order ?? -1) + 1;
}

export async function createSponsor(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = sponsorSchema.safeParse({ name: formData.get("name"), category: formData.get("category") });
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

  const { data, error } = await supabase
    .from("sponsors")
    .insert({
      name: parsed.data.name,
      logo,
      category: parsed.data.category,
      sort_order: await nextSortOrder(supabase, parsed.data.category),
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "CREATE_SPONSOR", targetTable: "sponsors", targetId: data.id });
  revalidateSponsorPaths();
  redirect("/admin/dashboard/sponsors");
}

export async function updateSponsor(id: string, _prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = sponsorSchema.safeParse({ name: formData.get("name"), category: formData.get("category") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const updates: Record<string, unknown> = { name: parsed.data.name, category: parsed.data.category };

  const { data: current } = await supabase.from("sponsors").select("category").eq("id", id).maybeSingle();
  if (current && current.category !== parsed.data.category) {
    updates.sort_order = await nextSortOrder(supabase, parsed.data.category);
  }

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

export async function reorderSponsors(category: SponsorCategory, orderedIds: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_sponsors", { p_category: category, p_ordered_ids: orderedIds });
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, { action: "REORDER_SPONSORS", targetTable: "sponsors", metadata: { category } });
  revalidateSponsorPaths();
}
