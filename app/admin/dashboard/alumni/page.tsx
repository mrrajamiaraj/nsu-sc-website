import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapAlumniRow } from "@/lib/mappers";
import { Table, TableHead, TableBody, TableRow, TableCell, EmptyState } from "@/components/admin/Table";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { Button } from "@/components/ui/Button";
import { deleteAlumni } from "./actions";

export default async function AdminAlumniPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("alumni").select("*").order("graduation_year", { ascending: false });
  const alumni = (rows ?? []).map(mapAlumniRow);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Alumni</h1>
        <Button href="/admin/dashboard/alumni/new" size="sm">
          <Plus className="h-4 w-4" />
          Add Alumnus
        </Button>
      </div>

      <div className="mt-6">
        <Table>
          <TableHead columns={["Name", "Team", "Grad Year", "Tier", "Actions"]} />
          <TableBody>
            {alumni.map((alumnus) => (
              <TableRow key={alumnus.id}>
                <TableCell>{alumnus.name}</TableCell>
                <TableCell>{alumnus.team}</TableCell>
                <TableCell>{alumnus.graduationYear}</TableCell>
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
