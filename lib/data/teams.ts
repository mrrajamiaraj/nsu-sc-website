import { createClient } from "@/lib/supabase/server";
import { mapMemberRow, mapPlayerRow, mapTeamRow } from "@/lib/mappers";
import type { Member, Player, Team } from "@/lib/types";

// FR-12: list all sports teams.
export async function getTeams(): Promise<Team[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("teams").select("*").order("name");
  return (data ?? []).map(mapTeamRow);
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("teams").select("*").eq("id", teamId).maybeSingle();
  return data ? mapTeamRow(data) : null;
}

// FR-13/FR-32: players within a team, in admin-defined sort order.
export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("players").select("*").eq("team_id", teamId).order("sort_order");
  return (data ?? []).map(mapPlayerRow);
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
    .map(mapMemberRow);

  return {
    managers: members.filter((m) => m.tier === "Executive").sort((a, b) => a.sortOrder - b.sortOrder),
    inCharges: members.filter((m) => m.tier === "Sub-Executive").sort((a, b) => a.name.localeCompare(b.name)),
  };
}
