import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Table, TableHead, TableBody, TableRow, TableCell, EmptyState } from "@/components/admin/Table";

const PAGE_SIZE = 25;

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: rows, count } = await supabase
    .from("audit_log")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Audit Log</h1>

      <div className="mt-6">
        <Table>
          <TableHead columns={["Timestamp", "Action", "Table", "Record", "Actor"]} />
          <TableBody>
            {(rows ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                <TableCell>{row.action}</TableCell>
                <TableCell>{row.target_table ?? "—"}</TableCell>
                <TableCell className="max-w-[160px] truncate">{row.target_id ?? "—"}</TableCell>
                <TableCell>{row.actor_label ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows?.length && <EmptyState message="No audit log entries yet." />}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <Link
            href={`/admin/dashboard/audit-log?page=${Math.max(1, page - 1)}`}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 hover:bg-white/10"
          >
            Previous
          </Link>
          <span>
            Page {page} of {totalPages}
          </span>
          <Link
            href={`/admin/dashboard/audit-log?page=${Math.min(totalPages, page + 1)}`}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 hover:bg-white/10"
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
