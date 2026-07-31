import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapMemberRow } from "@/lib/mappers";
import { GlassCard } from "@/components/ui/GlassCard";
import { MemberForm } from "@/components/admin/members/MemberForm";
import { updateMember } from "../../actions";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase.from("members").select("*").eq("id", id).maybeSingle();
  if (!row) notFound();
  const member = mapMemberRow(row);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Edit Member</h1>
      <GlassCard className="mt-6">
        <MemberForm member={member} action={updateMember.bind(null, id)} />
      </GlassCard>
    </div>
  );
}
