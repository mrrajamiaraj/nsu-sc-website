"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { uploadImage } from "@/lib/storage";
import { memberSchema } from "@/lib/validation/members";
import { panelSchema } from "@/lib/validation/panels";
import type { MemberTier } from "@/lib/types";

function revalidateMemberPaths() {
  revalidatePath("/admin/dashboard/members");
  revalidatePath("/admin/dashboard/members/panels");
  revalidatePath("/members");
  revalidatePath("/");
}

function parseMemberForm(formData: FormData) {
  return memberSchema.safeParse({
    name: formData.get("name"),
    designation: formData.get("designation"),
    tier: formData.get("tier"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    additionalInfo: formData.get("additionalInfo") || null,
  });
}

async function getActivePanelId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from("panels").select("id").eq("is_active", true).maybeSingle();
  return data?.id as string | undefined;
}

export async function createMember(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = parseMemberForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const panelId = await getActivePanelId(supabase);
  if (!panelId) return { error: "No active panel exists. Create and activate a panel first." };

  let photo: string | null = null;
  const file = formData.get("photo") as File | null;
  if (file && file.size > 0) {
    try {
      photo = await uploadImage("members", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { count } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("panel_id", panelId)
    .eq("tier", parsed.data.tier);

  const { data, error } = await supabase
    .from("members")
    .insert({
      panel_id: panelId,
      name: parsed.data.name,
      designation: parsed.data.designation,
      tier: parsed.data.tier,
      email: parsed.data.email,
      phone: parsed.data.phone,
      additional_info: parsed.data.additionalInfo,
      photo,
      sort_order: count ?? 0,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "CREATE_MEMBER", targetTable: "members", targetId: data.id });
  revalidateMemberPaths();
  redirect("/admin/dashboard/members");
}

export async function updateMember(id: string, _prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = parseMemberForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const updates: Record<string, unknown> = {
    name: parsed.data.name,
    designation: parsed.data.designation,
    tier: parsed.data.tier,
    email: parsed.data.email,
    phone: parsed.data.phone,
    additional_info: parsed.data.additionalInfo,
  };

  const file = formData.get("photo") as File | null;
  if (file && file.size > 0) {
    try {
      updates.photo = await uploadImage("members", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { error } = await supabase.from("members").update(updates).eq("id", id);
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "UPDATE_MEMBER", targetTable: "members", targetId: id });
  revalidateMemberPaths();
  redirect("/admin/dashboard/members");
}

export async function deleteMember(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, { action: "DELETE_MEMBER", targetTable: "members", targetId: id });
  revalidateMemberPaths();
}

export async function reorderMembers(panelId: string, tier: MemberTier, orderedIds: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_members", {
    p_panel_id: panelId,
    p_tier: tier,
    p_ordered_ids: orderedIds,
  });
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, { action: "REORDER_MEMBERS", targetTable: "members", targetId: panelId });
  revalidateMemberPaths();
}

export async function createPanel(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = panelSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("panels")
    .insert({ name: parsed.data.name, is_active: false })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "CREATE_PANEL", targetTable: "panels", targetId: data.id });
  revalidateMemberPaths();
  redirect("/admin/dashboard/members/panels");
}

export async function activatePanel(panelId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("activate_panel", { p_panel_id: panelId });
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, { action: "ACTIVATE_PANEL", targetTable: "panels", targetId: panelId });
  revalidateMemberPaths();
}
