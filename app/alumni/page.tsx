import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { AlumniFilterView } from "@/components/alumni/AlumniFilterView";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { Reveal } from "@/components/motion/Reveal";
import { getAlumni } from "@/lib/data/alumni";
import { getRegistrationSettings } from "@/lib/data/registration";

export const metadata: Metadata = {
  title: "Alumni",
};

export default async function AlumniPage() {
  const [alumni, registrationSettings] = await Promise.all([getAlumni(), getRegistrationSettings()]);
  const years = Array.from(new Set(alumni.map((profile) => profile.graduationYear))).sort((a, b) => b - a);

  return (
    <>
      <div className="px-4 pb-12 pt-4 text-center">
        <Reveal y={16}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
            <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
            Our Alumni
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
            Where They Are <span className="text-gradient-brand">Now</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            NSU SC&rsquo;s legacy carries on through the athletes who once wore the jersey.
          </p>
        </Reveal>
      </div>

      <AlumniFilterView alumni={alumni} years={years} />

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
