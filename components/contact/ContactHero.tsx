import { Mail } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

export function ContactHero() {
  return (
    <div className="px-4 pb-12 pt-4 text-center">
      <Reveal y={16}>
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-300">
          <Mail className="h-3.5 w-3.5 text-blue-400" />
          Contact
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
          Talk to the <span className="text-gradient-brand">panel</span>
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Questions about squads, trials, events or partnerships go straight to the club panel.
        </p>
      </Reveal>
    </div>
  );
}
