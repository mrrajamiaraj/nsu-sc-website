import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { AboutHistoryForm } from "@/components/admin/about/AboutHistoryForm";
import { AboutGalleryManager } from "@/components/admin/about/AboutGalleryManager";
import { updateAboutContent, addAboutImage, removeAboutImage } from "./actions";

export default async function AdminAboutPage() {
  const supabase = await createClient();
  const { data: historyRow } = await supabase
    .from("site_content")
    .select("content")
    .eq("page_key", "about_history")
    .maybeSingle();
  const { data: galleryRow } = await supabase
    .from("site_content")
    .select("images")
    .eq("page_key", "about_gallery")
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">About Page</h1>
        <GlassCard className="mt-6">
          <AboutHistoryForm defaultValue={historyRow?.content ?? ""} action={updateAboutContent} />
        </GlassCard>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Image Gallery</h2>
        <GlassCard className="mt-4">
          <AboutGalleryManager
            images={(galleryRow?.images as string[] | null) ?? []}
            onAdd={addAboutImage}
            onRemove={removeAboutImage}
          />
        </GlassCard>
      </div>
    </div>
  );
}
