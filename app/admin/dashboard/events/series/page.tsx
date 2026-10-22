import Link from "next/link";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { Table, TableHead, TableBody, TableRow, TableCell, EmptyState } from "@/components/admin/Table";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { Button } from "@/components/ui/Button";
import { getAllEvents, getAllSeries } from "@/lib/data/events";
import { deleteSeries } from "./actions";

export default async function AdminSeriesPage() {
  const [series, events] = await Promise.all([getAllSeries(), getAllEvents()]);
  const seasonCount = (id: string) => events.filter((event) => event.seriesId === id).length;

  return (
    <div>
      <Link href="/admin/dashboard/events" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Events
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Event Series</h1>
          <p className="mt-1 text-sm text-slate-400">
            A series groups the seasons of a recurring event. Assign seasons to a series from each event&rsquo;s edit page.
          </p>
        </div>
        <Button href="/admin/dashboard/events/series/new" size="sm">
          <Plus className="h-4 w-4" />
          Add Series
        </Button>
      </div>

      <div className="mt-6">
        <Table>
          <TableHead columns={["Abbreviation", "Name", "Sport", "Seasons", "Actions"]} />
          <TableBody>
            {series.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono font-semibold">{s.abbreviation}</TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.sport ?? "—"}</TableCell>
                <TableCell>{seasonCount(s.id)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/dashboard/events/series/${s.id}/edit`}
                      aria-label={`Edit ${s.name}`}
                      className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <ConfirmDeleteButton action={deleteSeries.bind(null, s.id)} itemLabel={`${s.name} (its seasons are kept)`} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!series.length && <EmptyState message="No series yet. Add one to group an event's seasons." />}
      </div>
    </div>
  );
}
