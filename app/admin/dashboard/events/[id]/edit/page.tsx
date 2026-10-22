import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapEventRow } from "@/lib/mappers";
import { GlassCard } from "@/components/ui/GlassCard";
import { EventForm } from "@/components/admin/events/EventForm";
import { EventGalleryManager } from "@/components/admin/events/EventGalleryManager";
import { getAllSeries } from "@/lib/data/events";
import { addEventPhotos, removeEventPhoto, saveEventCaptions, updateEvent } from "../../actions";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await createClient();
  const [{ data: row }, series] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle(),
    getAllSeries(),
  ]);

  if (!row) notFound();
  const event = mapEventRow(row);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Event</h1>
        <GlassCard className="mt-6">
          <EventForm event={event} series={series} action={updateEvent.bind(null, id)} />
        </GlassCard>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Photo gallery</h2>
        <GlassCard className="mt-4">
          <EventGalleryManager
            photos={event.gallery}
            captions={event.galleryCaptions}
            bannerImage={event.bannerImage}
            onAdd={addEventPhotos.bind(null, id)}
            onRemove={removeEventPhoto.bind(null, id)}
            onSaveCaptions={saveEventCaptions.bind(null, id)}
          />
        </GlassCard>
      </div>
    </div>
  );
}
