import { createClient } from "@/lib/supabase/server";
import { mapPlayerRow, mapTeamRow } from "@/lib/mappers";
import type { Player, Team } from "@/lib/types";

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
