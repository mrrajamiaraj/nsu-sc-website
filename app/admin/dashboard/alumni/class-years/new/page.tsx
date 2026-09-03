import { GlassCard } from "@/components/ui/GlassCard";
import { ClassYearForm } from "@/components/admin/alumni/ClassYearForm";
import { createClassYear } from "../../actions";

export default function NewClassYearPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-white">Add Class Year</h1>
      <GlassCard className="mt-6">
        <ClassYearForm action={createClassYear} />
      </GlassCard>
    </div>
  );
}
