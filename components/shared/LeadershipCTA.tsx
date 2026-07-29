import { Award, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

// Reference design: design reference/lower 1.png — shown at the bottom of
// every page except Home, which has its own Newsletter CTA instead.
export function LeadershipCTA({ googleFormUrl }: { googleFormUrl: string | null }) {
  const getInvolvedHref = googleFormUrl ?? "/members";

  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <GlassCard className="flex flex-col items-center gap-6 p-10 text-center sm:p-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-teal-300">
              <Award className="h-3.5 w-3.5" />
              Join Our Team
            </div>

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
