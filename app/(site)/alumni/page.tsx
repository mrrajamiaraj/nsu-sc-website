import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { AlumniFilterView } from "@/components/alumni/AlumniFilterView";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { Reveal } from "@/components/motion/Reveal";
import { getAlumni, getAlumniClassYears } from "@/lib/data/alumni";
import { getRegistrationSettings } from "@/lib/data/registration";

export const metadata: Metadata = {
  title: "Alumni",
};

export default async function AlumniPage() {
  const [alumni, classYears, registrationSettings] = await Promise.all([
    getAlumni(),
    getAlumniClassYears(),
    getRegistrationSettings(),
  ]);

  return (
    <>
      <div className="px-4 pb-12 pt-4 text-center">
        <Reveal y={16}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-slate-300">
            <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
            Alumni
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
            Past <span className="text-gradient-brand">panels</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            The students who ran the club before, and where they are now.
          </p>
        </Reveal>
      </div>

      <AlumniFilterView alumni={alumni} classYears={classYears} />

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
