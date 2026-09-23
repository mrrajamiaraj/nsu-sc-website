"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import type { Sponsor } from "@/lib/types";

function SponsorRow({ sponsor, onDelete }: { sponsor: Sponsor; onDelete: (id: string) => Promise<void> }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {sponsor.logo ? (
          <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md bg-white">
            <Image src={sponsor.logo} alt={sponsor.name} fill sizes="64px" className="object-contain p-1" />
          </div>
        ) : (
          <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md bg-white/5 text-[10px] text-slate-500">
            No logo
          </div>
        )}
        <p className="text-sm font-semibold text-white">{sponsor.name}</p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/dashboard/sponsors/${sponsor.id}/edit`}
          className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <ConfirmDeleteButton action={onDelete.bind(null, sponsor.id)} itemLabel={sponsor.name} />
      </div>
    </div>
  );
}

export function SponsorCategoryGroup({
  title,
  sponsors,
  onReorder,
  onDelete,
}: {
  title: string;
  sponsors: Sponsor[];
  onReorder: (orderedIds: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-3">
        {sponsors.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-slate-500">
            No {title.toLowerCase()} yet.
          </p>
        ) : (
          <SortableList
            items={sponsors}
            onReorder={onReorder}
            renderItem={(sponsor) => <SponsorRow sponsor={sponsor} onDelete={onDelete} />}
          />
        )}
      </div>
    </div>
  );
}
