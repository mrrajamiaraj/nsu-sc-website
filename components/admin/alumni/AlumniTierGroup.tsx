"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import type { AlumniProfile } from "@/lib/types";

function AlumnusRow({ alumnus, onDelete }: { alumnus: AlumniProfile; onDelete: (id: string) => Promise<void> }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10">
          {alumnus.photo ? (
            <Image src={alumnus.photo} alt={alumnus.name} fill sizes="40px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-300">
              {alumnus.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{alumnus.name}</p>
          <p className="truncate text-xs text-slate-500">
            {[alumnus.team, alumnus.currentRole].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={`/admin/dashboard/alumni/${alumnus.id}/edit`}
          className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
          aria-label={`Edit ${alumnus.name}`}
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <ConfirmDeleteButton action={onDelete.bind(null, alumnus.id)} itemLabel={alumnus.name} />
      </div>
    </div>
  );
}

export function AlumniTierGroup({
  tier,
  alumni,
  onReorder,
  onDelete,
}: {
  tier: AlumniProfile["tier"];
  alumni: AlumniProfile[];
  onReorder: (orderedIds: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {tier} <span className="text-slate-600">({alumni.length})</span>
      </h3>
      <SortableList
        items={alumni}
        onReorder={onReorder}
        renderItem={(alumnus) => <AlumnusRow alumnus={alumnus} onDelete={onDelete} />}
      />
    </div>
  );
}
