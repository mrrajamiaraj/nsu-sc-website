import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/format";
import type { RegistrationSettings } from "@/lib/types";

// The navbar's "Register" button points at #register, so this band carries that id.
export function JoinBand({ registration }: { registration: RegistrationSettings }) {
  const formUrl = registration.isOpen ? registration.googleFormUrl : null;

  return (
    <section id="register" className="scroll-mt-28 px-4 pb-20">
      <Reveal className="mx-auto max-w-6xl">
        <div className="glass-panel flex flex-col gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-blue-400">Join the club</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Play for NSU</h2>
            <p className="mt-3 text-slate-400">
              {registration.isOpen
                ? "Registration is open. Sign up and the panel will get in touch about trials for your sport."
                : registration.nextIntakeDate
                  ? `Registration is closed for now. The next intake opens ${formatDate(registration.nextIntakeDate)}.`
                  : "Registration is closed for now. Follow the events page or contact the panel to hear when it reopens."}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            {formUrl ? (
              <Button href={formUrl} target="_blank" rel="noopener noreferrer" size="lg">
                Register now
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button href="/events" size="lg">
                See what&rsquo;s on
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <Button href="/contact" variant="secondary" size="lg">
              Ask the panel
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
