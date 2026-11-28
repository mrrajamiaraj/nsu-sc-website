import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { Magnetic } from "@/components/contact/interaction/Pointer";
import { trialsHref } from "@/components/teams/squad-select/shared";
import type { ClubRegistration } from "@/lib/registration";
import type { SquadHonour } from "@/lib/squads";

// Record: this squad's honours from the achievements on file. Match results and fixtures
// aren't recorded per squad yet, so that part is one line rather than empty boxes.
export function SquadRecord({ honours }: { honours: SquadHonour[] }) {
  return (
    <section aria-labelledby="record-heading" className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6 lg:mt-32 lg:px-8">
      <h2 id="record-heading" className="text-[40px] !font-extrabold leading-none text-[#f5f1e8] md:text-[56px]">
        Record
      </h2>
      {honours.length > 0 && (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {honours.map((h) => (
            <li key={h.id}>
              <Link
                href={h.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0f302e] p-5 hover:-translate-y-0.5 hover:border-[#3fcfca]/50"
              >
                <span aria-hidden className="pointer-events-none absolute -right-2 -top-3 select-none font-display text-[96px] font-extrabold leading-none text-[#f5f1e8]/[0.06] transition-colors group-hover:text-[#3fcfca]/15">
                  {h.year ?? ""}
                </span>
                <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#3fcfca]">
                  <Trophy aria-hidden className="h-4 w-4" />
                  {h.type === "title" ? "Champions" : "Runners-up"}
                  {h.year && <span className="text-[#f5f1e8]/50">· {h.year}</span>}
                </span>
                <span className="relative mt-3 text-[17px] font-semibold leading-snug text-[#f5f1e8] group-hover:text-[#3fcfca]">{h.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-[16px] text-[#f5f1e8]/60">Results will appear here after the next tournament.</p>
    </section>
  );
}

export function SquadCta({ sport, teamName, club }: { sport: string; teamName: string; club: ClubRegistration }) {
  const ask = trialsHref({ teamName });
  const primary =
    "group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#3fcfca] px-7 text-[16px] font-semibold text-[#002e2c] hover:bg-[#6fe0dc]";
  const label = `Join ${sport.toLowerCase()} trials`;
  return (
    <section aria-labelledby="squad-cta-heading" className="mx-auto mt-24 max-w-[1280px] px-4 sm:px-6 lg:mt-32 lg:px-8">
      <div className="border-t border-white/15 pt-12 lg:flex lg:items-end lg:justify-between lg:gap-10 lg:pt-16">
        <div>
          <h2 id="squad-cta-heading" className="max-w-3xl text-[44px] !font-extrabold leading-[0.92] text-[#f5f1e8] md:text-[64px]">
            Want to play {sport.toLowerCase()} for NSU?
          </h2>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-[#f5f1e8]/75">{club.body}</p>
        </div>
        <div className="mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0">
          <Magnetic>
            {club.formUrl ? (
              <a href={club.formUrl} target="_blank" rel="noopener noreferrer" data-haptic className={primary}>
                {label}
                <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                <span className="sr-only">(opens the sign-up form)</span>
              </a>
            ) : (
              <Link href={ask} data-haptic className={primary}>
                {label}
                <ArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </Magnetic>
          <Link
            href={ask}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-[#f5f1e8]/70 px-7 text-[16px] font-semibold text-[#f5f1e8] hover:-translate-y-0.5 hover:border-[#f5f1e8] hover:bg-white/10"
          >
            Ask about this squad
          </Link>
        </div>
      </div>
    </section>
  );
}
