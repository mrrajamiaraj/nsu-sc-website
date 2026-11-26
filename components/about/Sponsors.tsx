import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Handshake } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/PageHeader";
import type { Sponsor, SponsorCategory } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Tight wall of white logo tiles, each named underneath so the name is readable on
// touch screens too (it used to appear only on hover). Long names wrap to two lines.
function LogoWall({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-4 lg:grid-cols-6">
      {sponsors.map((sponsor) => (
        <li key={sponsor.id} className="flex min-w-0 flex-col gap-2">
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-white">
            {sponsor.logo ? (
              // The visible name below labels the tile, so the logo itself is decorative.
              <Image
                src={sponsor.logo}
                alt=""
                fill
                sizes="(min-width: 1024px) 180px, (min-width: 640px) 25vw, 50vw"
                className="object-contain p-4"
              />
            ) : (
              <span aria-hidden className="flex h-full items-center justify-center text-lg font-bold text-slate-700">
                {initials(sponsor.name)}
              </span>
            )}
          </div>
          <p className="line-clamp-2 break-words text-center text-xs font-medium leading-snug text-slate-300">
            {sponsor.name}
          </p>
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
            <Eyebrow icon={Handshake} iconClassName="text-amber-300" className="mb-4">
              Our Partners
            </Eyebrow>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Backed By Our Partners</h2>
          </div>
          {/* Opens the contact form with "Partnership or sponsorship" already chosen. */}
          <Link
            href="/contact?topic=partnership"
            className="tap-target inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
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
