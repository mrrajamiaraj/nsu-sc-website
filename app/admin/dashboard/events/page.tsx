import Link from "next/link";
import { Layers, Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapEventRow } from "@/lib/mappers";
import { getAllSeries } from "@/lib/data/events";
import { Table, TableHead, TableBody, TableRow, TableCell, EmptyState } from "@/components/admin/Table";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatEventDate } from "@/lib/format";
import { deleteEvent } from "./actions";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const [{ data: rows }, series] = await Promise.all([
    supabase.from("events").select("*").order("date", { ascending: false, nullsFirst: false }),
    getAllSeries(),
  ]);
  const events = (rows ?? []).map(mapEventRow);
  const seriesById = new Map(series.map((s) => [s.id, s]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <div className="flex flex-wrap gap-2">
          <Button href="/admin/dashboard/events/series" size="sm" variant="secondary">
            <Layers className="h-4 w-4" />
            Series ({series.length})
          </Button>
          <Button href="/admin/dashboard/events/new" size="sm">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Table>
          <TableHead columns={["Name", "Series", "Date", "Status", "Actions"]} />
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.name}</TableCell>
                <TableCell>
                  {event.seriesId ? (
                    <span className="font-mono text-xs">
                      {seriesById.get(event.seriesId)?.abbreviation}
                      {event.seasonNumber ? ` · S${event.seasonNumber}` : ""}
                    </span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </TableCell>
                <TableCell>{formatEventDate(event) ?? "No date"}</TableCell>
                <TableCell>
                  <StatusBadge status={event.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/dashboard/events/${event.id}/edit`}
                      className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <ConfirmDeleteButton action={deleteEvent.bind(null, event.id)} itemLabel={event.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!events.length && <EmptyState message="No events yet. Add your first event." />}
      </div>
    </div>
  );
}
