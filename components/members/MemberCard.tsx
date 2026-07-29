import Image from "next/image";
import { BadgeCheck, UserRound } from "lucide-react";
import type { Member } from "@/lib/types";

export function MemberCard({ member }: { member: Member }) {
  return (
    <div className="glass-panel group overflow-hidden transition-all duration-300 hover:border-white/25 hover:-translate-y-0.5">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
            <UserRound className="h-10 w-10 text-night-950/40" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {member.tier}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white">{member.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-blue-400">
          <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
          {member.designation}
        </p>

        <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="shrink-0 text-slate-400">Email</span>
            <span className="truncate font-medium text-white">{member.email}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="shrink-0 text-slate-400">Phone</span>
            <span className="font-medium text-white">{member.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
