import { GlassCard } from "@/components/ui/GlassCard";
import { AlumniForm } from "@/components/admin/alumni/AlumniForm";
import { createAlumni } from "../actions";

export default function NewAlumniPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Add Alumnus</h1>
      <GlassCard className="mt-6">
        <AlumniForm action={createAlumni} />
      </GlassCard>
    </div>
  );
}
