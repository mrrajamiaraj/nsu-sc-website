import type { ReactNode } from "react";
import { Crown, Medal, Star, Trophy, Wallet, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { eventResults, RESULT_PLACES, type ResultPlace } from "@/lib/events";
import type { Event } from "@/lib/types";

export function SeasonSection({
  id,
  eyebrow,
  title,
  aside,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 px-4 pb-16">
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

// Plain amounts are stored as digits ("75000"); anything else is shown as entered.
function formatPrize(value: string): string {
  return /^\d+$/.test(value) ? `৳${Number(value).toLocaleString("en-US")}` : value;
}

const PRIZES = [
  { key: "prizeFirst", label: "1st place", tone: "text-amber-300" },
  { key: "prizeSecond", label: "2nd place", tone: "text-slate-200" },
  { key: "prizeThird", label: "3rd place", tone: "text-orange-300" },
] as const;

// Only the amounts the admin recorded; legacy events usually have none, and then
// the section is left out rather than filled with "TBA".
export function PrizeBreakdown({ event }: { event: Event }) {
  const places = PRIZES.filter((place) => event[place.key]);
  if (!event.prizePool && places.length === 0) return null;

  return (
    <SeasonSection eyebrow="Prize pool" title="Prize money" aside={<span className="text-xs text-slate-400">Amounts in BDT (৳)</span>}>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {event.prizePool && (
          <div className="glass-panel flex flex-col gap-4 border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-transparent p-5">
            <Wallet aria-hidden className="h-5 w-5 text-blue-300" />
            <div>
              <dt className="text-sm text-slate-300">Total prize pool</dt>
              <dd className="mt-1 break-words font-display text-4xl font-semibold leading-none text-white">
                {formatPrize(event.prizePool)}
              </dd>
            </div>
          </div>
        )}
        {places.map((place) => (
          <div key={place.key} className="glass-panel flex flex-col gap-4 p-5">
            <Trophy aria-hidden className={cn("h-5 w-5", place.tone)} />
            <div>
              <dt className="text-sm text-slate-300">{place.label}</dt>
              <dd className="mt-1 break-words font-display text-3xl font-semibold leading-none text-white">
                {formatPrize(event[place.key]!)}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </SeasonSection>
  );
}

const PLACE_LABELS: Record<ResultPlace, { label: string; icon: LucideIcon; tone: string }> = {
  winners: { label: "Champion", icon: Crown, tone: "text-amber-300" },
  runnersUp: { label: "Runner-up", icon: Medal, tone: "text-slate-200" },
  secondRunnerUp: { label: "2nd runner-up", icon: Medal, tone: "text-orange-300" },
};

// Published results, one card per category. A place nobody filled in for that
// category says "Not listed" instead of being guessed.
export function EventResults({ event }: { event: Event }) {
  const rows = eventResults(event);
  if (rows.length === 0 && !event.manOfTournament) return null;

  const places = RESULT_PLACES.filter((place) => rows.some((row) => row.places[place].length > 0));
  const categorized = rows.some((row) => row.category);

  return (
    <SeasonSection id="results" eyebrow="Results" title={categorized ? "Winners by category" : "Winners"}>
      {rows.length > 0 && (
        <ul className={cn("grid gap-4", rows.length > 1 && "sm:grid-cols-2", rows.length > 2 && "lg:grid-cols-3")}>
          {rows.map((row, index) => (
            <li key={row.category ?? index} className="glass-panel min-w-0 p-5">
              {row.category && (
                <h3 className="font-display text-xl font-semibold uppercase leading-tight text-white">{row.category}</h3>
              )}
              <dl className={cn("divide-y divide-white/10", row.category && "mt-2")}>
                {places.map((place) => {
                  const { label, icon: Icon, tone } = PLACE_LABELS[place];
                  const entries = row.places[place];
                  return (
                    <div key={place} className="flex items-start gap-3 py-2.5">
                      <Icon aria-hidden className={cn("mt-0.5 h-4 w-4 shrink-0", tone)} />
                      <dt className="w-28 shrink-0 pt-0.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-400">
                        {label}
                      </dt>
                      <dd className="min-w-0 whitespace-pre-line break-words font-semibold text-white">
                        {entries.length > 0 ? entries.join("\n") : <span className="font-normal italic text-slate-400">Not listed</span>}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </li>
          ))}
        </ul>
      )}
      {event.manOfTournament && (
        <p className="glass-panel mt-4 flex items-center gap-3 px-5 py-4 text-sm text-slate-300">
          <Star aria-hidden className="h-5 w-5 shrink-0 text-blue-300" />
          <span>
            Man of the tournament:<span className="font-semibold text-white">{event.manOfTournament}</span>
          </span>
        </p>
      )}
    </SeasonSection>
  );
}
