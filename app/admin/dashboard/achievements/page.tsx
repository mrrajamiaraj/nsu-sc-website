import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAchievements } from "@/lib/data/achievements";
import { Table, TableHead, TableBody, TableRow, TableCell, EmptyState } from "@/components/admin/Table";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { deleteAchievement } from "./actions";

export default async function AdminAchievementsPage() {
  const achievements = await getAchievements();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Achievements</h1>
        <Button href="/admin/dashboard/achievements/new" size="sm">
          <Plus className="h-4 w-4" />
          Add Achievement
        </Button>
      </div>

      <div className="mt-6">
        <Table>
          <TableHead columns={["Title", "Team", "Date", "Actions"]} />
          <TableBody>
            {achievements.map((achievement) => (
              <TableRow key={achievement.id}>
                <TableCell>{achievement.title}</TableCell>
                <TableCell>{achievement.teamName}</TableCell>
                <TableCell>{formatDate(achievement.date)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/dashboard/achievements/${achievement.id}/edit`}
                      className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <ConfirmDeleteButton
                      action={deleteAchievement.bind(null, achievement.id)}
                      itemLabel={achievement.title}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!achievements.length && <EmptyState message="No achievements yet." />}
      </div>
    </div>
  );
}
