import type { Player } from "@/lib/types";

// Staff roles live in the free-text position field ("Coach", "Team Manager", "Captain").
export function findPlayerByRole(players: Player[], role: string): string | null {
  return players.find((player) => player.position.toLowerCase().includes(role))?.name ?? null;
}

const STAFF_ROLES = ["coach", "manager"];

// Athletes are everyone on the roster except coaching/managing staff.
export function countAthletes(players: Player[]): number {
  return players.filter((player) => !STAFF_ROLES.some((role) => player.position.toLowerCase().includes(role))).length;
}
