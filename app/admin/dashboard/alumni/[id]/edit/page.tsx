import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapAlumniClassYearRow, mapAlumniRow } from "@/lib/mappers";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlumniForm } from "@/components/admin/alumni/AlumniForm";
import { updateAlumni } from "../../actions";

export default async function EditAlumniPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: row }, { data: classYearRows }] = await Promise.all([
    supabase.from("alumni").select("*, alumni_class_years(label)").eq("id", id).maybeSingle(),
    supabase.from("alumni_class_years").select("*").order("sort_order"),
  ]);
  if (!row) notFound();
  const alumnus = mapAlumniRow(row);
  const classYears = (classYearRows ?? []).map(mapAlumniClassYearRow);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Edit Alumnus</h1>
      <GlassCard className="mt-6">
        <AlumniForm alumnus={alumnus} classYears={classYears} action={updateAlumni.bind(null, id)} />
      </GlassCard>
    </div>
  );
}
