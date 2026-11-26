import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { AlumniFilterView } from "@/components/alumni/AlumniFilterView";
import { ClosingCTA } from "@/components/shared/ClosingCTA";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAlumni, getAlumniClassYears } from "@/lib/data/alumni";

export const metadata: Metadata = {
  title: "Alumni",
  description: "Past panels of NSU Games and Sports Club — the students who ran the club, and where they are now.",
};

export default async function AlumniPage() {
  const [alumni, classYears] = await Promise.all([
    getAlumni(),
    getAlumniClassYears(),
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

      <ClosingCTA
        icon={GraduationCap}
        eyebrow="Alumni"
        title="Were you on a past panel?"
        body="If you're missing from this list or your details are out of date, message the current panel so it can be updated."
        primary={{ label: "Contact the panel", href: "/contact" }}
        secondary={{ label: "Meet the current panel", href: "/members" }}
      />
    </>
  );
}
