import { GlassCard } from "@/components/ui/GlassCard";
import { MemberForm } from "@/components/admin/members/MemberForm";
import { createMember } from "../actions";

export default function NewMemberPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Add Member</h1>
      <GlassCard className="mt-6">
        <MemberForm action={createMember} />
      </GlassCard>
    </div>
  );
}
