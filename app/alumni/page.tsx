import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import { getAlumni } from "@/lib/data/alumni";

export const metadata: Metadata = {
  title: "Alumni",
};

export default async function AlumniPage() {
  const alumni = await getAlumni();

  return (
    <>
      <div className="px-4 pb-12 pt-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
          <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
          Our Alumni
        </div>
        <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
          Where They Are <span className="text-gradient-brand">Now</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          NSU SC&rsquo;s legacy carries on through the athletes who once wore the jersey.
        </p>
      </div>

      <div className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {alumni.map((profile) => (
            <AlumniCard key={profile.id} alumni={profile} />
          ))}
        </div>
      </div>
    </>
  );
}
