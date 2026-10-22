import type { ReactNode } from "react";
import { Crown, Medal, Star, Trophy, Wallet } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/types";

export function SeasonSection({
  eyebrow,
  title,
  aside,
  children,
}: {
  eyebrow: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-blue-400">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
          </div>
          {aside}
        </Reveal>
        <Reveal>{children}</Reveal>
      </div>
    </section>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="glass-panel px-6 py-5 text-sm italic text-slate-400">{children}</p>;
}

export function SeasonStats({ event }: { event: Event }) {
  const stats = [
    { label: "Teams", value: event.teamCount },
    { label: "Athletes", value: event.participantCount },
    { label: "Matches", value: event.matchCount },
  ].filter((stat): stat is { label: string; value: number } => stat.value !== null);

  return (
    <SeasonSection eyebrow="Participation" title="Season statistics">
      {stats.length > 0 ? (
        <dl className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel px-6 py-5">
              <dt className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-400">{stat.label}</dt>
              <dd className="mt-1 font-display text-4xl font-semibold text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <EmptyNote>Participation figures have not been recorded for this season.</EmptyNote>
      )}
    </SeasonSection>
  );
}

const PLACES = [
  { key: "prizeFirst", label: "1st place", sub: "Champion", tone: "text-amber-300" },
  { key: "prizeSecond", label: "2nd place", sub: "Runner-up", tone: "text-slate-200" },
  { key: "prizeThird", label: "3rd place", sub: "Second runner-up", tone: "text-orange-300" },
] as const;

export function PrizeBreakdown({ event }: { event: Event }) {
  return (
    <SeasonSection
      eyebrow="Prize pool"
      title="Prize breakdown"
      aside={<span className="text-xs text-slate-400">Currency: BDT (৳)</span>}
    >
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="glass-panel flex flex-col justify-between gap-6 border-blue-400/30 bg-gradient-to-br from-blue-500/25 to-transparent p-6 sm:col-span-3 lg:col-span-2">
          <Wallet className="h-6 w-6 text-blue-300" />
          <div>
            <p className="text-sm text-slate-300">Total prize pool</p>
            <p className="mt-1 break-words font-display text-5xl font-semibold uppercase leading-none text-white">
              {event.prizePool ?? "TBA"}
            </p>
          </div>
        </div>
        {PLACES.map((place) => {
          const value = event[place.key];
          return (
            <div key={place.key} className="glass-panel flex flex-col p-5">
              <Trophy className={cn("h-5 w-5", place.tone)} />
              <p className="mt-3 text-sm font-semibold text-white">{place.label}</p>
              <p className="text-xs text-slate-400">{place.sub}</p>
              <p className={cn("mt-auto pt-6", value ? "text-lg font-semibold text-white" : "text-sm italic text-slate-500")}>
                {value ?? "Not announced"}
              </p>
            </div>
          );
        })}
      </div>
    </SeasonSection>
  );
}

const PODIUM = [
  // Visual order on wide screens is 2 · 1 · 3; on phones it stacks 1 · 2 · 3.
  { place: 2, field: "runnersUp", label: "Runner-up", icon: Medal, tone: "text-slate-200", block: "h-24 from-slate-300/25", order: "sm:order-1 order-2" },
  { place: 1, field: "winners", label: "Champion", icon: Crown, tone: "text-amber-300", block: "h-36 from-amber-400/30", order: "sm:order-2 order-1" },
  { place: 3, field: "secondRunnerUp", label: "Second runner-up", icon: Medal, tone: "text-orange-300", block: "h-16 from-orange-400/25", order: "order-3" },
] as const;

export function WinnersPodium({ event }: { event: Event }) {
  return (
    <SeasonSection eyebrow="Results" title="Winners">
      <ol className="grid gap-4 sm:grid-cols-3 sm:items-end">
        {PODIUM.map((spot) => {
          const name = event[spot.field];
          const Icon = spot.icon;
          return (
            <li key={spot.place} className={cn("flex flex-col gap-3", spot.order)}>
              <div className={cn("glass-panel px-5 py-5 text-center", spot.place === 1 && "border-amber-300/30 shadow-[0_0_40px_-12px_rgba(251,191,36,0.45)]")}>
                <Icon className={cn("mx-auto h-6 w-6", spot.tone)} />
                <p className="mt-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-400">{spot.label}</p>
                <p className={cn("mt-1 whitespace-pre-line", name ? "font-semibold text-white" : "text-sm italic text-slate-500")}>
                  {name ?? "To be confirmed"}
                </p>
              </div>
              <div
                aria-hidden
                className={cn(
                  "hidden items-start justify-center rounded-t-3xl border border-b-0 border-white/10 bg-gradient-to-b to-transparent pt-3 font-display text-5xl font-semibold sm:flex",
                  spot.block,
                  spot.tone,
                )}
              >
                {spot.place}
              </div>
            </li>
          );
        })}
      </ol>
      {event.manOfTournament && (
        <div className="glass-panel mt-4 flex items-center gap-4 px-5 py-4">
          <Star className="h-5 w-5 shrink-0 text-blue-300" />
          <p className="text-sm text-slate-300">
            Man of the tournament: <span className="font-semibold text-white">{event.manOfTournament}</span>
          </p>
        </div>
      )}
    </SeasonSection>
  );
}
