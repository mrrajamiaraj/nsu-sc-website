import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { mapAlumniClassYearRow } from "@/lib/mappers";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlumniForm } from "@/components/admin/alumni/AlumniForm";
import { createAlumni } from "../actions";

export default async function NewAlumniPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("alumni_class_years").select("*").order("sort_order");
  const classYears = (rows ?? []).map(mapAlumniClassYearRow);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Add Alumnus</h1>
      {classYears.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 text-sm text-amber-300">
          No class years exist yet.{" "}
          <Link href="/admin/dashboard/alumni/class-years/new" className="underline">
            Add one
          </Link>{" "}
          before adding an alumnus.
        </p>
      ) : (
        <GlassCard className="mt-6">
          <AlumniForm classYears={classYears} action={createAlumni} />
        </GlassCard>
      )}
    </div>
  );
}
