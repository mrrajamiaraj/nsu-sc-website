import { GlassCard } from "@/components/ui/GlassCard";
import { SeriesForm } from "@/components/admin/events/SeriesForm";
import { createSeries } from "../actions";

export default function NewSeriesPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Add Event Series</h1>
      <GlassCard className="mt-6">
        <SeriesForm action={createSeries} />
      </GlassCard>
    </div>
  );
}
