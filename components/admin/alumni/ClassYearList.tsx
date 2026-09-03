"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import type { AlumniClassYear } from "@/lib/types";

export function ClassYearList({
  classYears,
  onReorder,
  onDelete,
}: {
  classYears: AlumniClassYear[];
  onReorder: (orderedIds: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <SortableList
      items={classYears}
      onReorder={onReorder}
      renderItem={(year) => (
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">{year.label}</p>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/dashboard/alumni/class-years/${year.id}/edit`}
              className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <ConfirmDeleteButton action={onDelete.bind(null, year.id)} itemLabel={year.label} />
          </div>
        </div>
      )}
    />
  );
}
