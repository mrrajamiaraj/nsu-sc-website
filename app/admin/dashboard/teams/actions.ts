"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { uploadImage } from "@/lib/storage";
import { teamSchema } from "@/lib/validation/teams";
import { playerSchema } from "@/lib/validation/players";

function parseTeamForm(formData: FormData) {
  return teamSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    nickname: formData.get("nickname") || null,
    achievement: formData.get("achievement") || null,
  });
}

function revalidateTeamPaths(id?: string) {
  revalidatePath("/admin/dashboard/teams");
  revalidatePath("/teams");
  revalidatePath("/");
  if (id) revalidatePath(`/teams/${id}`);
}

export async function updateTeamsStats(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const championships = (formData.get("championships") as string)?.trim();
  const medals = (formData.get("medals") as string)?.trim();
  const winRate = (formData.get("winRate") as string)?.trim();

  if (!championships || !medals || !winRate) return { error: "All three stats are required." };

  const supabase = await createClient();

  const updates: [string, string][] = [
    ["teams_stat_championships", championships],
    ["teams_stat_medals", medals],
    ["teams_stat_win_rate", winRate],
  ];

  for (const [pageKey, content] of updates) {
    const { error } = await supabase
      .from("site_content")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("page_key", pageKey);

    if (error) return { error: error.message };
  }

  await logAuditEvent(supabase, { action: "UPDATE_SITE_CONTENT", targetTable: "site_content", targetId: "teams_stats" });
  revalidateTeamPaths();
  return { success: true };
}

export async function createTeam(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = parseTeamForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();

  let bannerImage: string | null = null;
  const file = formData.get("bannerImage") as File | null;
  if (file && file.size > 0) {
    try {
      bannerImage = await uploadImage("teams", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { data, error } = await supabase
    .from("teams")
    .insert({
      name: parsed.data.name,
      description: parsed.data.description,
      nickname: parsed.data.nickname,
      achievement: parsed.data.achievement,
      banner_image: bannerImage,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "CREATE_TEAM", targetTable: "teams", targetId: data.id });
  revalidateTeamPaths(data.id);
  redirect(`/admin/dashboard/teams/${data.id}/edit`);
}

export async function updateTeam(id: string, _prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = parseTeamForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const updates: Record<string, unknown> = {
    name: parsed.data.name,
    description: parsed.data.description,
    nickname: parsed.data.nickname,
    achievement: parsed.data.achievement,
  };

  const file = formData.get("bannerImage") as File | null;
  if (file && file.size > 0) {
    try {
      updates.banner_image = await uploadImage("teams", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { error } = await supabase.from("teams").update(updates).eq("id", id);
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "UPDATE_TEAM", targetTable: "teams", targetId: id });
  revalidateTeamPaths(id);
  redirect("/admin/dashboard/teams");
}

export async function deleteTeam(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, { action: "DELETE_TEAM", targetTable: "teams", targetId: id });
  revalidateTeamPaths(id);
}

function parsePlayerForm(formData: FormData) {
  return playerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    position: formData.get("position"),
    bio: formData.get("bio"),
  });
}

export async function createPlayer(teamId: string, _prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = parsePlayerForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();

  let photo: string | null = null;
  const file = formData.get("photo") as File | null;
  if (file && file.size > 0) {
    try {
      photo = await uploadImage("players", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { count } = await supabase.from("players").select("id", { count: "exact", head: true }).eq("team_id", teamId);

  const { data, error } = await supabase
    .from("players")
    .insert({
      team_id: teamId,
      name: parsed.data.name,
      email: parsed.data.email,
      position: parsed.data.position,
      bio: parsed.data.bio,
      photo,
      sort_order: count ?? 0,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "CREATE_PLAYER", targetTable: "players", targetId: data.id });
  revalidateTeamPaths(teamId);
  redirect(`/admin/dashboard/teams/${teamId}/edit`);
}

export async function updatePlayer(
  teamId: string,
  playerId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const parsed = parsePlayerForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const updates: Record<string, unknown> = {
    name: parsed.data.name,
    email: parsed.data.email,
    position: parsed.data.position,
    bio: parsed.data.bio,
  };

  const file = formData.get("photo") as File | null;
  if (file && file.size > 0) {
    try {
      updates.photo = await uploadImage("players", file);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed." };
    }
  }

  const { error } = await supabase.from("players").update(updates).eq("id", playerId);
  if (error) return { error: error.message };

  await logAuditEvent(supabase, { action: "UPDATE_PLAYER", targetTable: "players", targetId: playerId });
  revalidateTeamPaths(teamId);
  redirect(`/admin/dashboard/teams/${teamId}/edit`);
}

export async function deletePlayer(teamId: string, playerId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("players").delete().eq("id", playerId);
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, { action: "DELETE_PLAYER", targetTable: "players", targetId: playerId });
  revalidateTeamPaths(teamId);
}

export async function reorderPlayers(teamId: string, orderedIds: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_players", { p_team_id: teamId, p_ordered_ids: orderedIds });
  if (error) throw new Error(error.message);

  await logAuditEvent(supabase, { action: "REORDER_PLAYERS", targetTable: "players", targetId: teamId });
  revalidateTeamPaths(teamId);
}
