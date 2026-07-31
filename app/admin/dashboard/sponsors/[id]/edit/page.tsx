import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapSponsorRow } from "@/lib/mappers";
import { GlassCard } from "@/components/ui/GlassCard";
import { SponsorForm } from "@/components/admin/sponsors/SponsorForm";
import { updateSponsor } from "../../actions";

export default async function EditSponsorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase.from("sponsors").select("*").eq("id", id).maybeSingle();
  if (!row) notFound();
  const sponsor = mapSponsorRow(row);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Edit Sponsor</h1>
      <GlassCard className="mt-6">
        <SponsorForm sponsor={sponsor} action={updateSponsor.bind(null, id)} />
      </GlassCard>
    </div>
  );
}
