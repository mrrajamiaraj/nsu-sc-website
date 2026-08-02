import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapTeamRow } from "@/lib/mappers";
import { Table, TableHead, TableBody, TableRow, TableCell, EmptyState } from "@/components/admin/Table";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { TeamsStatsForm } from "@/components/admin/teams/TeamsStatsForm";
import { deleteTeam, updateTeamsStats } from "./actions";

export default async function AdminTeamsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("teams").select("*").order("name");
  const teams = (rows ?? []).map(mapTeamRow);
  const { data: statRows } = await supabase
    .from("site_content")
    .select("page_key, content")
    .in("page_key", ["teams_stat_championships", "teams_stat_medals", "teams_stat_win_rate"]);
  const getStat = (key: string) => statRows?.find((row) => row.page_key === key)?.content ?? "";

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Teams Page Stats</h2>
      <GlassCard className="mt-3">
        <TeamsStatsForm
          championships={getStat("teams_stat_championships")}
          medals={getStat("teams_stat_medals")}
          winRate={getStat("teams_stat_win_rate")}
          action={updateTeamsStats}
        />
      </GlassCard>

      <div className="mt-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Teams &amp; Players</h1>
        <Button href="/admin/dashboard/teams/new" size="sm">
          <Plus className="h-4 w-4" />
          Add Team
        </Button>
      </div>

      <div className="mt-6">
        <Table>
          <TableHead columns={["Name", "Nickname", "Description", "Actions"]} />
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>{team.name}</TableCell>
                <TableCell>{team.nickname ?? "—"}</TableCell>
                <TableCell className="max-w-xs truncate">{team.description}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/dashboard/teams/${team.id}/edit`}
                      className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <ConfirmDeleteButton action={deleteTeam.bind(null, team.id)} itemLabel={team.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!teams.length && <EmptyState message="No teams yet. Add your first team." />}
      </div>
    </div>
  );
}
