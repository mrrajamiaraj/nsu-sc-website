import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapAlumniClassYearRow } from "@/lib/mappers";
import { GlassCard } from "@/components/ui/GlassCard";
import { ClassYearForm } from "@/components/admin/alumni/ClassYearForm";
import { updateClassYear } from "../../../actions";

export default async function EditClassYearPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase.from("alumni_class_years").select("*").eq("id", id).maybeSingle();
  if (!row) notFound();
  const classYear = mapAlumniClassYearRow(row);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-white">Edit Class Year</h1>
      <GlassCard className="mt-6">
        <ClassYearForm classYear={classYear} action={updateClassYear.bind(null, id)} />
      </GlassCard>
    </div>
  );
}
