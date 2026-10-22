import { Award, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow } from "@/components/ui/PageHeader";

// Closing call to action on every public page except Home, which has its own Join band.
export function LeadershipCTA({ googleFormUrl }: { googleFormUrl: string | null }) {
  const getInvolvedHref = googleFormUrl ?? "/members";

  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <GlassCard className="flex flex-col items-center gap-6 p-10 text-center sm:p-14">
            <Eyebrow icon={Award} iconClassName="" className="text-teal-300">
              Join Our Team
            </Eyebrow>

            <h2 className="text-3xl font-bold text-white sm:text-4xl">Interested in Leadership?</h2>

            <p className="max-w-xl text-slate-400">
              We&rsquo;re always looking for passionate individuals to join our executive panel. Elections are
              held annually.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                href={getInvolvedHref}
                target={googleFormUrl ? "_blank" : undefined}
                rel={googleFormUrl ? "noopener noreferrer" : undefined}
                size="lg"
              >
                Get Involved
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/members" variant="secondary" size="lg">
                Learn More
              </Button>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
