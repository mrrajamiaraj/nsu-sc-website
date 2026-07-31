import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapEventRow } from "@/lib/mappers";
import { GlassCard } from "@/components/ui/GlassCard";
import { EventForm } from "@/components/admin/events/EventForm";
import { updateEvent } from "../../actions";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase.from("events").select("*").eq("id", id).maybeSingle();

  if (!row) notFound();
  const event = mapEventRow(row);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Edit Event</h1>
      <GlassCard className="mt-6">
        <EventForm event={event} action={updateEvent.bind(null, id)} />
      </GlassCard>
    </div>
  );
}
