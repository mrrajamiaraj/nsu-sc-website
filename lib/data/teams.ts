import { mockPlayers, mockTeams } from "@/lib/mock-data";
import type { Player, Team } from "@/lib/types";

// FR-12: list all sports teams. Swap for `supabase.from("teams").select("*")`.
export async function getTeams(): Promise<Team[]> {
  return mockTeams;
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  return mockTeams.find((team) => team.id === teamId) ?? null;
}

// FR-13/FR-32: players within a team, in admin-defined sort order.
export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  return mockPlayers.filter((player) => player.teamId === teamId).sort((a, b) => a.sortOrder - b.sortOrder);
}
