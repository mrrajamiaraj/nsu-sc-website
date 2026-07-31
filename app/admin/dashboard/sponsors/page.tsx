import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapSponsorRow } from "@/lib/mappers";
import { Table, TableHead, TableBody, TableRow, TableCell, EmptyState } from "@/components/admin/Table";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { Button } from "@/components/ui/Button";
import { deleteSponsor } from "./actions";

export default async function AdminSponsorsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("sponsors").select("*").order("name");
  const sponsors = (rows ?? []).map(mapSponsorRow);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Sponsors</h1>
        <Button href="/admin/dashboard/sponsors/new" size="sm">
          <Plus className="h-4 w-4" />
          Add Sponsor
        </Button>
      </div>

      <div className="mt-6">
        <Table>
          <TableHead columns={["Name", "Actions"]} />
          <TableBody>
            {sponsors.map((sponsor) => (
              <TableRow key={sponsor.id}>
                <TableCell>{sponsor.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/dashboard/sponsors/${sponsor.id}/edit`}
                      className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <ConfirmDeleteButton action={deleteSponsor.bind(null, sponsor.id)} itemLabel={sponsor.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!sponsors.length && <EmptyState message="No sponsors yet." />}
      </div>
    </div>
  );
}
