import Image from "next/image";
import { Handshake } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/motion/Reveal";
import type { Sponsor, SponsorCategory } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function SponsorGrid({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {sponsors.map((sponsor, index) => (
        <Reveal key={sponsor.id} delay={(index % 6) * 0.06}>
          <GlassCard hover className="flex flex-col items-center gap-3 p-5 text-center">
            {sponsor.logo ? (
              <div className="relative h-20 w-full overflow-hidden rounded-xl bg-white">
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  fill
                  sizes="(min-width: 1024px) 160px, (min-width: 640px) 30vw, 45vw"
                  className="object-contain p-2"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold text-slate-200">
                {initials(sponsor.name)}
              </div>
            )}
            <p className="text-xs font-medium text-slate-300">{sponsor.name}</p>
          </GlassCard>
        </Reveal>
      ))}
    </div>
  );
}

const GROUPS: { category: SponsorCategory; title: string }[] = [
  { category: "Corporate", title: "Corporate Partners" },
  { category: "Media", title: "Media Partners" },
];

export function Sponsors({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null;

  const groups = GROUPS.map((group) => ({
    ...group,
    sponsors: sponsors.filter((s) => s.category === group.category),
  })).filter((group) => group.sponsors.length > 0);

  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
            <Handshake className="h-3.5 w-3.5 text-amber-300" />
            Our Sponsors
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Backed By Our Partners</h2>
          <p className="mt-3 text-slate-400">Proud to be supported by organizations that believe in student sport.</p>
        </Reveal>

        <div className="space-y-12">
          {groups.map((group) => (
            <div key={group.category}>
              <Reveal>
                <h3 className="mb-5 text-center text-sm font-semibold uppercase tracking-widest text-amber-300">
                  {group.title}
                </h3>
              </Reveal>
              <SponsorGrid sponsors={group.sponsors} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
