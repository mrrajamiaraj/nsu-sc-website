import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapPanelRow } from "@/lib/mappers";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ActivatePanelButton } from "@/components/admin/members/ActivatePanelButton";
import { activatePanel } from "../actions";

export default async function PanelsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("panels").select("*").order("created_at", { ascending: false });
  const panels = (rows ?? []).map(mapPanelRow);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Panels</h1>
        <Button href="/admin/dashboard/members/panels/new" size="sm">
          <Plus className="h-4 w-4" />
          Add Panel
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {panels.map((panel) => (
          <GlassCard key={panel.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-white">{panel.name}</p>
              <p className="text-xs text-slate-500">{panel.isActive ? "Active" : "Archived"}</p>
            </div>
            {!panel.isActive && <ActivatePanelButton panelId={panel.id} action={activatePanel} />}
          </GlassCard>
        ))}
        {!panels.length && <p className="text-center text-sm text-slate-500">No panels yet.</p>}
      </div>
    </div>
  );
}
