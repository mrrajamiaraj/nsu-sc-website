import { GlassCard } from "@/components/ui/GlassCard";
import { EventForm } from "@/components/admin/events/EventForm";
import { getAllSeries } from "@/lib/data/events";
import { createEvent } from "../actions";

export default async function NewEventPage() {
  const series = await getAllSeries();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Add Event</h1>
      <p className="mt-1 text-sm text-slate-400">You can add more photos from the edit page after creating it.</p>
      <GlassCard className="mt-6">
        <EventForm series={series} action={createEvent} />
      </GlassCard>
    </div>
  );
}
