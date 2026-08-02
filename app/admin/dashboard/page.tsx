import { createClient } from "@/lib/supabase/server";
import { mapEventRow } from "@/lib/mappers";
import { GlassCard } from "@/components/ui/GlassCard";
import { HomeContentForm } from "@/components/admin/HomeContentForm";
import { SiteLogoManager } from "@/components/admin/SiteLogoManager";
import { updateHomeContent, updateSiteLogo, removeSiteLogo } from "./actions";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const { data: logoRow } = await supabase
    .from("site_content")
    .select("content")
    .eq("page_key", "site_logo")
    .maybeSingle();
  const { data: taglineRow } = await supabase
    .from("site_content")
    .select("content")
    .eq("page_key", "home_tagline")
    .maybeSingle();
  const { data: orgNameRow } = await supabase
    .from("site_content")
    .select("content")
    .eq("page_key", "home_badge")
    .maybeSingle();
  const { data: videoRow } = await supabase
    .from("site_content")
    .select("content")
    .eq("page_key", "home_video_url")
    .maybeSingle();
  const { data: featuredRow } = await supabase
    .from("site_content")
    .select("featured_event_id")
    .eq("page_key", "home_featured_event")
    .maybeSingle();
  const { data: eventRows } = await supabase.from("events").select("*").order("date", { ascending: false });
  const events = (eventRows ?? []).map(mapEventRow);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Site Logo</h1>
        <GlassCard className="mt-6">
          <SiteLogoManager logoUrl={logoRow?.content ?? ""} onUpload={updateSiteLogo} onRemove={removeSiteLogo} />
        </GlassCard>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Home Content</h2>
        <GlassCard className="mt-4">
          <HomeContentForm
            tagline={taglineRow?.content ?? ""}
            orgName={orgNameRow?.content ?? ""}
            videoUrl={videoRow?.content ?? ""}
            featuredEventId={(featuredRow?.featured_event_id as string | null) ?? null}
            events={events}
            action={updateHomeContent}
          />
        </GlassCard>
      </div>
    </div>
  );
}
