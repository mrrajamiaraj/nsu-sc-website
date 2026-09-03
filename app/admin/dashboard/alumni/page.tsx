import Link from "next/link";
import { Plus, Pencil, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapAlumniRow } from "@/lib/mappers";
import { Table, TableHead, TableBody, TableRow, TableCell, EmptyState } from "@/components/admin/Table";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { Button } from "@/components/ui/Button";
import { deleteAlumni } from "./actions";

export default async function AdminAlumniPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("alumni").select("*, alumni_class_years(label, sort_order)");
  const sortOrder = (row: Record<string, unknown>) =>
    (row.alumni_class_years as { sort_order?: number } | null)?.sort_order ?? 0;
  const alumni = (rows ?? []).slice().sort((a, b) => sortOrder(a) - sortOrder(b)).map(mapAlumniRow);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alumni</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/dashboard/alumni/class-years"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
            Manage Class Years
          </Link>
          <Button href="/admin/dashboard/alumni/new" size="sm">
            <Plus className="h-4 w-4" />
            Add Alumnus
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Table>
          <TableHead columns={["Name", "Team", "Class Year", "Tier", "Actions"]} />
          <TableBody>
            {alumni.map((alumnus) => (
              <TableRow key={alumnus.id}>
                <TableCell>{alumnus.name}</TableCell>
                <TableCell>{alumnus.team}</TableCell>
                <TableCell>{alumnus.classYear}</TableCell>
                <TableCell>{alumnus.tier}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/dashboard/alumni/${alumnus.id}/edit`}
                      className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <ConfirmDeleteButton action={deleteAlumni.bind(null, alumnus.id)} itemLabel={alumnus.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!alumni.length && <EmptyState message="No alumni yet." />}
      </div>
    </div>
  );
}
