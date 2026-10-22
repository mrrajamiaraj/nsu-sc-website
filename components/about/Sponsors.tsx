import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Handshake } from "lucide-react";
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

// Tight wall of white logo tiles; the partner's name fades in on hover/focus.
function LogoWall({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {sponsors.map((sponsor) => (
        <li
          key={sponsor.id}
          tabIndex={0}
          title={sponsor.name}
          className="group relative aspect-[3/2] overflow-hidden rounded-xl bg-white outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          {sponsor.logo ? (
            <Image
              src={sponsor.logo}
              alt={sponsor.name}
              fill
              sizes="(min-width: 1024px) 180px, (min-width: 640px) 25vw, 50vw"
              className="object-contain p-4"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-lg font-bold text-slate-700">
              {initials(sponsor.name)}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-night-950/85 px-3 text-center text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
            {sponsor.name}
          </span>
        </li>
      ))}
    </ul>
  );
}

const GROUPS: { category: SponsorCategory; title: string }[] = [
  { category: "Corporate", title: "Corporate" },
  { category: "Media", title: "Media" },
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
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-300">
              <Handshake className="h-3.5 w-3.5 text-amber-300" />
              Our Partners
            </div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Backed By Our Partners</h2>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            Become a partner
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="space-y-10">
          {groups.map((group) => (
            <Reveal key={group.category}>
              <h3 className="mb-3 flex items-baseline gap-2 font-mono text-xs font-medium uppercase tracking-[0.1em] text-slate-400">
                {group.title}
                <span className="text-slate-500">({group.sponsors.length})</span>
              </h3>
              <LogoWall sponsors={group.sponsors} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
