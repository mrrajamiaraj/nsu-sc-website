import { Trophy } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

export function AboutHero() {
  return (
    <div className="px-4 pb-12 pt-4 text-center">
      <Reveal y={16}>
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
          <Trophy className="h-3.5 w-3.5 text-amber-300" />
          About Us
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">
          North South University
          <br />
          <span className="text-gradient-brand">Games and Sports Club</span>
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Empowering students through sports excellence, teamwork, and competitive spirit since 1992.
        </p>
      </Reveal>
    </div>
  );
}
