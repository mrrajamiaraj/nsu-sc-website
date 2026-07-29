import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";
import type { AlumniProfile } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AlumniCard({ alumni }: { alumni: AlumniProfile }) {
  return (
    <GlassCard hover className="flex flex-col items-center p-6 text-center">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-gradient text-xl font-bold text-night-950">
        {alumni.photo ? (
          <Image src={alumni.photo} alt={alumni.name} fill sizes="80px" className="object-cover" />
        ) : (
          initials(alumni.name)
        )}
      </div>

      <h3 className="mt-4 text-lg font-bold text-white">{alumni.name}</h3>
      <p className="text-sm text-blue-400">Class of {alumni.graduationYear} · {alumni.team}</p>
      <p className="mt-1 text-sm text-slate-400">{alumni.currentRole}</p>

      {alumni.quote && (
        <p className="mt-4 border-t border-white/10 pt-4 text-sm italic text-slate-400">&ldquo;{alumni.quote}&rdquo;</p>
      )}
    </GlassCard>
  );
}
