import { createClient } from "@/lib/supabase/server";
import { mapEventRow } from "@/lib/mappers";
import { GlassCard } from "@/components/ui/GlassCard";
import { HomeContentForm } from "@/components/admin/HomeContentForm";
import { updateHomeContent } from "./actions";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const { data: taglineRow } = await supabase
    .from("site_content")
    .select("content")
    .eq("page_key", "home_tagline")
    .maybeSingle();
  const { data: featuredRow } = await supabase
    .from("site_content")
    .select("featured_event_id")
    .eq("page_key", "home_featured_event")
    .maybeSingle();
  const { data: eventRows } = await supabase.from("events").select("*").order("date", { ascending: false });
  const events = (eventRows ?? []).map(mapEventRow);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Home Content</h1>
      <GlassCard className="mt-6">
        <HomeContentForm
          tagline={taglineRow?.content ?? ""}
          featuredEventId={(featuredRow?.featured_event_id as string | null) ?? null}
          events={events}
          action={updateHomeContent}
        />
      </GlassCard>
    </div>
  );
}
