import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { MemberForm } from "@/components/admin/members/MemberForm";
import { createMember } from "../actions";

export default async function NewMemberPage() {
  const supabase = await createClient();
  const { data: teams } = await supabase.from("teams").select("id, name").order("name");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Add Member</h1>
      <GlassCard className="mt-6">
        <MemberForm action={createMember} teams={teams ?? []} />
      </GlassCard>
    </div>
  );
}
