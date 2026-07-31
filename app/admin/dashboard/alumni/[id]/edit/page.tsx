import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapAlumniRow } from "@/lib/mappers";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlumniForm } from "@/components/admin/alumni/AlumniForm";
import { updateAlumni } from "../../actions";

export default async function EditAlumniPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase.from("alumni").select("*").eq("id", id).maybeSingle();
  if (!row) notFound();
  const alumnus = mapAlumniRow(row);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Edit Alumnus</h1>
      <GlassCard className="mt-6">
        <AlumniForm alumnus={alumnus} action={updateAlumni.bind(null, id)} />
      </GlassCard>
    </div>
  );
}
