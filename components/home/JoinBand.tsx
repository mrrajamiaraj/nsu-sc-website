import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { JOIN_LABEL, type ClubRegistration } from "@/lib/registration";

// The navbar's "Register" button points at #register, so this band carries that id.
// Open: the club form first. Closed: the panel is the way in, the squads are the
// place to see what each sport looks for.
export function JoinBand({ club }: { club: ClubRegistration }) {
  return (
    <section id="register" className="scroll-mt-28 px-4 pb-20">
      <Reveal className="mx-auto max-w-6xl">
        <div className="glass-panel flex flex-col gap-6 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.16em] text-blue-400">
              <span
                aria-hidden
                className={club.open ? "h-2 w-2 rounded-full bg-green-400" : "h-2 w-2 rounded-full bg-slate-500"}
              />
              {club.open ? "Sign-ups open" : "Sign-ups closed"}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Play for NSU</h2>
            <p className="mt-3 text-slate-400">{club.body}</p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            {club.formUrl ? (
              <>
                <Button href={club.formUrl} target="_blank" rel="noopener noreferrer" size="lg">
                  {JOIN_LABEL}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/contact" variant="secondary" size="lg">
                  Ask the panel
                </Button>
              </>
            ) : (
              <>
                <Button href="/contact" size="lg">
                  Ask the panel
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/teams" variant="secondary" size="lg">
                  Browse the teams
                </Button>
              </>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
