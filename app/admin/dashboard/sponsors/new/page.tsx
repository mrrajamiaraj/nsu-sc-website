import { GlassCard } from "@/components/ui/GlassCard";
import { SponsorForm } from "@/components/admin/sponsors/SponsorForm";
import { createSponsor } from "../actions";

export default function NewSponsorPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Add Sponsor</h1>
      <GlassCard className="mt-6">
        <SponsorForm action={createSponsor} />
      </GlassCard>
    </div>
  );
}
