import Link from "next/link";
import { ArrowRight, Medal, Trophy } from "lucide-react";
import { PosterImage } from "@/components/events/PosterImage";
import { RevealOnView } from "@/components/home/HomeMotion";
import { formatEventDate } from "@/lib/format";
import { eventResults } from "@/lib/events";
import type { Event } from "@/lib/types";

// Scoreboard: a header bar with the event, then one row per category with the champion large.
export function LatestResult({ event }: { event: Event }) {
  const rows = eventResults(event);
  const when = formatEventDate(event, { withRange: true });
  const meta = [when, event.venue].filter(Boolean).join(" · ");

  return (
    <section id="result" aria-labelledby="result-heading" className="scroll-mt-24 bg-[#0d2b2a] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <RevealOnView>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#79d8d5]">Latest result</p>
          <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-white/10">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#123a38] px-5 py-4 sm:px-8">
              <div className="min-w-0">
                <span className="inline-block rounded bg-white/10 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-200">
                  Full time
                </span>
                <h2 id="result-heading" className="mt-2 break-words text-4xl !font-extrabold text-white sm:text-5xl">
                  {event.name}
                </h2>
                {meta && <p className="mt-1 text-sm text-slate-400">{meta}</p>}
              </div>
              {event.bannerImage && (
                <div className="relative hidden h-28 w-40 shrink-0 overflow-hidden rounded-lg bg-black/40 sm:block">
                  <PosterImage src={event.bannerImage} alt={`${event.name} poster`} sizes="160px" />
                </div>
              )}
            </div>

            {rows.length > 0 ? (
              <ul className="divide-y divide-white/10 bg-[#0f302e]">
                {rows.map((row, index) => (
                  <li key={row.category ?? index} className="grid gap-x-6 gap-y-1 px-5 py-5 sm:grid-cols-[14rem_minmax(0,1fr)_minmax(0,16rem)] sm:items-center sm:px-8">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{row.category ?? "Champion"}</span>
                    <span className="flex min-w-0 items-center gap-3">
                      <Trophy aria-hidden className="h-6 w-6 shrink-0 text-[#79d8d5]" />
                      <span className="break-words font-display text-3xl font-extrabold uppercase leading-none text-white">
                        {row.places.winners.join(", ") || "Not listed"}
                      </span>
                    </span>
                    {row.places.runnersUp.length > 0 && (
                      <span className="flex min-w-0 items-center gap-2 text-sm text-slate-400">
                        <Medal aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="break-words">Runner-up: {row.places.runnersUp.join(", ")}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="bg-[#0f302e] px-5 py-6 text-slate-300 sm:px-8">Results for this event haven&rsquo;t been published yet.</p>
            )}
          </div>

          <Link
            href={`/events/${event.id}`}
            className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-white/80 px-6 font-semibold text-white transition hover:border-white hover:bg-white/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Full results &amp; photos
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </RevealOnView>
      </div>
    </section>
  );
}
