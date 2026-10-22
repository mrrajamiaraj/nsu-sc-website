import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { SeriesForm } from "@/components/admin/events/SeriesForm";
import { getSeriesById } from "@/lib/data/events";
import { updateSeries } from "../../actions";

export default async function EditSeriesPage({ params }: { params: { id: string } }) {
  const series = await getSeriesById(params.id);
  if (!series) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Edit Event Series</h1>
      <GlassCard className="mt-6">
        <SeriesForm series={series} action={updateSeries.bind(null, series.id)} />
      </GlassCard>
    </div>
  );
}
