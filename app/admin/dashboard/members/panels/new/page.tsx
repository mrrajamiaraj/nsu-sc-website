import { GlassCard } from "@/components/ui/GlassCard";
import { PanelForm } from "@/components/admin/members/PanelForm";
import { createPanel } from "../../actions";

export default function NewPanelPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-white">Add Panel</h1>
      <GlassCard className="mt-6">
        <PanelForm action={createPanel} />
      </GlassCard>
    </div>
  );
}
