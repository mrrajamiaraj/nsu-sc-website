import { Reveal } from "@/components/motion/Reveal";
import type { Sponsor } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TrustedBy({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null;

  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <p className="text-sm text-slate-500">Trusted by students and athletes</p>
        </Reveal>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          {sponsors.slice(0, 4).map((sponsor, index) => (
            <Reveal key={sponsor.id} delay={index * 0.06}>
              <div className="flex h-16 w-32 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-400">
                {initials(sponsor.name)}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
