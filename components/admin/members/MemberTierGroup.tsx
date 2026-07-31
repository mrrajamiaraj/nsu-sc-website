"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import type { Member, MemberTier } from "@/lib/types";

export function MemberTierGroup({
  tier,
  members,
  onReorder,
  onDelete,
}: {
  tier: MemberTier;
  members: Member[];
  onReorder: (orderedIds: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white">{tier}</h2>
      <div className="mt-3">
        {members.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-slate-500">
            No {tier} members yet.
          </p>
        ) : (
          <SortableList
            items={members}
            onReorder={onReorder}
            renderItem={(member) => (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.designation}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/dashboard/members/${member.id}/edit`}
                    className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <ConfirmDeleteButton action={onDelete.bind(null, member.id)} itemLabel={member.name} />
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
