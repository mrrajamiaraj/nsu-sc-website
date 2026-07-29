import { ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeroProps {
  tagline: string;
}

export function Hero({ tagline }: HeroProps) {
  return (
    <section className="px-4 pb-20 pt-10 sm:pb-28 sm:pt-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
          <Trophy className="h-3.5 w-3.5 text-amber-300" />
          North South University
        </div>

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
          NSU <span className="text-gradient-brand">Sports Club</span>
        </h1>

        <p className="mt-6 max-w-xl text-balance text-lg text-slate-400 sm:text-xl">{tagline}</p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button href="/events" size="lg">
            Explore Events
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="/teams" variant="secondary" size="lg">
            Meet the Teams
          </Button>
        </div>
      </div>
    </section>
  );
}
