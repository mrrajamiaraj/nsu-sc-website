import { GlassCard } from "@/components/ui/GlassCard";
import { EventForm } from "@/components/admin/events/EventForm";
import { createEvent } from "../actions";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Add Event</h1>
      <GlassCard className="mt-6">
        <EventForm action={createEvent} />
      </GlassCard>
    </div>
  );
}
