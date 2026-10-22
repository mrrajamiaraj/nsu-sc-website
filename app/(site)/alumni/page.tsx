import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { AlumniFilterView } from "@/components/alumni/AlumniFilterView";
import { LeadershipCTA } from "@/components/shared/LeadershipCTA";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAlumni, getAlumniClassYears } from "@/lib/data/alumni";
import { getRegistrationSettings } from "@/lib/data/registration";

export const metadata: Metadata = {
  title: "Alumni",
  description: "Past panels of NSU Games and Sports Club — the students who ran the club, and where they are now.",
};

export default async function AlumniPage() {
  const [alumni, classYears, registrationSettings] = await Promise.all([
    getAlumni(),
    getAlumniClassYears(),
    getRegistrationSettings(),
  ]);

  return (
    <>
      <PageHeader
        icon={GraduationCap}
        eyebrow="Alumni"
        title={
          <>
            Past <span className="text-gradient-brand">panels</span>
          </>
        }
        intro="The students who ran the club before, and where they are now."
      />

      <AlumniFilterView alumni={alumni} classYears={classYears} />

      <LeadershipCTA googleFormUrl={registrationSettings.googleFormUrl} />
    </>
  );
}
