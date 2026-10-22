import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { mapMemberRow, mapPlayerRow, mapTeamRow } from "@/lib/mappers";
import type { Member, Player, Team } from "@/lib/types";

export async function getTeams(): Promise<Team[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("teams").select("*").order("name");
  return (data ?? []).map(mapTeamRow);
}

export const getTeamById = cache(async (teamId: string): Promise<Team | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("teams").select("*").eq("id", teamId).maybeSingle();
  return data ? mapTeamRow(data) : null;
});

export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("players").select("*").eq("team_id", teamId).order("sort_order");
  return (data ?? []).map(mapPlayerRow);
}

// All players in one query, keyed by team id, each list in admin-defined order.
export async function getPlayersGroupedByTeam(): Promise<Map<string, Player[]>> {
  const supabase = await createClient();
  const { data } = await supabase.from("players").select("*").order("sort_order");
  const byTeam = new Map<string, Player[]>();
  for (const player of (data ?? []).map(mapPlayerRow)) {
    byTeam.set(player.teamId, [...(byTeam.get(player.teamId) ?? []), player]);
  }
  return byTeam;
}

// Team staff come from the members table: Executives are the team's managers,
// Sub-Executives its in-charges. Members RLS hides non-active panels publicly,
// so those rows come back with a null member and are dropped.
export async function getTeamStaff(teamId: string): Promise<{ managers: Member[]; inCharges: Member[] }> {
  const supabase = await createClient();
  const { data } = await supabase.from("team_staff").select("member:members(*)").eq("team_id", teamId);
  const members = (data ?? [])
    .map((row) => row.member as unknown as Record<string, unknown> | null)
    .filter((row): row is Record<string, unknown> => Boolean(row))
    .map(mapMemberRow)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    managers: members.filter((m) => m.tier === "Executive"),
    inCharges: members.filter((m) => m.tier === "Sub-Executive"),
  };
}
